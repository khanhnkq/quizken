import { FramedAvatar } from "@/components/ui/FramedAvatar";
import { cn } from "@/lib/utils";

interface TypingIndicatorProps {
  displayName?: string;
  avatarUrl?: string;
}

export function TypingIndicator({ displayName = "Quít Quít", avatarUrl }: TypingIndicatorProps) {
  return (
    <div className="flex gap-3 px-4 py-2 animate-in fade-in slide-in-from-bottom-1 duration-300">
      <div className="shrink-0 pt-0.5">
        <FramedAvatar
          avatarUrl={avatarUrl}
          fallbackName={displayName}
          size="sm"
        />
      </div>
      <div className="flex flex-col items-start gap-1">
        <span className="text-sm font-bold text-primary ml-1">{displayName}</span>
        <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1 items-center shadow-sm border border-border/50">
          <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.3s]" />
          <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.15s]" />
          <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" />
        </div>
      </div>
    </div>
  );
}
