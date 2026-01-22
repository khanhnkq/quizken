import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

interface PresenceState {
  user_id: string;
  online_at: string;
}

export interface UseOnlinePresenceReturn {
  onlineCount: number;
  isConnected: boolean;
}

export function useOnlinePresence(userId: string | null): UseOnlinePresenceReturn {
  const [onlineCount, setOnlineCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    // Create presence channel
    channelRef.current = supabase.channel("chat_presence", {
      config: {
        presence: {
          key: userId || "anonymous",
        },
      },
    });

    // Track presence
    channelRef.current
      .on("presence", { event: "sync" }, () => {
        const state = channelRef.current?.presenceState() || {};
        const count = Object.keys(state).length;
        setOnlineCount(count);
        setIsConnected(true);
      })
      .on("presence", { event: "join" }, ({ key, newPresences }) => {
        console.log("User joined:", key, newPresences);
      })
      .on("presence", { event: "leave" }, ({ key, leftPresences }) => {
        console.log("User left:", key, leftPresences);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED" && userId) {
          await channelRef.current?.track({
            user_id: userId,
            online_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [userId]);

  return { onlineCount, isConnected };
}
