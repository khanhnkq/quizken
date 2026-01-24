import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ProfileData {
  display_name: string | null;
  avatar_url: string | null;
  equipped_theme?: string | null;
  equipped_avatar_frame?: string | null;
  zcoin?: number;
  xp?: number;
}

interface UseProfileReturn {
  profileData: ProfileData | null;
  isLoading: boolean;
  refetch: () => void;
}

export function useProfile(userId: string | undefined): UseProfileReturn {
  const { data: profileData, isLoading, refetch } = useQuery({
    queryKey: ["profile", userId],
    queryFn: async () => {
      if (!userId) return null;
      
      const { data, error } = await (supabase as any)
        .rpc("get_user_profile_with_xp", {
          target_user_id: userId,
        })
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        throw error;
      }

      return data as ProfileData;
    },
    enabled: !!userId,
    staleTime: 1000 * 60, // 1 minute
  });

  // Optional: functionality to invalidate explicitly if needed, but refetch works
  
  return { 
    profileData: profileData || null, 
    isLoading, 
    refetch 
  };
}
