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
  reply_to_id?: string | null;
  room_id: string;
  reply_to?: {
    id: string;
    content: string;
    user_id: string;
  } | null;
}

export interface UserProfile {
  user_id: string;
  display_name?: string;
  avatar_url?: string;
  user_level?: number;
  equipped_avatar_frame?: string;
}

export interface UseChatMessagesReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  sendMessage: (content: string, replyToId?: string) => Promise<boolean>;
  sendQuizShare: (payload: QuizSharePayload) => Promise<boolean>;
  sendStreakShare: (payload: StreakSharePayload) => Promise<boolean>;
  sendZCoinShare: (payload: ZCoinSharePayload) => Promise<boolean>;
  deleteMessage: (messageId: string) => Promise<boolean>;
  toggleReaction: (messageId: string, emoji: string) => Promise<boolean>; // NEW
  triggerGreeting: () => Promise<void>;
  isBotTyping: boolean;
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

export interface ZCoinSharePayload {
  zcoin: number;
  slogan: string;
  imageId: number;
}

export function useChatMessages(roomId: string = "general"): UseChatMessagesReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [userProfiles, setUserProfiles] = useState<Map<string, UserProfile>>(
    new Map(),
  );
  const { toast } = useToast();
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const shareTimestampsRef = useRef<number[]>([]);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const BOT_USER_ID = "00000000-0000-0000-0000-000000000001";

  // Fetch user profiles for given user IDs
  const fetchUserProfiles = useCallback(
    async (userIds: string[]) => {
      if (userIds.length === 0) return;

      // Filter out already fetched profiles
      const newIds = userIds.filter((id) => !userProfiles.has(id));
      if (newIds.length === 0) return;

      try {
        const { data, error } = await supabase.rpc(
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
          const profiles = data as UserProfile[];
          setUserProfiles((prev) => {
            const newMap = new Map(prev);
            profiles.forEach((profile: UserProfile) => {
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

  // Fetch initial messages - re-run when roomId changes
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    const fetchMessages = async () => {
      try {
        // 1. Fetch recent messages raw (without join)
        const { data: rawMessages, error } = await supabase
          .from("chat_messages")
          .select("*")
          .eq("room_id", roomId)
          .order("created_at", { ascending: false })
          .limit(MESSAGE_LIMIT);

        if (!isMounted) return;

        if (error) {
          console.error("Supabase error:", error);
          setIsLoading(false);
          return;
        }

        const messages = rawMessages as ChatMessage[];
        
        // 2. Identify parent IDs that need fetching
        const replyIds = [...new Set(
          messages
            .filter(m => m.reply_to_id)
            .map(m => m.reply_to_id)
        )] as string[];

        // 3. Fetch parent messages if any
        const replyMap = new Map<string, any>();
        if (replyIds.length > 0) {
          const { data: parents, error: parentError } = await supabase
            .from("chat_messages")
            .select("id, content, user_id")
            .in("id", replyIds);
            
          if (!parentError && parents) {
            parents.forEach((p: { id: string; content: string; user_id: string }) => replyMap.set(p.id, p));
          }
        }

        // 4. Stitch valid parents into messages
        const enrichedMessages = messages.map(m => {
          if (m.reply_to_id && replyMap.has(m.reply_to_id)) {
            return {
              ...m,
              reply_to: replyMap.get(m.reply_to_id)
            };
          }
          return m;
        });

        // Reverse to show oldest to newest
        setMessages(enrichedMessages.reverse());
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
  }, [roomId]); // Re-run when roomId changes

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
      .channel(`chat_messages_${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
        },
        (payload) => {
          const newMessage = payload.new as ChatMessage;
          
          // Client-side filtering check
          if (newMessage.room_id !== roomId) {
            console.log(`[Chat Realtime] Ignored ${newMessage.id} for room ${newMessage.room_id} (current ${roomId})`);
            return;
          }
          
          console.log(`[Chat Realtime] Incoming ${payload.eventType} for room ${roomId}:`, newMessage.content);
          
          // Clear typing indicator if Bot sends a message
          if (newMessage.user_id === BOT_USER_ID) {
            setIsBotTyping(false);
            if (typingTimeoutRef.current) {
              clearTimeout(typingTimeoutRef.current);
            }
          }
          
          setMessages((prev) => {
            // Avoid duplicates
            if (prev.some((m) => m.id === newMessage.id)) return prev;

            // Populate reply_to from existing messages if reply_to_id exists
            let enrichedMessage = newMessage;
            if (newMessage.reply_to_id) {
              const parentMessage = prev.find(
                (m) => m.id === newMessage.reply_to_id,
              );
              if (parentMessage) {
                enrichedMessage = {
                  ...newMessage,
                  reply_to: {
                    id: parentMessage.id,
                    content: parentMessage.content,
                    user_id: parentMessage.user_id,
                  },
                };
              }
            }

            // Keep only last MESSAGE_LIMIT messages
            const updated = [...prev, enrichedMessage];
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
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "chat_messages",
        },
        (payload) => {
          const updatedMessage = payload.new as ChatMessage;
          setMessages((prev) =>
            prev.map((m) => (m.id === updatedMessage.id ? updatedMessage : m)),
          );
        },
      )
      .subscribe((status) => {
        console.log(`[Chat Realtime] Room ${roomId} subscription status:`, status);
      });

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [roomId]);

  // Send message
  const sendMessage = useCallback(
    async (content: string, replyToId?: string): Promise<boolean> => {
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
        console.log("Sending message with replyToId:", replyToId, "in room:", roomId);
        const { error } = await supabase.from("chat_messages").insert({
          user_id: currentUserId,
          room_id: roomId, // Target specific room
          content: trimmedContent,
          reply_to_id: replyToId ? replyToId : null,
        });

        if (error) {
          console.error("Insert error:", error);
          throw error;
        }

        // Trigger bot typing indicator if appropriate
        if (roomId.startsWith("quits_quits") || trimmedContent.includes("@Quít Quít")) {
          setIsBotTyping(true);
          // Auto-clear after 15s if no response
          if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = setTimeout(() => {
            setIsBotTyping(false);
          }, 15000);
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
    [currentUserId, toast, roomId],
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
        const { error } = await supabase.from("chat_messages").insert({
          user_id: currentUserId,
          room_id: roomId,
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
    [currentUserId, toast, roomId],
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
        const { error } = await supabase.from("chat_messages").insert({
          user_id: currentUserId,
          room_id: roomId,
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
    [currentUserId, toast, roomId],
  );

  const sendZCoinShare = useCallback(
    async (payload: ZCoinSharePayload): Promise<boolean> => {
      if (!currentUserId) {
        toast({
          title: "Chưa đăng nhập",
          description: "Vui lòng đăng nhập để khoe ZCoin",
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
        type: "zcoin_share",
        data: payload,
      });

      try {
        const { error } = await supabase.from("chat_messages").insert({
          user_id: currentUserId,
          room_id: roomId,
          content,
        });

        if (error) throw error;
        return true;
      } catch (error) {
        console.error("Error sending zcoin share:", error);
        toast({
          title: "Lỗi",
          description: "Không thể khoe ZCoin",
          variant: "destructive",
        });
        return false;
      }
    },
    [currentUserId, toast, roomId],
  );

  // Delete message
  const deleteMessage = useCallback(
    async (messageId: string): Promise<boolean> => {
      try {
        const { error } = await supabase
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
        const { error } = await supabase.rpc("toggle_chat_reaction", {
          p_message_id: messageId,
          p_emoji: emoji,
        });

        if (error) throw error;
        return true;
      } catch (error) {
        console.error("Error toggling reaction:", error);
        toast({
          title: "Lỗi",
          description: "Không thể thả cảm xúc",
          variant: "destructive",
        });
        // Revert optimistic update if needed, but we'll rely on fast failure or eventual consistency for now
        // A full revert would require refetching or restoring previous state
        return false;
      }
    },
    [currentUserId, toast],
  );

  // Trigger greeting for private room
  const triggerGreeting = useCallback(async () => {
    if (!currentUserId || !roomId.startsWith('quits_quits')) return;
    
    console.log("[Chat] Triggering bot greeting for private room...");
    try {
      setIsBotTyping(true);
      // Auto-clear after 15s if no response
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        setIsBotTyping(false);
      }, 15000);

      const { data: session } = await supabase.auth.getSession();
      await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-ai-response`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.session?.access_token || ''}`, // Note: Edge function uses Secret check but we pass this for future
          "X-Quit-Quit-Secret": 'quit-quit-webhook-secret-2024'
        },
        body: JSON.stringify({
          action: 'trigger_greeting',
          userId: currentUserId,
          room_id: roomId
        })
      });
    } catch (err) {
      console.error("Failed to trigger greeting:", err);
    }
  }, [currentUserId, roomId]);

  return {
    messages,
    isLoading,
    sendMessage,
    sendQuizShare,
    deleteMessage,
    sendStreakShare,
    sendZCoinShare,
    toggleReaction,
    triggerGreeting,
    isBotTyping,
    currentUserId,
    userProfiles,
  };
}
