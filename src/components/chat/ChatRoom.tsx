import { useEffect, useRef, useState } from "react";
import { MessageCircle, Users, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChatMessages } from "@/hooks/useChatMessages";
import { useOnlinePresence } from "@/hooks/useOnlinePresence";
import { useUserProgress } from "@/hooks/useUserProgress";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { ShareQuizModal } from "./ShareQuizModal";
import { ShareableQuiz } from "@/hooks/useShareableQuizzes";
import { useToast } from "@/hooks/use-toast";

const STREAK_SLOGANS = [
  "Tui đang đạt chuỗi {streak} ngày nè! Ghê chưa? 😎",
  "Đã duy trì được {streak} ngày liên tiếp! Ai đua không? 🚀",
  "{streak} ngày on-top server! Cố gắng bám đuôi nhé! 👑",
  "Chăm chỉ {streak} ngày rồi. Kiến thức đang ngấm dần... 🧠",
  "Không thể cản phá! Chuỗi {streak} ngày bất bại! 🔥",
];

interface ChatRoomProps {
  onLoginClick?: () => void;
}

export function ChatRoom({ onLoginClick }: ChatRoomProps) {
  const {
    messages,
    isLoading,
    sendMessage,
    sendQuizShare,
    sendStreakShare,
    deleteMessage,
    currentUserId,
    userProfiles,
  } = useChatMessages();
  const { streak } = useUserProgress();
  const { onlineCount, isConnected } = useOnlinePresence(currentUserId);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const { toast } = useToast();

  const handleShareStreak = async () => {
    if (streak <= 0) {
      toast({
        title: "Chưa có chuỗi",
        description:
          "Hãy học bài hoặc làm quiz để có chuỗi ngày liên tiếp nhé!",
      });
      return;
    }

    const randomSlogan =
      STREAK_SLOGANS[Math.floor(Math.random() * STREAK_SLOGANS.length)];
    const slogan = randomSlogan.replace("{streak}", streak.toString());
    const imageId = Math.floor(Math.random() * 4) + 1; // 1 to 4

    await sendStreakShare({
      streak,
      slogan,
      imageId,
    });
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (autoScroll) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, autoScroll, isLoading]);

  // Detect if user scrolled up
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    const isAtBottom =
      target.scrollHeight - target.scrollTop - target.clientHeight < 50;
    setAutoScroll(isAtBottom);
  };

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden relative">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-muted/30">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-primary" />
          <h2 className="font-bold text-lg">Phòng Chat Chung</h2>
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
        onScrollCapture={handleScroll}>
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
                    streak={message.user_id === currentUserId ? streak : 0}
                    onDelete={
                      message.user_id === currentUserId
                        ? deleteMessage
                        : undefined
                    }
                  />
                );
              })}
              <div ref={messagesEndRef} />
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
        onOpenShare={() => setIsShareOpen(true)}
        onShareStreak={handleShareStreak}
      />

      <ShareQuizModal
        open={isShareOpen}
        onOpenChange={setIsShareOpen}
        userId={currentUserId}
        onSelect={async (quiz: ShareableQuiz) => {
          const success = await sendQuizShare({
            quiz_id: quiz.id,
            quiz_title: quiz.title,
            question_count: quiz.question_count,
            status: quiz.status,
            is_public: quiz.is_public,
            expires_at: quiz.expires_at,
          });
          if (success) {
            setIsShareOpen(false);
          } else {
            toast({
              title: "Không thể chia sẻ",
              description: "Vui lòng thử lại sau.",
              variant: "destructive",
            });
          }
        }}
      />
    </div>
  );
}
