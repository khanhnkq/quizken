import { useEffect, useRef, useState } from "react";
import { MessageCircle, Users, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChatMessages } from "@/hooks/useChatMessages";
import { useOnlinePresence } from "@/hooks/useOnlinePresence";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";

interface ChatRoomProps {
  onLoginClick?: () => void;
}

export function ChatRoom({ onLoginClick }: ChatRoomProps) {
  const { messages, isLoading, sendMessage, deleteMessage, currentUserId, userProfiles } =
    useChatMessages();
  const { onlineCount, isConnected } = useOnlinePresence(currentUserId);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, autoScroll]);

  // Detect if user scrolled up
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    const isAtBottom =
      target.scrollHeight - target.scrollTop - target.clientHeight < 50;
    setAutoScroll(isAtBottom);
  };

  return (
    <div className="flex flex-col h-full bg-background rounded-lg border shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-primary" />
          <h2 className="font-semibold">Phòng Chat Chung</h2>
        </div>
        <div className="flex items-center gap-2 text-sm">
          {isConnected && (
            <span className="flex items-center gap-1.5 px-2 py-1 bg-green-100 text-green-700 rounded-full">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <Users className="h-3.5 w-3.5" />
              <span className="font-medium">{onlineCount}</span>
            </span>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea
        className="flex-1"
        ref={scrollRef as any}
        onScrollCapture={handleScroll}
      >
        <div className="py-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-4">
              <MessageCircle className="h-12 w-12 text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground">
                Chưa có tin nhắn nào. Hãy là người đầu tiên gửi tin nhắn!
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {messages.map((message) => {
                const profile = userProfiles.get(message.user_id);
                return (
                  <ChatMessage
                    key={message.id}
                    message={message}
                    isOwnMessage={message.user_id === currentUserId}
                    avatarUrl={profile?.avatar_url || undefined}
                    displayName={profile?.display_name || undefined}
                    userLevel={profile?.user_level}
                    onDelete={
                      message.user_id === currentUserId ? deleteMessage : undefined
                    }
                  />
                );
              })}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <ChatInput
        onSendMessage={sendMessage}
        isAuthenticated={!!currentUserId}
        onLoginClick={onLoginClick}
        disabled={isLoading}
      />
    </div>
  );
}
