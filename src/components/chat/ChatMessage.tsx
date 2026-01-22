import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { Trash2, User, BookOpenCheck, ArrowRight, Flame, Smile, Reply } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { ChatMessage as ChatMessageType } from "@/hooks/useChatMessages";
import { UserProfilePopover } from "./UserProfilePopover";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface ChatMessageProps {
  message: ChatMessageType;
  isOwnMessage: boolean;
  avatarUrl?: string;
  displayName?: string;
  userLevel?: number;
  streak?: number;
  onDelete?: (messageId: string) => void;
  onAvatarClick?: () => void;
  onToggleReaction?: (messageId: string, emoji: string) => void;
  onReply?: (message: ChatMessageType) => void;
  currentUserId?: string | null;
  userProfiles?: Map<string, { display_name?: string; avatar_url?: string; user_level?: number }>;
}

// Generate a consistent color based on user_id
function getUserColor(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = hash % 360;
  return `hsl(${hue}, 70%, 40%)`;
}

export function ChatMessage({
  message,
  isOwnMessage,
  avatarUrl,
  displayName,
  userLevel,
  streak,
  onDelete,
  onAvatarClick,
  onToggleReaction,
  onReply,
  currentUserId,
  userProfiles,
}: ChatMessageProps) {
  const timeAgo = formatDistanceToNow(new Date(message.created_at), {
    addSuffix: true,
    locale: vi,
  });
  const { t } = useTranslation();

  const avatarColor = getUserColor(message.user_id);

  let parsed: any = null;
  if (message.content?.startsWith("{")) {
    try {
      parsed = JSON.parse(message.content);
    } catch (e) {
      parsed = null;
    }
  }

  const renderContent = () => {
    if (parsed?.type === "streak_share" && parsed.data) {
      let { streak, slogan, imageId } = parsed.data;

      // Fallback for old messages: Generate consistent imageId from message.id
      if (!imageId) {
        const hash = message.id
          .split("")
          .reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
        imageId = (hash % 4) + 1;
      }

      const bgImage = `/images/streak/fire-${imageId}.jpg`;

      return (
        <div
          className={cn(
            "block rounded-xl overflow-hidden mt-1 mb-1 max-w-[280px] relative transition-all hover:scale-[1.02]",
            isOwnMessage
              ? "border border-orange-500/30"
              : "border border-orange-200",
          )}
          style={{
            backgroundImage: `url('${bgImage}')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}>
          {/* Overlay to ensure text readability */}
          <div className="absolute inset-0 z-0 bg-black/60 backdrop-blur-[1px]" />

          <div className="p-4 relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 bg-orange-500 rounded-full text-white shadow-lg animate-pulse">
                <Flame className="h-4 w-4 fill-white" />
              </div>
              <span className="font-bold text-xs uppercase tracking-wider text-orange-100 drop-shadow-md">
                Streak Master
              </span>
            </div>

            <div className="text-center py-2">
              <span className="text-5xl font-black block leading-none mb-1 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                {streak}
              </span>
              <span className="text-[10px] uppercase font-bold text-orange-200 drop-shadow-sm tracking-widest">
                Ngày liên tiếp
              </span>
            </div>

            <div className="mt-3 pt-3 border-t border-white/20">
              <p className="text-sm italic text-center text-white/95 font-medium drop-shadow-md">
                "{slogan}"
              </p>
            </div>
          </div>
        </div>
      );
    }

    if (parsed?.type === "quiz_share" && parsed.data) {
      const q = parsed.data as {
        quiz_id: string;
        quiz_title: string;
        question_count?: number;
        status?: string;
      };
      return (
        <Link
          to={`/quiz/play/${q.quiz_id}`}
          className={cn(
            "block rounded-xl overflow-hidden transition-all group/card mt-1 mb-1",
            isOwnMessage
              ? "bg-black/10 hover:bg-black/20 border border-white/10"
              : "bg-background hover:bg-background/80 border border-border shadow-sm",
          )}>
          <div className="p-3">
            <div className="flex items-start gap-3">
              <div
                className={cn(
                  "p-2 rounded-lg shrink-0 flex items-center justify-center shadow-sm",
                  isOwnMessage
                    ? "bg-white/20 text-white"
                    : "bg-primary/10 text-primary",
                )}>
                <BookOpenCheck className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h4
                  className={cn(
                    "font-bold text-sm leading-tight line-clamp-2 mb-1",
                    isOwnMessage
                      ? "text-primary-foreground"
                      : "text-foreground",
                  )}>
                  {q.quiz_title}
                </h4>
                <div
                  className={cn(
                    "flex items-center gap-2 text-xs",
                    isOwnMessage
                      ? "text-primary-foreground/80"
                      : "text-muted-foreground",
                  )}>
                  <span className="font-medium">
                    {q.question_count || 0}{" "}
                    {t("chat.share.questions", "questions")}
                  </span>
                </div>
              </div>
            </div>

            <div
              className={cn(
                "mt-3 flex items-center justify-between text-xs font-bold px-3 py-2 rounded-lg transition-colors border",
                isOwnMessage
                  ? "bg-white text-primary border-transparent hover:bg-white/90 shadow-sm"
                  : "bg-primary text-primary-foreground border-transparent hover:bg-primary/90 shadow-sm",
              )}>
              {t("chat.share.openQuiz", "Open quiz")}
              <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </div>
        </Link>
      );
    }

    return (
      <p className="text-sm whitespace-pre-wrap break-words">
        {message.content}
      </p>
    );
  };

  return (
    <div className="group px-4 py-2 transition-colors">
      {/* Display Name and Level - Only for other users */}
      {!isOwnMessage && (displayName || userLevel) && (
        <div className="flex items-center gap-1.5 mb-1 ml-11">
          {displayName && (
            <span
              className="text-sm font-bold shadow-sm"
              style={{ color: isOwnMessage ? undefined : avatarColor }}>
              {displayName}
            </span>
          )}
          {userLevel && userLevel > 0 && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 bg-yellow-100 text-yellow-700 rounded-full">
              Lv.{userLevel}
            </span>
          )}
        </div>
      )}

      {/* Avatar + Message Row */}
      <div className={cn("flex gap-3", isOwnMessage && "flex-row-reverse")}>
        <UserProfilePopover
          userId={message.user_id}
          displayName={displayName}
          avatarUrl={avatarUrl}
          level={userLevel}
          streak={streak}>
          <Avatar
            className={cn(
              "h-8 w-8 shrink-0 cursor-pointer transition-transform hover:scale-110 active:scale-95",
            )}
            onClick={onAvatarClick}>
            {avatarUrl && (
              <AvatarImage src={avatarUrl} alt={displayName || "User"} />
            )}
            <AvatarFallback
              style={{
                backgroundColor: isOwnMessage ? undefined : avatarColor,
              }}
              className={cn(
                "text-xs font-medium",
                isOwnMessage
                  ? "bg-primary text-primary-foreground"
                  : "text-white",
              )}>
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
        </UserProfilePopover>

        <div
          className={cn(
            "flex flex-col",
            isOwnMessage ? "items-end" : "items-start",
          )}>
          <div
            className={cn(
              "rounded-2xl px-4 py-2 max-w-[280px] md:max-w-[400px]",
              isOwnMessage
                ? "bg-primary text-primary-foreground rounded-tr-sm"
                : "bg-muted rounded-tl-sm",
            )}>
            {/* Quoted Reply */}
            {message.reply_to && message.reply_to.content && (() => {
              const replyAuthorProfile = userProfiles?.get(message.reply_to.user_id);
              const replyAuthorName = message.reply_to.user_id === currentUserId
                ? t("chat.you", "You")
                : replyAuthorProfile?.display_name || "User";

              // Parse special content types
              let replyPreview: React.ReactNode = message.reply_to.content;
              if (message.reply_to.content.startsWith("{")) {
                try {
                  const parsed = JSON.parse(message.reply_to.content);
                  if (parsed?.type === "quiz_share" && parsed.data) {
                    replyPreview = (
                      <span className="flex items-center gap-1">
                        <BookOpenCheck className="h-3 w-3 shrink-0" />
                        <span className="truncate">{parsed.data.quiz_title}</span>
                      </span>
                    );
                  } else if (parsed?.type === "streak_share" && parsed.data) {
                    replyPreview = (
                      <span className="flex items-center gap-1">
                        <Flame className="h-3 w-3 shrink-0 text-orange-400" />
                        <span>Streak {parsed.data.streak} ngày</span>
                      </span>
                    );
                  }
                } catch (e) {
                  // Keep original content
                }
              }

              return (
                <div className={cn(
                  "mb-2 text-xs p-2 rounded border-l-4",
                  isOwnMessage
                    ? "bg-white/20 border-white/60"
                    : "bg-black/10 border-primary/50"
                )}>
                  <span className={cn(
                    "font-bold block mb-0.5",
                    isOwnMessage ? "text-white" : "text-primary"
                  )}>
                    {replyAuthorName}
                  </span>
                  <span className={cn(
                    "line-clamp-2 block",
                    isOwnMessage ? "text-white/80" : "text-foreground/70"
                  )}>
                    {replyPreview}
                  </span>
                </div>
              );
            })()}
            {renderContent()}
          </div>

          <div
            className={cn(
              "flex items-center gap-2 mt-1",
              isOwnMessage && "flex-row-reverse",
            )}>
            <span className="text-xs text-muted-foreground">{timeAgo}</span>

            {/* Reactions Display */}
            <div className="flex gap-1">
              {Object.entries(message.reactions || {}).map(
                ([emoji, userIds]: [string, any[]]) => {
                  if (!userIds || userIds.length === 0) return null;
                  const count = userIds.length;
                  const hasReacted = currentUserId
                    ? userIds.includes(currentUserId)
                    : false;
                  return (
                    <button
                      key={emoji}
                      onClick={() => onToggleReaction?.(message.id, emoji)}
                      className={cn(
                        "text-[10px] px-1.5 py-0.5 rounded-full border flex items-center gap-1 transition-colors",
                        hasReacted
                          ? "bg-blue-100 border-blue-200 text-blue-700"
                          : "bg-white border-border text-muted-foreground hover:bg-muted",
                      )}>
                      <span>{emoji}</span>
                      <span className="font-bold">{count}</span>
                    </button>
                  );
                },
              )}
            </div>

            {/* Add Reaction Button */}
            {onToggleReaction && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                  >
                    <Smile className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto p-1 flex gap-1"
                  align="center">
                  {["👍", "❤️", "😂", "😮", "😢", "🔥"].map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => onToggleReaction(message.id, emoji)}
                      className="p-2 hover:bg-muted rounded-md text-lg transition-transform hover:scale-110">
                      {emoji}
                    </button>
                  ))}
                </PopoverContent>
              </Popover>
            )}

            {/* Reply Button */}
            {onReply && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-primary hover:bg-primary/10 transition-colors"
                onClick={() => onReply(message)}>
                <Reply className="h-4 w-4" />
              </Button>
            )}

            {isOwnMessage && onDelete && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-muted-foreground/50 hover:text-destructive transition-colors"
                onClick={() => onDelete(message.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
