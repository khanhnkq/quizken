import { useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  useShareableQuizzes,
  ShareableQuiz,
} from "@/hooks/useShareableQuizzes";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { AlertTriangle, BookOpenCheck, Send, ListFilter } from "lucide-react";
import { useTranslation } from "react-i18next";

interface ShareQuizModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId?: string | null;
  onSelect: (quiz: ShareableQuiz) => void;
}

export function ShareQuizModal({
  open,
  onOpenChange,
  userId,
  onSelect,
}: ShareQuizModalProps) {
  const { data, isLoading, error, refetch } = useShareableQuizzes(
    userId || undefined,
  );
  const { t } = useTranslation();

  const quizzes = useMemo(() => data || [], [data]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-5 py-4 border-b bg-muted/20">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-base font-semibold">
              {t("chat.share.title", "Share your quiz")}
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => refetch()}
              disabled={isLoading}>
              <ListFilter className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="p-0">
          {error && (
            <div className="p-4 flex items-center gap-3 text-sm text-destructive bg-destructive/5 m-4 rounded-lg">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>
                {t(
                  "chat.share.loadError",
                  "Unable to load quizzes. Please try again.",
                )}
              </span>
            </div>
          )}

          {isLoading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3 w-3/4" />
                    <Skeleton className="h-2 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : quizzes.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-3">
                <ListFilter className="h-6 w-6 text-muted-foreground/50" />
              </div>
              <p className="text-sm text-muted-foreground">
                {t("chat.share.empty", "You have no completed quizzes yet.")}
              </p>
            </div>
          ) : (
            <div className="max-h-[360px] overflow-y-auto">
              <div className="divide-y">
                {quizzes.map((quiz) => (
                  <button
                    key={quiz.id}
                    onClick={() => onSelect(quiz)}
                    className="w-full flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors text-left group">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <BookOpenCheck className="h-5 w-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate text-foreground/90 group-hover:text-primary transition-colors">
                        {quiz.title}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                        <span>
                          {quiz.question_count}{" "}
                          {t("chat.share.questions", "questions")}
                        </span>
                        <span className="text-muted-foreground/40">•</span>
                        <span>
                          {formatDistanceToNow(new Date(quiz.created_at), {
                            addSuffix: true,
                            locale: vi,
                          })}
                        </span>
                      </div>
                    </div>

                    <div className="pl-2 text-muted-foreground group-hover:text-primary transition-colors">
                      <Send className="h-4 w-4" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="p-3 bg-muted/20 border-t text-xs text-center text-muted-foreground">
          {t("chat.share.subtitle", "Select a completed quiz to send to chat.")}
        </div>
      </DialogContent>
    </Dialog>
  );
}
