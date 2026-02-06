import { useState, useRef, KeyboardEvent } from "react";
import { Send, LogIn, Share2, Flame, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

// Add ChatMessage interface if not imported
import type { ChatMessage } from "@/hooks/useChatMessages";

interface ChatInputProps {
  onSendMessage: (content: string, replyToId?: string) => Promise<boolean>;
  onOpenShare?: () => void;
  onShareStreak?: () => void;
  onShareZCoin?: () => void;
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
  onShareZCoin,
  isAuthenticated,
  onLoginClick,
  disabled,
  replyingTo,
  onCancelReply,
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setMessage(newValue);

    // Simple detection: if the last character is '@' or we are typing after '@'
    // Regex to match '@' followed by optional characters at the end of the string
    const match = newValue.match(/@([\p{L}\p{N}_]*)$/u);
    setShowSuggestions(!!match);
  };

  const insertMention = (name: string) => {
    // Replace the query with the full mention
    const newValue = message.replace(/@([\p{L}\p{N}_]*)$/u, `@${name} `);
    setMessage(newValue);
    setShowSuggestions(false);
    textareaRef.current?.focus();
  };

  const handleSend = async () => {
    if (!message.trim() || isSending || !isAuthenticated) return;

    setIsSending(true);
    try {
      // Content Moderation Check
      const { checkToxicContent } = await import("@/lib/utils/badwords");
      const toxicWord = checkToxicContent(message);
      if (toxicWord) {
        const { toast } = await import("@/hooks/use-toast");
        toast({
          title: "⚠️ Nội dung không phù hợp",
          description: `Tin nhắn của bạn chứa từ ngữ không phù hợp (${toxicWord}). Hãy giữ phòng chat văn minh nhé! ✨`,
          variant: "destructive",
        });
        return;
      }

      const success = await onSendMessage(message, replyingTo?.id);
      if (success) {
        setMessage("");
        onCancelReply?.();
        textareaRef.current?.focus();
      }
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (showSuggestions) {
        // If suggestions are shown, Enter selects the first one (Quít Quít)
        insertMention("Quít Quít");
      } else {
        handleSend();
      }
    } else if (e.key === "Escape" && showSuggestions) {
      setShowSuggestions(false);
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
              } else if (parsed?.type === "zcoin_share" && parsed.data) {
                contentPreview = `🪙 ${parsed.data.zcoin.toLocaleString()} ZCoin`;
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

        <div className="flex gap-2 items-end relative">
          {showSuggestions && (
            <div className="absolute bottom-full left-0 mb-2 w-64 bg-popover border rounded-md shadow-md z-50 overflow-hidden animate-in fade-in slide-in-from-bottom-2">
              <Command className="w-full">
                <CommandList>
                  <CommandGroup heading="Gợi ý">
                    <CommandItem
                      onSelect={() => insertMention("Quít Quít")}
                      className="cursor-pointer gap-2"
                    >
                      <img
                        src="https://res.cloudinary.com/dgk3boljk/image/upload/v1770347600/user/avatar/jwpbwzeltiowzbaasp5u.webp"
                        alt="Quít Quít"
                        className="w-5 h-5 rounded-full object-cover"
                      />
                      <span>Quít Quít</span>
                    </CommandItem>
                  </CommandGroup>
                </CommandList>
              </Command>
            </div>
          )}
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={handleInputChange}
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
              disabled={disabled || isSending}
              title="Khoe Streak">
              <Flame className="h-5 w-5 fill-current" />
            </Button>
          )}
          {onShareZCoin && (
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="shrink-0 h-[44px] w-[44px] text-yellow-500 hover:text-yellow-600"
              onClick={onShareZCoin}
              disabled={disabled || isSending}
              title="Khoe ZCoin">
              <Coins className="h-5 w-5" />
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
