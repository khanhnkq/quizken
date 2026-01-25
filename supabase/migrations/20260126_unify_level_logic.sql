-- Create a standard function for calculating level from XP
-- Formula: Level = floor((1 + sqrt(1 + 0.08 * xp)) / 2)
-- This is the quadratic formula solution for: xp = 50 * level * (level - 1)
CREATE OR REPLACE FUNCTION public.calculate_user_level(xp integer)
RETURNS integer
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT GREATEST(1, floor((1 + sqrt(1 + 0.08 * GREATEST(0, xp))) / 2))::integer;
$$;

-- Update get_top_users to use the new function
CREATE OR REPLACE FUNCTION public.get_top_users(limit_count integer DEFAULT 5)
 RETURNS TABLE(user_id uuid, display_name text, avatar_url text, equipped_avatar_frame text, user_level integer, total_xp integer)
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT 
    p.id as user_id,
    COALESCE(p.display_name, u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name', 'User') as display_name,
    COALESCE(p.avatar_url, u.raw_user_meta_data->>'avatar_url') as avatar_url,
    p.equipped_avatar_frame,
    public.calculate_user_level(xp_calc.xp::int) as user_level,
    xp_calc.xp::int as total_xp
  FROM public.profiles p
  LEFT JOIN auth.users u ON u.id = p.id
  LEFT JOIN LATERAL (
    SELECT COALESCE(
      (SELECT COUNT(*)::int * 100 FROM quizzes WHERE user_id = p.id) +
      (SELECT COALESCE(SUM(score), 0)::int FROM quiz_attempts WHERE user_id = p.id),
      0
    ) as xp
  ) xp_calc ON true
  ORDER BY xp_calc.xp DESC
  LIMIT limit_count;
$function$;

-- Update get_chat_user_profiles to use the new function
CREATE OR REPLACE FUNCTION public.get_chat_user_profiles(user_ids uuid[])
 RETURNS TABLE(user_id uuid, avatar_url text, display_name text, user_level integer, equipped_avatar_frame text)
 LANGUAGE sql
 SECURITY DEFINER
AS $function$
  SELECT 
    p.id as user_id,
    COALESCE(p.avatar_url, u.raw_user_meta_data->>'avatar_url') as avatar_url,
    COALESCE(p.display_name, u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name', 'User') as display_name,
    public.calculate_user_level(xp_calc.xp::int) as user_level,
    p.equipped_avatar_frame
  FROM public.profiles p
  LEFT JOIN auth.users u ON u.id = p.id
  LEFT JOIN LATERAL (
    SELECT COALESCE(
      (SELECT COUNT(*)::int * 100 FROM quizzes WHERE user_id = p.id) +
      (SELECT COALESCE(SUM(score), 0)::int FROM quiz_attempts WHERE user_id = p.id),
      0
    ) as xp
  ) xp_calc ON true
  WHERE p.id = ANY(user_ids);
$function$;
