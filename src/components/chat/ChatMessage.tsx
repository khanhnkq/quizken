import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { Trash2, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { ChatMessage as ChatMessageType } from "@/hooks/useChatMessages";

interface ChatMessageProps {
  message: ChatMessageType;
  isOwnMessage: boolean;
  avatarUrl?: string;
  displayName?: string;
  userLevel?: number;
  onDelete?: (messageId: string) => void;
}

// Generate a consistent color based on user_id
function getUserColor(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = hash % 360;
  return `hsl(${hue}, 70%, 50%)`;
}

export function ChatMessage({ message, isOwnMessage, avatarUrl, displayName, userLevel, onDelete }: ChatMessageProps) {
  const timeAgo = formatDistanceToNow(new Date(message.created_at), {
    addSuffix: true,
    locale: vi,
  });

  const avatarColor = getUserColor(message.user_id);

  return (
    <div className="group px-4 py-2 hover:bg-muted/50 transition-colors">
      {/* Display Name and Level - Only for other users */}
      {!isOwnMessage && (displayName || userLevel) && (
        <div className="flex items-center gap-1.5 mb-1 ml-11">
          {displayName && (
            <span className="text-xs font-medium text-muted-foreground">
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
      <div
        className={cn(
          "flex gap-3",
          isOwnMessage && "flex-row-reverse"
        )}
      >
        <Avatar className="h-8 w-8 shrink-0">
          {avatarUrl && <AvatarImage src={avatarUrl} alt={displayName || "User"} />}
          <AvatarFallback
            style={{ backgroundColor: isOwnMessage ? undefined : avatarColor }}
            className={cn(
              "text-xs font-medium",
              isOwnMessage
                ? "bg-primary text-primary-foreground"
                : "text-white"
            )}
          >
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>

        <div
          className={cn(
            "flex flex-col",
            isOwnMessage ? "items-end" : "items-start"
          )}
        >
          <div
            className={cn(
              "rounded-2xl px-4 py-2 max-w-[280px] md:max-w-[400px]",
              isOwnMessage
                ? "bg-primary text-primary-foreground rounded-tr-sm"
                : "bg-muted rounded-tl-sm"
            )}
          >
            <p className="text-sm whitespace-pre-wrap break-words">
              {message.content}
            </p>
          </div>

          <div
            className={cn(
              "flex items-center gap-2 mt-1",
              isOwnMessage && "flex-row-reverse"
            )}
          >
            <span className="text-xs text-muted-foreground">{timeAgo}</span>

            {isOwnMessage && onDelete && (
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => onDelete(message.id)}
              >
                <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
