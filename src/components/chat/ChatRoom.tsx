import { useEffect, useRef, useState } from "react";
import { MessageCircle, Users, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChatMessages } from "@/hooks/useChatMessages";
import { useOnlinePresence } from "@/hooks/useOnlinePresence";
import { useUserProgress } from "@/hooks/useUserProgress";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { ShareQuizModal } from "./ShareQuizModal";
import { ShareableQuiz } from "@/hooks/useShareableQuizzes";
import { useToast } from "@/hooks/use-toast";
import { useChatImages } from "@/contexts/ChatImagesContext";
import { useProfile } from "@/hooks/useProfile";
import { VietnamFlagIcon } from "@/components/icons/VietnamFlagIcon";
import { NeonCyberSkullIcon, PastelCloudIcon, ComicBoomIcon } from "@/components/icons/ThemeIcons";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const STREAK_SLOGANS = [
  "Tui đang đạt chuỗi {streak} ngày nè! Ghê chưa? 😎",
  "Đã duy trì được {streak} ngày liên tiếp! Ai đua không? 🚀",
  "{streak} ngày on-top server! Cố gắng bám đuôi nhé! 👑",
  "Chăm chỉ {streak} ngày rồi. Kiến thức đang ngấm dần... 🧠",
  "Không thể cản phá! Chuỗi {streak} ngày bất bại! 🔥",
  "Sống trong giang hồ, ai không biết đến cái tên tao? (Chuỗi {streak} ngày)",
  "Bước vào cuộc chơi này, không có đường lui. Đã đi được {streak} ngày.",
  "Giang hồ máu lửa, anh em sống chết có nhau. {streak} ngày tình nghĩa.",
  "Tiền bạc, danh vọng chẳng là gì, tình nghĩa mới là trên hết.",
  "Chơi với bạn hết lòng, chơi với thù hết sức.",
  "Một lần bước chân vào giang hồ, không còn đường quay lại. Clip {streak} ngày.",
  "Số phận an bài, tao không sợ. Giữ chuỗi {streak} ngày là do tao.",
  "Thắng làm vua, thua làm giặc, giang hồ là vậy.",
  "Giang hồ hiểm ác, không ai biết trước ngày mai. Nhưng tao biết tao có chuỗi {streak} ngày.",
  "Không cần nhiều lời, chỉ cần hành động. {streak} ngày liên tiếp.",
  "Cái chết không sợ, chỉ sợ sống không đáng. Sống phải có chuỗi {streak} ngày.",
  "Lênh đênh giang hồ, ai hiểu được lòng tao?",
  "Lợi danh là hư ảo, tình nghĩa mới là chân thật.",
  "Người ta sợ tao, tao chỉ sợ mất anh em (và mất chuỗi {streak} ngày).",
  "Đời là bể khổ, mà giang hồ là bể máu.",
  "Không có bạn tốt, chỉ có kẻ thù mạnh.",
  "Đánh đổi tất cả, chỉ để bảo vệ anh em.",
  "Giang hồ muôn mặt, ai thật, ai giả?",
  "Không ai thắng mãi, chỉ có người không biết dừng lại.",
  "Giang hồ không dành cho kẻ yếu lòng. {streak} ngày kiên trì.",
  "Sống với giang hồ, phải biết luật chơi.",
  "Tao không chọn giang hồ, giang hồ chọn tao.",
  "Một khi đã bước vào, không có đường lui.",
  "Giang hồ là thế, không tin ai ngoài bản thân.",
  "Lòng người thay đổi, chỉ có mình tao là không đổi. Vẫn duy trì {streak} ngày.",
  "Thế gian lắm kẻ giả nhân, tao chỉ là tao.",
  "Tình nghĩa giang hồ, không cần nhiều lời.",
  "Đường đi không khó, chỉ sợ lòng không bền. {streak} ngày rồi chưa nản.",
  "Đã dấn thân vào giang hồ, sống chết không quan trọng.",
  "Tao không cần biết ai đúng ai sai, chỉ cần biết tao không sai.",
  "Một ngày giang hồ, cả đời giang hồ.",
  "Không sợ kẻ địch mạnh, chỉ sợ lòng không kiên.",
  "Giang hồ không nói lý, chỉ có máu và nước mắt.",
  "Tao là tao, không cần ai phải hiểu. (Chuỗi {streak} ngày)",
  "Không ai sống mãi, chỉ có danh tiếng còn lại.",
  "Thắng thua là chuyện bình thường, quan trọng là biết đứng dậy.",
  "Giang hồ không màu hồng, chỉ có máu và nước mắt.",
  "Không cần nhiều bạn, chỉ cần vài người anh em.",
  "Giang hồ là thế, không ai biết trước ngày mai.",
  "Đời giang hồ, ai dám khinh thường?",
  "Tao sống cho tao, không cần ai hiểu.",
  "Giang hồ không dành cho kẻ yếu.",
  "Lời nói gió bay, chỉ có hành động mới chứng minh.",
  "Không cần nhiều lời, chỉ cần hành động. (Đã đạt {streak} ngày)",
  "Tao không cần biết ai đúng ai sai, chỉ cần biết tao không sai.",
  "Giang hồ không có chỗ cho kẻ yếu lòng.",
  "Không cần biết tao là ai, chỉ cần biết tao không sợ.",
  "Tình nghĩa anh em, không gì sánh được.",
  "Sống trong giang hồ, ai cũng có một quá khứ.",
  "Giang hồ là vậy, không cần ai hiểu, chỉ cần bản thân hiểu.",
];

interface ChatRoomProps {
  onLoginClick?: () => void;
}

export function ChatRoom({ onLoginClick }: ChatRoomProps) {
  const { images } = useChatImages();

  const {
    messages,
    isLoading,
    sendMessage,
    sendQuizShare,
    sendStreakShare,
    sendZCoinShare,
    deleteMessage,
    toggleReaction,
    currentUserId,
    userProfiles,
  } = useChatMessages();
  const { streak } = useUserProgress();
  const { statistics } = useDashboardStats(currentUserId || undefined);
  const zcoin = statistics?.zcoin || 0;
  const { onlineCount, isConnected } = useOnlinePresence(currentUserId);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"quiz" | "streak">("quiz");
  const [replyingTo, setReplyingTo] = useState<any | null>(null);

  const handleReply = (message: any) => {
    const profile = userProfiles.get(message.user_id);
    setReplyingTo({
      ...message,
      display_name: profile?.display_name || "User",
    });
  };

  const cancelReply = () => {
    setReplyingTo(null);
  };
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
    
    // Random image ID (1-based index corresponding to our sorted URL list)
    // If list is empty, fallback to 1 to avoid 0 (though unlikely)
    const totalImages = Math.max(1, images.length);
    const imageId = Math.floor(Math.random() * totalImages) + 1;

    await sendStreakShare({
      streak,
      slogan,
      imageId,
    });
  };

  const handleShareZCoin = async () => {
    if (zcoin <= 0) {
      toast({
        title: "Chưa có ZCoin",
        description: "Hãy làm quiz và tạo quiz để kiếm ZCoin nhé!",
      });
      return;
    }

    // Use STREAK_SLOGANS ("giang hồ") as requested
    const randomSlogan =
      STREAK_SLOGANS[Math.floor(Math.random() * STREAK_SLOGANS.length)];
    // Slogan replacement adaptations...
    let adaptedSlogan = randomSlogan.replace("{streak} ngày", `${zcoin.toLocaleString()} ZCoin`);
    adaptedSlogan = adaptedSlogan.replace("{streak}", `${zcoin.toLocaleString()} ZCoin`);
    
    // Random image ID (1-based index)
    const totalImages = Math.max(1, images.length);
    const imageId = Math.floor(Math.random() * totalImages) + 1;

    await sendZCoinShare({
      zcoin,
      slogan: adaptedSlogan,
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
  
  const { profileData } = useProfile(currentUserId);
  const theme = profileData?.equipped_theme;

  // Fetch detailed theme config (like image_url) from DB
  const { data: themeItem } = useQuery({
    queryKey: ['themeItem', theme],
    queryFn: async () => {
      if (!theme) return null;
      // @ts-ignore
      const { data } = await supabase.from('items').select('image_url').eq('id', theme).single();
      return data as any;
    },
    enabled: !!theme
  });

  // Theme Background Config
  const getThemeBackground = () => {
     switch (profileData?.equipped_theme) {
         case 'theme_vietnam_spirit':
             return { Icon: VietnamFlagIcon, className: "opacity-80 mix-blend-multiply dark:mix-blend-screen grayscale-[0.2]" };
         case 'theme_neon_night':
             return { Icon: NeonCyberSkullIcon, className: "opacity-20 text-cyan-500 drop-shadow-[0_0_10px_rgba(0,255,255,0.5)]" };
         case 'theme_pastel_dream':
             return { Icon: PastelCloudIcon, className: "opacity-30 text-pink-300" };
         case 'theme_comic_manga':
             return { Icon: ComicBoomIcon, className: "opacity-10 text-yellow-500 rotate-12 scale-150" };
         default:
             return null;
     }
  };
  const themeBg = getThemeBackground();

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden relative">
      {/* Background Decor */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden text-foreground flex items-center justify-center">
        {/* Dynamic Image Background from Theme */}
        {themeItem?.image_url && (
            <div 
                className="absolute inset-0 opacity-[0.08] dark:opacity-[0.12] bg-center bg-no-repeat bg-cover transition-opacity duration-1000"
                style={{ backgroundImage: `url(${themeItem.image_url})` }}
            />
        )}

        {themeBg ? (
           <div className="absolute inset-0 flex items-center justify-center opacity-[0.03]">
              <themeBg.Icon className={`w-[80%] h-auto ${themeBg.className}`} />
           </div>
        ) : !themeItem?.image_url && (
          /* Dot Pattern - Polka Dots (Only if no image/icon theme) */
          <div
            className="absolute inset-0 opacity-[0.4]"
            style={{
              backgroundImage: "radial-gradient(#cbd5e1 2px, transparent 2px)",
              backgroundSize: "24px 24px",
            }}
          />
        )}
      </div>

      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b relative z-10 bg-background h-[60px]">
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
        className="flex-1 relative z-10"
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
                    currentUserId={currentUserId}
                    onToggleReaction={toggleReaction}
                    onReply={handleReply}
                    userProfiles={userProfiles}
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
      <div className="relative z-10">
        <ChatInput
          onSendMessage={sendMessage}
          onOpenShare={() => setIsShareOpen(true)}
          onShareStreak={handleShareStreak}
          onShareZCoin={handleShareZCoin}
          isAuthenticated={!!currentUserId}
          onLoginClick={onLoginClick}
          disabled={isLoading}
          replyingTo={replyingTo}
          onCancelReply={cancelReply}
        />
      </div>

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
