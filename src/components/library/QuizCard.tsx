import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Clock,
  Download,
  Play,
  Sparkles,
  TrendingUp,
  Share,
} from "lucide-react";
import {
  QuizTags,
} from "./QuizCategoryBadge";
import type { QuizCategory, QuizDifficulty } from "@/lib/constants/quizCategories";
import { getDifficultyLabel, getCategoryLabel } from "@/lib/constants/quizCategories";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

interface QuizCardProps {
  quiz: {
    id: string;
    title: string;
    description: string | null;
    questions: unknown;
    created_at: string;
    usage_count: number;
    pdf_download_count: number;
    category: QuizCategory;
    tags: string[];
    difficulty: QuizDifficulty;
  };
  onPreview: () => void;
  onUse: () => void;
  onDownload: () => void;
  onShare: () => void;
  formatDate: (dateString: string) => string;
  formatNumber: (n: number) => string;
}

export const QuizCard: React.FC<QuizCardProps> = ({
  quiz,
  onPreview,
  onUse,
  onDownload,
  onShare,
  formatDate,
  formatNumber,
}) => {
  const { t } = useTranslation();
  const questionCount = Array.isArray(quiz.questions) ? quiz.questions.length : 0;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case "easy":
        return "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800";
      case "hard":
        return "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700";
    }
  };

  return (
    <Card className="h-full flex flex-col rounded-3xl border-4 border-primary/20 hover:border-primary/40 dark:border-primary/10 dark:hover:border-primary/30 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 bg-white dark:bg-slate-900 group overflow-hidden">
      {/* Visual Header - Game Cartridge Style */}
      <div className="relative h-36 overflow-hidden bg-gradient-to-br from-secondary/50 to-secondary/20">
        {/* Decorative Pattern */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_1px_1px,#000_1px,transparent_0)] bg-[length:16px_16px]" />

        {/* Floating Icon */}
        <div className="absolute -right-6 -bottom-6 text-primary/10 transform rotate-12 group-hover:rotate-0 group-hover:scale-110 transition-all duration-500">
          <BookOpen className="w-32 h-32" />
        </div>

        {/* Difficulty Sticker */}
        {quiz.difficulty && (
          <div className={cn(
            "absolute top-4 right-4 rounded-full border-2 px-3 py-1 font-heading uppercase text-[10px] tracking-wider shadow-sm z-10",
            getDifficultyColor(quiz.difficulty)
          )}>
            {t(getDifficultyLabel(quiz.difficulty))}
          </div>
        )}

        {/* Category Sticker */}
        <div className="absolute bottom-4 left-4 z-10">
          <Badge variant="secondary" className="rounded-xl border-2 border-white/50 dark:border-slate-700/50 shadow-sm bg-white/80 dark:bg-slate-800/90 backdrop-blur-sm text-primary dark:text-slate-100 hover:bg-white dark:hover:bg-slate-700">
            {t(getCategoryLabel(quiz.category))}
          </Badge>
        </div>
      </div>

      <CardContent className="flex-grow p-3 md:p-5 pt-6 flex flex-col gap-3">
        {/* Title */}
        <h3 className="text-base md:text-xl font-heading font-bold text-foreground leading-tight line-clamp-2 min-h-[3rem] group-hover:text-primary transition-colors">
          {quiz.title}
        </h3>

        {/* Description */}
        <p className="line-clamp-2 text-sm text-muted-foreground min-h-[2.5rem]">
          {quiz.description || t('library.card.noDescription')}
        </p>

        {/* Stats Bubbles */}
        <div className="flex items-center gap-3 mt-2">
          <div className="flex items-center gap-1.5 bg-secondary/40 rounded-full px-3 py-1.5 text-xs font-medium text-muted-foreground">
            <BookOpen className="w-3.5 h-3.5" />
            <span>{questionCount} {t('library.card.questions')}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full px-3 py-1.5 text-xs font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{formatNumber(quiz.usage_count || 0)}</span>
          </div>
        </div>

        {/* Tags */}
        <div className="mt-2">
          {quiz.tags && quiz.tags.length > 0 ? (
            <QuizTags tags={quiz.tags} maxTags={2} />
          ) : null}
        </div>

        {/* Spacer */}
        <div className="flex-grow" />

        {/* Date */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
          <Clock className="w-3.5 h-3.5" />
          <span>{formatDate(quiz.created_at)}</span>
        </div>
      </CardContent>

      {/* Action Buttons - Match Hero Section Style */}
      <div className="p-5 pt-4 mt-auto border-t-2 border-border/30 bg-secondary/10 dark:bg-secondary/5">
        <div className="flex gap-3">
          <Button
            className="flex-1 rounded-3xl font-heading shadow-xl border-4 border-primary hover:border-primary-foreground/50 active:scale-95 transition-all duration-200 text-sm bg-primary text-white"
            variant="hero"
            size="lg"
            onClick={onUse}
          >
            <Sparkles className="w-4 h-4 mr-1.5" />
            {t('library.card.use')}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-12 w-12 rounded-3xl border-4 border-border bg-white dark:bg-slate-800 text-muted-foreground hover:border-primary/50 hover:bg-primary/10 hover:text-primary active:scale-95 transition-all duration-200"
            onClick={onPreview}
            title={t('library.card.preview')}
          >
            <BookOpen className="w-5 h-5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-12 w-12 rounded-3xl border-4 border-border bg-white dark:bg-slate-800 text-muted-foreground hover:border-purple-400 hover:bg-purple-50 hover:text-purple-500 active:scale-95 transition-all duration-200"
            onClick={(e) => {
              e.stopPropagation();
              onShare();
            }}
            title={t('library.card.share') || "Share"}
          >
            <Share className="w-5 h-5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-12 w-12 rounded-3xl border-4 border-border bg-white dark:bg-slate-800 text-muted-foreground hover:border-blue-400 hover:bg-blue-50 hover:text-blue-500 active:scale-95 transition-all duration-200"
            onClick={onDownload}
            title={t('library.card.download')}
          >
            <Download className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </Card>
  );
};
