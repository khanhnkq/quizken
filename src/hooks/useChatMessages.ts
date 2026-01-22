import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface ChatMessage {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  avatar_url?: string;
  display_name?: string;
  reactions?: Record<string, string[]>; // emoji -> userIds[]
}

// ...

export interface UseChatMessagesReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  sendMessage: (content: string) => Promise<boolean>;
  sendQuizShare: (payload: QuizSharePayload) => Promise<boolean>;
  sendStreakShare: (payload: StreakSharePayload) => Promise<boolean>;
  deleteMessage: (messageId: string) => Promise<boolean>;
  toggleReaction: (messageId: string, emoji: string) => Promise<boolean>; // NEW
  currentUserId: string | null;
  userProfiles: Map<string, UserProfile>;
}

const MESSAGE_LIMIT = 50;
const SHARE_WINDOW_MS = 30_000;
const SHARE_MAX = 3;
export interface QuizSharePayload {
  quiz_id: string;
  quiz_title: string;
  question_count: number;
  status?: string;
  is_public?: boolean;
  expires_at?: string | null;
}

export interface StreakSharePayload {
  streak: number;
  slogan: string;
  imageId: number;
}

export function useChatMessages(): UseChatMessagesReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [userProfiles, setUserProfiles] = useState<Map<string, UserProfile>>(
    new Map(),
  );
  const { toast } = useToast();
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const shareTimestampsRef = useRef<number[]>([]);

  // Fetch user profiles for given user IDs
  const fetchUserProfiles = useCallback(
    async (userIds: string[]) => {
      if (userIds.length === 0) return;

      // Filter out already fetched profiles
      const newIds = userIds.filter((id) => !userProfiles.has(id));
      if (newIds.length === 0) return;

      try {
        const { data, error } = await (supabase as any).rpc(
          "get_chat_user_profiles",
          {
            user_ids: newIds,
          },
        );

        if (error) {
          console.error("Error fetching user profiles:", error);
          return;
        }

        if (data && Array.isArray(data)) {
          setUserProfiles((prev) => {
            const newMap = new Map(prev);
            data.forEach((profile: UserProfile) => {
              newMap.set(profile.user_id, profile);
            });
            return newMap;
          });
        }
      } catch (error) {
        console.error("Error fetching user profiles:", error);
      }
    },
    [userProfiles],
  );

  // Get current user
  useEffect(() => {
    const getCurrentUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    getCurrentUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, session) => {
      setCurrentUserId(session?.user?.id || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch initial messages - only run once on mount
  useEffect(() => {
    let isMounted = true;

    const fetchMessages = async () => {
      try {
        // Use explicit type casting to avoid TypeScript generics issue
        const { data, error } = await (supabase as any)
          .from("chat_messages")
          .select("*")
          .order("created_at", { ascending: false }) // Fetch newest first
          .limit(MESSAGE_LIMIT);

        if (!isMounted) return;

        if (error) {
          console.error("Supabase error:", error);
          setIsLoading(false);
          return;
        }
        console.log("Fetched messages:", data);
        // Reverse to show oldest to newest
        setMessages((data as ChatMessage[]).reverse() || []);
      } catch (error) {
        console.error("Error fetching messages:", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchMessages();

    return () => {
      isMounted = false;
    };
  }, []); // Empty dependency array - run only once

  // Fetch user profiles when messages change
  useEffect(() => {
    const userIds = [...new Set(messages.map((m) => m.user_id))];
    if (userIds.length > 0) {
      fetchUserProfiles(userIds);
    }
  }, [messages, fetchUserProfiles]);

  // Subscribe to realtime changes
  useEffect(() => {
    channelRef.current = supabase
      .channel("chat_messages_channel")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
        },
        (payload) => {
          const newMessage = payload.new as ChatMessage;
          setMessages((prev) => {
            // Avoid duplicates
            if (prev.some((m) => m.id === newMessage.id)) return prev;
            // Keep only last MESSAGE_LIMIT messages
            const updated = [...prev, newMessage];
            if (updated.length > MESSAGE_LIMIT) {
              return updated.slice(-MESSAGE_LIMIT);
            }
            return updated;
          });
        },
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "chat_messages",
        },
        (payload) => {
          const deletedId = payload.old.id as string;
          setMessages((prev) => prev.filter((m) => m.id !== deletedId));
        },
      )
      .subscribe();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, []);

  // Send message
  const sendMessage = useCallback(
    async (content: string): Promise<boolean> => {
      if (!currentUserId) {
        toast({
          title: "Chưa đăng nhập",
          description: "Vui lòng đăng nhập để gửi tin nhắn",
          variant: "destructive",
        });
        return false;
      }

      const trimmedContent = content.trim();
      if (!trimmedContent || trimmedContent.length > 1000) {
        toast({
          title: "Lỗi",
          description: "Tin nhắn không hợp lệ (tối đa 1000 ký tự)",
          variant: "destructive",
        });
        return false;
      }

      try {
        const { error } = await (supabase as any).from("chat_messages").insert({
          user_id: currentUserId,
          content: trimmedContent,
        });

        if (error) {
          console.error("Insert error:", error);
          throw error;
        }
        return true;
      } catch (error) {
        console.error("Error sending message:", error);
        toast({
          title: "Lỗi",
          description: "Không thể gửi tin nhắn",
          variant: "destructive",
        });
        return false;
      }
    },
    [currentUserId, toast],
  );

  const sendQuizShare = useCallback(
    async (payload: QuizSharePayload): Promise<boolean> => {
      if (!currentUserId) {
        toast({
          title: "Chưa đăng nhập",
          description: "Vui lòng đăng nhập để chia sẻ quiz",
          variant: "destructive",
        });
        return false;
      }

      if (!payload.quiz_id) {
        toast({
          title: "Thiếu dữ liệu",
          description: "Quiz không hợp lệ",
          variant: "destructive",
        });
        return false;
      }

      const now = Date.now();
      const recent = shareTimestampsRef.current.filter(
        (ts) => now - ts < SHARE_WINDOW_MS,
      );
      if (recent.length >= SHARE_MAX) {
        const waitSeconds = Math.ceil(
          (SHARE_WINDOW_MS - (now - recent[0])) / 1000,
        );
        toast({
          title: "Chia sẻ quá nhanh",
          description: `Vui lòng đợi ${waitSeconds}s trước khi chia sẻ tiếp.`,
          variant: "destructive",
        });
        return false;
      }
      shareTimestampsRef.current = [...recent, now];

      const content = JSON.stringify({
        type: "quiz_share",
        data: {
          ...payload,
        },
      });

      try {
        const { error } = await (supabase as any).from("chat_messages").insert({
          user_id: currentUserId,
          content,
        });

        if (error) {
          console.error("Insert share error:", error);
          throw error;
        }
        return true;
      } catch (error) {
        console.error("Error sending quiz share:", error);
        toast({
          title: "Lỗi",
          description: "Không thể chia sẻ quiz",
          variant: "destructive",
        });
        return false;
      }
    },
    [currentUserId, toast],
  );

  const sendStreakShare = useCallback(
    async (payload: StreakSharePayload): Promise<boolean> => {
      if (!currentUserId) {
        toast({
          title: "Chưa đăng nhập",
          description: "Vui lòng đăng nhập để chia sẻ streak",
          variant: "destructive",
        });
        return false;
      }

      const now = Date.now();
      const recent = shareTimestampsRef.current.filter(
        (ts) => now - ts < SHARE_WINDOW_MS,
      );
      if (recent.length >= SHARE_MAX) {
        const waitSeconds = Math.ceil(
          (SHARE_WINDOW_MS - (now - recent[0])) / 1000,
        );
        toast({
          title: "Chia sẻ quá nhanh",
          description: `Vui lòng đợi ${waitSeconds}s trước khi chia sẻ tiếp.`,
          variant: "destructive",
        });
        return false;
      }
      shareTimestampsRef.current = [...recent, now];

      const content = JSON.stringify({
        type: "streak_share",
        data: payload,
      });

      try {
        const { error } = await (supabase as any).from("chat_messages").insert({
          user_id: currentUserId,
          content,
        });

        if (error) throw error;
        return true;
      } catch (error) {
        console.error("Error sending streak share:", error);
        toast({
          title: "Lỗi",
          description: "Không thể chia sẻ streak",
          variant: "destructive",
        });
        return false;
      }
    },
    [currentUserId, toast],
  );

  // Delete message
  const deleteMessage = useCallback(
    async (messageId: string): Promise<boolean> => {
      try {
        const { error } = await (supabase as any)
          .from("chat_messages")
          .delete()
          .eq("id", messageId);

        if (error) {
          console.error("Delete error:", error);
          throw error;
        }
        return true;
      } catch (error) {
        console.error("Error deleting message:", error);
        toast({
          title: "Lỗi",
          description: "Không thể xóa tin nhắn",
          variant: "destructive",
        });
        return false;
      }
    },
    [toast],
  );

  // Toggle reaction
  const toggleReaction = useCallback(
    async (messageId: string, emoji: string): Promise<boolean> => {
      if (!currentUserId) {
        toast({
          title: "Chưa đăng nhập",
          description: "Vui lòng đăng nhập để thả cảm xúc",
          variant: "destructive",
        });
        return false;
      }

      // Optimistic update
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.id === messageId) {
            const currentReactions = { ...(msg.reactions || {}) };
            const users = currentReactions[emoji] || [];

            if (users.includes(currentUserId)) {
              // Remove reaction
              currentReactions[emoji] = users.filter(
                (id) => id !== currentUserId,
              );
              if (currentReactions[emoji].length === 0) {
                delete currentReactions[emoji];
              }
            } else {
              // Add reaction
              currentReactions[emoji] = [...users, currentUserId];
            }
            return { ...msg, reactions: currentReactions };
          }
          return msg;
        }),
      );

      try {
        // Fetch current reactions first to ensure atomicity/freshness (simplified for JSONB)
        const { data: currentMsg, error: fetchError } = await (supabase as any)
          .from("chat_messages")
          .select("reactions")
          .eq("id", messageId)
          .single();

        if (fetchError) throw fetchError;

        const currentReactions =
          (currentMsg.reactions as Record<string, string[]>) || {};
        const users = currentReactions[emoji] || [];
        let newReactions = { ...currentReactions };

        if (users.includes(currentUserId)) {
          newReactions[emoji] = users.filter((id) => id !== currentUserId);
          if (newReactions[emoji].length === 0) delete newReactions[emoji];
        } else {
          newReactions[emoji] = [...users, currentUserId];
        }

        const { error } = await (supabase as any)
          .from("chat_messages")
          .update({ reactions: newReactions })
          .eq("id", messageId);

        if (error) throw error;
        return true;
      } catch (error) {
        console.error("Error toggling reaction:", error);
        toast({
          title: "Lỗi",
          description: "Không thể thả cảm xúc",
          variant: "destructive",
        });
        return false;
      }
    },
    [currentUserId, toast],
  );

  return {
    messages,
    isLoading,
    sendMessage,
    sendQuizShare,
    deleteMessage,
    sendStreakShare,
    toggleReaction,
    currentUserId,
    userProfiles,
  };
}
