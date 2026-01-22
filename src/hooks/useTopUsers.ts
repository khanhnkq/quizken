import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface TopUser {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  user_level: number;
  total_xp: number;
}

export function useTopUsers(limit: number = 5) {
  const [users, setUsers] = useState<TopUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTopUsers = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await (supabase as any).rpc("get_top_users", {
          limit_count: limit,
        });

        if (error) {
          console.error("Error fetching top users:", error);
          return;
        }

        setUsers(data || []);
      } catch (error) {
        console.error("Error fetching top users:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTopUsers();
  }, [limit]);

  return { users, isLoading };
}
