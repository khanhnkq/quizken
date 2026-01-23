import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, MessageCircle } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

interface ChatMessage {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  profiles: {
    avatar_url: string | null;
    display_name: string | null;
  } | null;
}

export function GlobalChatTicker() {
  const location = useLocation();
  const navigate = useNavigate();
  const [latestMessage, setLatestMessage] = useState<ChatMessage | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Hide logic handled in return, hooks must run always

    // Fetch the absolute latest message on mount
    const fetchLatest = async () => {
      // 1. Fetch message
      const { data: msgData, error: msgError } = await supabase
        .from("chat_messages")
        .select("id, content, user_id, created_at")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (msgError || !msgData) return;

      // 2. Fetch profile using RPC
      const { data: profiles, error: profileError } = await (
        supabase as any
      ).rpc("get_chat_user_profiles", {
        user_ids: [msgData.user_id],
      });

      if (profileError) {
        console.error("Error fetching profile:", profileError);
      }

      const profileData = profiles?.[0];

      setLatestMessage({
        ...msgData,
        profiles: profileData
          ? {
              avatar_url: profileData.avatar_url,
              display_name: profileData.display_name,
            }
          : null,
      });
      setIsVisible(true);
    };

    fetchLatest();

    // Subscribe to new messages
    const channel = supabase
      .channel("global-chat-ticker")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
        },
        async (payload) => {
          // Fetch the full details manually to avoid join issues
          const { data: msgData } = await supabase
            .from("chat_messages")
            .select("id, content, user_id, created_at")
            .eq("id", payload.new.id)
            .single();

          if (!msgData) return;

          const { data: profiles, error: profileError } = await (
            supabase as any
          ).rpc("get_chat_user_profiles", {
            user_ids: [msgData.user_id],
          });

          if (profileError) {
            console.error("Error fetching profile:", profileError);
          }

          const profileData = profiles?.[0];

          setLatestMessage({
            ...msgData,
            profiles: profileData
              ? {
                  avatar_url: profileData.avatar_url,
                  display_name: profileData.display_name,
                }
              : null,
          });
          setIsVisible(true);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const shouldShow =
    latestMessage && isVisible && location.pathname !== "/chat";

  if (!shouldShow) return null;

  // Parse content to see if it's a special message (JSON)
  let contentText = latestMessage!.content;
  let isSpecial = false;
  if (contentText.startsWith("{")) {
    try {
      const parsed = JSON.parse(contentText);
      if (parsed.type === "streak_share") {
        contentText = `🔥 Đã chia sẻ chuỗi ${parsed.data.streak} ngày!`;
        isSpecial = true;
      } else if (parsed.type === "quiz_share") {
        contentText = `📚 Đã chia sẻ một bài quiz: ${parsed.data.quiz_title}`;
        isSpecial = true;
      } else if (parsed.type === "zcoin_share") {
        contentText = `🪙 Đã khoe ${parsed.data.zcoin.toLocaleString()} ZCoin!`;
        isSpecial = true;
      }
    } catch (e) {
      // ignore
    }
  }

  return (
    <div className="fixed bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
      {/* Container for the pill - positioned bottom center */}
      <AnimatePresence mode="wait">
        <motion.div
          key={latestMessage.id}
          initial={{ y: 20, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -20, opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="pointer-events-auto cursor-pointer group"
          onClick={() => navigate("/chat")}>
          <div className="flex items-center gap-3 bg-white/60 dark:bg-slate-900/60 backdrop-blur-lg border border-white/30 dark:border-slate-700/30 shadow-sm rounded-full pl-1 pr-4 py-1 hover:bg-white/80 dark:hover:bg-slate-900/80 hover:shadow-md hover:border-white/50 dark:hover:border-slate-600 transition-all">
            <Avatar className="h-8 w-8 ring-2 ring-white dark:ring-slate-800 shadow-sm">
              {latestMessage.profiles?.avatar_url && (
                <AvatarImage src={latestMessage.profiles.avatar_url} />
              )}
              <AvatarFallback className="bg-gradient-to-br from-green-400 to-emerald-600 text-white">
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>

            <div className="flex flex-col max-w-[200px] md:max-w-xs">
              <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider leading-none mb-0.5 flex items-center gap-1.5">
                {latestMessage.profiles?.display_name || "Quizzer"}
                <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600"></span>
                <span className="text-gray-400 dark:text-gray-500 font-normal">vừa xong</span>
              </span>
              <p
                className={`text-xs leading-tight truncate ${isSpecial ? "italic text-primary font-bold" : "text-gray-800 dark:text-gray-200"}`}>
                {contentText}
              </p>
            </div>

            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors ml-2">
              <MessageCircle className="h-3 w-3 text-primary" />
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
