-- Create profiles table to store persistent user data like ZCoin
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  zcoin INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, zcoin)
  VALUES (new.id, 0);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Backfill profiles for existing users (Run once)
INSERT INTO public.profiles (id, zcoin)
SELECT id, 0 FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;

-- Function to add ZCoin
CREATE OR REPLACE FUNCTION public.add_zcoin(user_uuid UUID, amount INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE public.profiles
  SET zcoin = zcoin + amount,
      updated_at = NOW()
  WHERE id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Reward ZCoin for creating a quiz
-- Base Reward: 10 ZCoin * (1 + Level/10)
-- Level Up Reward: 1000 ZCoin per level
CREATE OR REPLACE FUNCTION public.handle_quiz_created_reward()
RETURNS TRIGGER AS $$
DECLARE
  current_xp BIGINT;
  old_xp BIGINT;
  current_level INTEGER;
  old_level INTEGER;
  multiplier DECIMAL;
  reward_amount INTEGER;
BEGIN
  -- 1. Calculate stats
  SELECT 
    (COALESCE((SELECT COUNT(*) FROM public.quizzes WHERE user_id = new.user_id), 0) * 100),
    (COALESCE((SELECT SUM(score) FROM public.quiz_attempts WHERE user_id = new.user_id), 0))
  INTO current_xp, old_xp; -- old_xp temp usage for score sum
  
  -- Combine for Current XP
  current_xp := current_xp + old_xp;
  
  -- Calculate Old XP (Current - 100 for this new quiz)
  old_xp := current_xp - 100;

  -- 2. Calculate Levels
  -- Level Formula: Floor(Sqrt(XP / 500)) + 1
  current_level := FLOOR(SQRT(current_xp / 500)) + 1;
  old_level := FLOOR(SQRT(old_xp / 500)) + 1;
  
  -- 3. Calculate Action Reward
  -- Multiplier: 1 + (Level * 0.1) based on NEW level
  multiplier := 1 + (current_level * 0.1);
  reward_amount := FLOOR(10 * multiplier);
  
  PERFORM public.add_zcoin(new.user_id, reward_amount);
  
  -- 4. Check for Level Up Bonus
  IF current_level > old_level THEN
    PERFORM public.add_zcoin(new.user_id, 1000 * (current_level - old_level));
  END IF;
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_quiz_created_reward ON public.quizzes;
CREATE TRIGGER on_quiz_created_reward
  AFTER INSERT ON public.quizzes
  FOR EACH ROW EXECUTE FUNCTION public.handle_quiz_created_reward();

-- Trigger: Reward ZCoin for attempting a quiz
-- Reward: (Score / 10) * Multiplier
-- Level Up Reward: 1000 ZCoin per level
CREATE OR REPLACE FUNCTION public.handle_quiz_attempt_reward()
RETURNS TRIGGER AS $$
DECLARE
  current_xp BIGINT;
  old_xp BIGINT;
  current_level INTEGER;
  old_level INTEGER;
  multiplier DECIMAL;
  reward_amount INTEGER;
BEGIN
  -- 1. Calculate stats
  SELECT 
    (COALESCE((SELECT COUNT(*) FROM public.quizzes WHERE user_id = new.user_id), 0) * 100),
    (COALESCE((SELECT SUM(score) FROM public.quiz_attempts WHERE user_id = new.user_id), 0))
  INTO current_xp, old_xp;
  
  current_xp := current_xp + old_xp;

  -- Calculate Old XP (Current - new.score)
  old_xp := current_xp - new.score;

  -- 2. Calculate Levels
  current_level := FLOOR(SQRT(current_xp / 500)) + 1;
  old_level := FLOOR(SQRT(old_xp / 500)) + 1;
  
  -- 3. Calculate Action Reward
  multiplier := 1 + (current_level * 0.1);
  reward_amount := FLOOR((new.score / 10) * multiplier);
  
  PERFORM public.add_zcoin(new.user_id, reward_amount);

  -- 4. Check for Level Up Bonus
  IF current_level > old_level THEN
    PERFORM public.add_zcoin(new.user_id, 1000 * (current_level - old_level));
  END IF;
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_quiz_attempt_reward ON public.quiz_attempts;
CREATE TRIGGER on_quiz_attempt_reward
  AFTER INSERT ON public.quiz_attempts
  FOR EACH ROW EXECUTE FUNCTION public.handle_quiz_attempt_reward();

-- Update get_user_statistics to return ZCoin
DROP FUNCTION IF EXISTS get_user_statistics(uuid);
CREATE OR REPLACE FUNCTION get_user_statistics(user_uuid UUID)
RETURNS TABLE(
  total_quizzes_created BIGINT,
  total_quizzes_taken BIGINT,
  highest_score DECIMAL(5,2),
  average_score DECIMAL(5,2),
  total_time_taken_seconds BIGINT,
  zcoin INTEGER -- NEW COLUMN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*)::BIGINT FROM public.quizzes WHERE user_id = user_uuid) as total_quizzes_created,
    (SELECT COUNT(*)::BIGINT FROM public.quiz_attempts WHERE user_id = user_uuid) as total_quizzes_taken,
    COALESCE((SELECT MAX(score) FROM public.quiz_attempts WHERE user_id = user_uuid), 0) as highest_score,
    COALESCE((SELECT AVG(score) FROM public.quiz_attempts WHERE user_id = user_uuid), 0) as average_score,
    COALESCE((SELECT SUM(time_taken_seconds) FROM public.quiz_attempts WHERE user_id = user_uuid AND time_taken_seconds IS NOT NULL), 0) as total_time_taken_seconds,
    COALESCE((SELECT p.zcoin FROM public.profiles p WHERE p.id = user_uuid), 0) as zcoin;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
