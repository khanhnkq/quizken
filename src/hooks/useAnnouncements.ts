import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: "info" | "event" | "alert";
  created_at: string;
}

export function useAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await (supabase as any)
          .from("announcements")
          .select("*")
          .eq("is_active", true)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching announcements:", error);
          return;
        }

        setAnnouncements(data || []);
      } catch (error) {
        console.error("Error fetching announcements:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

  return { announcements, isLoading };
}
