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
}

interface UserProfile {
  user_id: string;
  avatar_url: string | null;
  display_name: string | null;
  user_level: number;
}

export interface UseChatMessagesReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  sendMessage: (content: string) => Promise<boolean>;
  deleteMessage: (messageId: string) => Promise<boolean>;
  currentUserId: string | null;
  userProfiles: Map<string, UserProfile>;
}

const MESSAGE_LIMIT = 50;

export function useChatMessages(): UseChatMessagesReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [userProfiles, setUserProfiles] = useState<Map<string, UserProfile>>(new Map());
  const { toast } = useToast();
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // Fetch user profiles for given user IDs
  const fetchUserProfiles = useCallback(async (userIds: string[]) => {
    if (userIds.length === 0) return;
    
    // Filter out already fetched profiles
    const newIds = userIds.filter(id => !userProfiles.has(id));
    if (newIds.length === 0) return;
    
    try {
      const { data, error } = await (supabase as any).rpc('get_chat_user_profiles', {
        user_ids: newIds
      });
      
      if (error) {
        console.error('Error fetching user profiles:', error);
        return;
      }
      
      if (data && Array.isArray(data)) {
        setUserProfiles(prev => {
          const newMap = new Map(prev);
          data.forEach((profile: UserProfile) => {
            newMap.set(profile.user_id, profile);
          });
          return newMap;
        });
      }
    } catch (error) {
      console.error('Error fetching user profiles:', error);
    }
  }, [userProfiles]);

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
          .order("created_at", { ascending: true })
          .limit(MESSAGE_LIMIT);

        if (!isMounted) return;
        
        if (error) {
          console.error("Supabase error:", error);
          setIsLoading(false);
          return;
        }
        console.log("Fetched messages:", data);
        setMessages((data as ChatMessage[]) || []);
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
    const userIds = [...new Set(messages.map(m => m.user_id))];
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

  return {
    messages,
    isLoading,
    sendMessage,
    deleteMessage,
    currentUserId,
    userProfiles,
  };
}
