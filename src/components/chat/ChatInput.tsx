import { useState, useRef, KeyboardEvent } from "react";
import { Send, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ChatInputProps {
  onSendMessage: (content: string) => Promise<boolean>;
  isAuthenticated: boolean;
  onLoginClick?: () => void;
  disabled?: boolean;
}

export function ChatInput({
  onSendMessage,
  isAuthenticated,
  onLoginClick,
  disabled,
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = async () => {
    if (!message.trim() || isSending || !isAuthenticated) return;

    setIsSending(true);
    const success = await onSendMessage(message);
    if (success) {
      setMessage("");
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
          onClick={onLoginClick}
        >
          <LogIn className="h-4 w-4" />
          Đăng nhập để gửi tin nhắn
        </Button>
      </div>
    );
  }

  return (
    <div className="border-t bg-background p-4">
      <div className="max-w-2xl">
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
          <Button
            size="icon"
            className="shrink-0 h-[44px] w-[44px]"
            onClick={handleSend}
            disabled={!message.trim() || isSending || disabled}
          >
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
