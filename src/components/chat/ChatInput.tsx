import { useState, useRef, KeyboardEvent } from "react";
import { Send, LogIn, Share2, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

// Add ChatMessage interface if not imported
import type { ChatMessage } from "@/hooks/useChatMessages";

interface ChatInputProps {
  onSendMessage: (content: string, replyToId?: string) => Promise<boolean>;
  onOpenShare?: () => void;
  onShareStreak?: () => void;
  isAuthenticated: boolean;
  onLoginClick?: () => void;
  disabled?: boolean;
  replyingTo?: ChatMessage | null;
  onCancelReply?: () => void;
}

export function ChatInput({
  onSendMessage,
  onOpenShare,
  onShareStreak,
  isAuthenticated,
  onLoginClick,
  disabled,
  replyingTo,
  onCancelReply,
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = async () => {
    if (!message.trim() || isSending || !isAuthenticated) return;

    setIsSending(true);
    const success = await onSendMessage(message, replyingTo?.id);
    if (success) {
      setMessage("");
      onCancelReply?.();
      textareaRef.current?.focus();
    }
    setIsSending(false);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="border-t bg-muted/30 p-4">
        <Button
          variant="outline"
          className="w-full gap-2"
          onClick={onLoginClick}>
          <LogIn className="h-4 w-4" />
          Đăng nhập để gửi tin nhắn
        </Button>
      </div>
    );
  }

  return (
    <div className="border-t bg-background p-4">
      <div className="max-w-2xl">
        {replyingTo && (() => {
          // Parse special content types for nice display
          let contentPreview: React.ReactNode = replyingTo.content;
          if (replyingTo.content?.startsWith("{")) {
            try {
              const parsed = JSON.parse(replyingTo.content);
              if (parsed?.type === "quiz_share" && parsed.data) {
                contentPreview = `📖 ${parsed.data.quiz_title}`;
              } else if (parsed?.type === "streak_share" && parsed.data) {
                contentPreview = `🔥 Streak ${parsed.data.streak} ngày`;
              }
            } catch (e) {
              // Keep original
            }
          }
          return (
            <div className="flex items-center justify-between bg-muted/50 p-2 rounded-t-lg mb-1 border-l-4 border-primary text-xs">
              <div className="truncate flex-1 mr-2">
                <span className="font-bold">
                  Replying to {replyingTo.display_name || "User"}:
                </span>{" "}
                <span className="text-muted-foreground line-clamp-1">
                  {contentPreview}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 shrink-0"
                onClick={onCancelReply}>
                <span className="sr-only">Cancel Reply</span>
                <span aria-hidden="true" className="text-lg leading-none">
                  ×
                </span>
              </Button>
            </div>
          );
        })()}

        <div className="flex gap-2 items-end">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Nhập tin nhắn... (Enter để gửi, Shift+Enter để xuống dòng)"
            className="min-h-[44px] max-h-[120px] resize-none"
            disabled={disabled || isSending}
            rows={1}
          />
          {onOpenShare && (
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="shrink-0 h-[44px] w-[44px]"
              onClick={onOpenShare}
              disabled={disabled || isSending}>
              <Share2 className="h-4 w-4" />
            </Button>
          )}
          {onShareStreak && (
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="shrink-0 h-[44px] w-[44px] text-orange-500 hover:text-orange-600"
              onClick={onShareStreak}
              disabled={disabled || isSending}>
              <Flame className="h-5 w-5 fill-current" />
            </Button>
          )}
          <Button
            size="icon"
            className="shrink-0 h-[44px] w-[44px]"
            onClick={handleSend}
            disabled={!message.trim() || isSending || disabled}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Tối đa 1000 ký tự • Nhấn Enter để gửi
        </p>
      </div>
    </div>
  );
}
