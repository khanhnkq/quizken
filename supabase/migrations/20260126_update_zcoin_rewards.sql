-- Update triggers to use the unified calculate_user_level function
-- This ensures ZCoin rewards and level-up bonuses are consistent with the new quadratic level system

-- Trigger: Reward ZCoin for creating a quiz
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
    COALESCE((SELECT COUNT(*)::BIGINT * 100 FROM public.quizzes WHERE user_id = new.user_id), 0),
    COALESCE((SELECT SUM(score)::BIGINT FROM public.quiz_attempts WHERE user_id = new.user_id), 0)
  INTO current_xp, old_xp; -- using variable names loosely here to hold the sums
  
  -- Combine for Current XP
  current_xp := current_xp + old_xp;
  
  -- Calculate Old XP (Current - 100 for this new quiz)
  old_xp := current_xp - 100;

  -- 2. Calculate Levels using the unified function
  current_level := public.calculate_user_level(current_xp::int);
  old_level := public.calculate_user_level(old_xp::int);
  
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

-- Trigger: Reward ZCoin for attempting a quiz
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
    COALESCE((SELECT COUNT(*)::BIGINT * 100 FROM public.quizzes WHERE user_id = new.user_id), 0),
    COALESCE((SELECT SUM(score)::BIGINT FROM public.quiz_attempts WHERE user_id = new.user_id), 0)
  INTO current_xp, old_xp; -- reuse vars
  
  -- Combine for Current XP
  current_xp := current_xp + old_xp; -- wait, total_xp logic is: (quizzes * 100) + sum_scores.
  -- The query above fetched (count*100) into current_xp and (sum_scores) into old_xp.
  -- But wait, the previous logic was:
  -- SELECT (count*100), (sum_score) INTO current_xp, old_xp
  -- current_xp := current_xp + old_xp;
  -- That seems correct for "Current XP".
  
  -- Calculate Old XP (Current - new.score)
  -- Note: "new.score" is included in the SUM(score) above because this is AFTER INSERT trigger.
  old_xp := current_xp - new.score;

  -- 2. Calculate Levels using unified function
  current_level := public.calculate_user_level(current_xp::int);
  old_level := public.calculate_user_level(old_xp::int);
  
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
