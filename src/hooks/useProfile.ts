import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ProfileData {
  display_name: string | null;
  avatar_url: string | null;
}

interface UseProfileReturn {
  profileData: ProfileData | null;
  isLoading: boolean;
}

export function useProfile(userId: string | undefined): UseProfileReturn {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await (supabase as any)
          .from("profiles")
          .select("display_name, avatar_url")
          .eq("id", userId)
          .single();

        if (error && error.code !== "PGRST116") {
          console.error("Error fetching profile:", error);
        }

        setProfileData(data || null);
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  return { profileData, isLoading };
}
