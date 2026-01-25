-- Create challenge status enum
CREATE TYPE challenge_status AS ENUM ('waiting', 'active', 'completed', 'cancelled');

-- Create challenges table
CREATE TABLE IF NOT EXISTS public.challenges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  host_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  guest_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  bet_amount INTEGER NOT NULL CHECK (bet_amount >= 0),
  status challenge_status DEFAULT 'waiting' NOT NULL,
  
  -- Results
  host_score INTEGER,
  guest_score INTEGER,
  host_time_seconds INTEGER,
  guest_time_seconds INTEGER,
  
  winner_id UUID REFERENCES public.profiles(id),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.challenges;

-- Enable RLS
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Challenges are viewable by everyone" ON public.challenges
  FOR SELECT USING (true);

CREATE POLICY "Hosts can create challenges" ON public.challenges
  FOR INSERT WITH CHECK (auth.uid() = host_id);

CREATE POLICY "Participants can update challenges" ON public.challenges
  FOR UPDATE USING (auth.uid() = host_id OR auth.uid() = guest_id);

-- 1. Function to Create Challenge (Deduct Host Bet)
CREATE OR REPLACE FUNCTION create_challenge(p_quiz_id UUID, p_bet_amount INTEGER)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_challenge_id UUID;
  v_balance INTEGER;
BEGIN
  -- Check balance
  SELECT zcoin INTO v_balance FROM public.profiles WHERE id = auth.uid();
  IF v_balance < p_bet_amount THEN
    RAISE EXCEPTION 'Insufficient ZCoin balance';
  END IF;

  -- Deduct ZCoin from Host
  IF p_bet_amount > 0 THEN
    PERFORM public.add_zcoin(auth.uid(), -p_bet_amount);
  END IF;

  -- Create Challenge
  INSERT INTO public.challenges (quiz_id, host_id, bet_amount, status)
  VALUES (p_quiz_id, auth.uid(), p_bet_amount, 'waiting')
  RETURNING id INTO v_challenge_id;

  RETURN v_challenge_id;
END;
$$;

-- 2. Function to Join Challenge (Deduct Guest Bet)
CREATE OR REPLACE FUNCTION join_challenge(p_challenge_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_challenge RECORD;
  v_balance INTEGER;
BEGIN
  SELECT * INTO v_challenge FROM public.challenges WHERE id = p_challenge_id FOR UPDATE;
  
  IF v_challenge.status != 'waiting' THEN
    RAISE EXCEPTION 'Challenge is not available';
  END IF;
  
  IF v_challenge.host_id = auth.uid() THEN
    RAISE EXCEPTION 'Cannot join your own challenge';
  END IF;

  -- Check balance
  SELECT zcoin INTO v_balance FROM public.profiles WHERE id = auth.uid();
  IF v_balance < v_challenge.bet_amount THEN
    RAISE EXCEPTION 'Insufficient ZCoin balance';
  END IF;

  -- Deduct ZCoin from Guest
  IF v_challenge.bet_amount > 0 THEN
    PERFORM public.add_zcoin(auth.uid(), -v_challenge.bet_amount);
  END IF;

  -- Update Challenge
  UPDATE public.challenges
  SET guest_id = auth.uid(),
      status = 'active',
      updated_at = NOW()
  WHERE id = p_challenge_id;

  RETURN TRUE;
END;
$$;

-- 3. Function to Submit Results & Settle
CREATE OR REPLACE FUNCTION submit_challenge_result(p_challenge_id UUID, p_score INTEGER, p_time_seconds INTEGER)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_challenge RECORD;
  v_is_host BOOLEAN;
  v_winner_id UUID;
BEGIN
  SELECT * INTO v_challenge FROM public.challenges WHERE id = p_challenge_id FOR UPDATE;
  
  IF v_challenge.status != 'active' THEN
     -- Allow submission if just became completed? No.
     RAISE EXCEPTION 'Challenge is not active (Status: %)', v_challenge.status;
  END IF;

  -- Update appropriate fields
  IF v_challenge.host_id = auth.uid() THEN
    v_is_host := TRUE;
    UPDATE public.challenges SET host_score = p_score, host_time_seconds = p_time_seconds WHERE id = p_challenge_id;
    v_challenge.host_score := p_score;
    v_challenge.host_time_seconds := p_time_seconds;
  ELSIF v_challenge.guest_id = auth.uid() THEN
    v_is_host := FALSE;
    UPDATE public.challenges SET guest_score = p_score, guest_time_seconds = p_time_seconds WHERE id = p_challenge_id;
    v_challenge.guest_score := p_score;
    v_challenge.guest_time_seconds := p_time_seconds;
  ELSE
    RAISE EXCEPTION 'Not a participant';
  END IF;

  -- Check if BOTH have finished
  IF v_challenge.host_score IS NOT NULL AND v_challenge.guest_score IS NOT NULL THEN
    
    -- Determine Winner
    IF v_challenge.host_score > v_challenge.guest_score THEN
      v_winner_id := v_challenge.host_id;
    ELSIF v_challenge.guest_score > v_challenge.host_score THEN
      v_winner_id := v_challenge.guest_id;
    ELSE
      -- Score Tie: Check Time (Lower is better)
      IF v_challenge.host_time_seconds < v_challenge.guest_time_seconds THEN
        v_winner_id := v_challenge.host_id;
      ELSIF v_challenge.guest_time_seconds < v_challenge.host_time_seconds THEN
        v_winner_id := v_challenge.guest_id;
      ELSE
         -- Perfect Tie: No winner
         v_winner_id := NULL;
      END IF;
    END IF;

    -- Settle Bets
    IF v_winner_id IS NOT NULL THEN
      -- Winner takes all (2 * bet)
      IF v_challenge.bet_amount > 0 THEN
        PERFORM public.add_zcoin(v_winner_id, v_challenge.bet_amount * 2);
      END IF;
    ELSE
      -- Refund both in case of perfect tie
      IF v_challenge.bet_amount > 0 THEN
        PERFORM public.add_zcoin(v_challenge.host_id, v_challenge.bet_amount);
        PERFORM public.add_zcoin(v_challenge.guest_id, v_challenge.bet_amount);
      END IF;
    END IF;

    -- Finalize Challenge
    UPDATE public.challenges 
    SET status = 'completed', 
        winner_id = v_winner_id, 
        updated_at = NOW() 
    WHERE id = p_challenge_id;
    
  END IF;

  RETURN TRUE;
END;
$$;

-- 4. Function to Cancel Challenge (Refund Host)
CREATE OR REPLACE FUNCTION cancel_challenge(p_challenge_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_challenge RECORD;
BEGIN
  SELECT * INTO v_challenge FROM public.challenges WHERE id = p_challenge_id FOR UPDATE;
  
  IF v_challenge.status != 'waiting' THEN
    RAISE EXCEPTION 'Cannot cancel active or completed challenge';
  END IF;
  
  IF v_challenge.host_id != auth.uid() THEN
    RAISE EXCEPTION 'Only host can cancel';
  END IF;
  
  -- Refund Host
  IF v_challenge.bet_amount > 0 THEN
    PERFORM public.add_zcoin(auth.uid(), v_challenge.bet_amount);
  END IF;
  
  -- Update Status
  UPDATE public.challenges
  SET status = 'cancelled', updated_at = NOW()
  WHERE id = p_challenge_id;
  
  RETURN TRUE;
END;
$$;
