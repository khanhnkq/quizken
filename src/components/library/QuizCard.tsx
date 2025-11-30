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
  ArrowDown,
  FileDown,
} from "@/lib/icons";
import {
  QuizCategoryBadge,
  QuizTags,
} from "@/components/library/QuizCategoryBadge";
import type { QuizCategory, QuizDifficulty } from "@/lib/constants/quizCategories";
import { useTranslation } from "react-i18next";

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
  formatDate: (dateString: string) => string;
  formatNumber: (n: number) => string;
}

export const QuizCard: React.FC<QuizCardProps> = ({
  quiz,
  onPreview,
  onUse,
  onDownload,
  formatDate,
  formatNumber,
}) => {
  const { t } = useTranslation();
  const questionCount = Array.isArray(quiz.questions) ? quiz.questions.length : 0;

  return (
    <Card className="border-2 hover:border-[#B5CC89] transition-all duration-300 md:hover:shadow-lg md:hover:scale-105 flex flex-col h-full">
      {/* Header - Fixed height area */}
      <CardHeader className="pb-4 flex-shrink-0">
        <div className="space-y-3">
          {/* Title with consistent height */}
          <div className="min-h-[3.5rem]">
            <CardTitle className="text-lg line-clamp-2 leading-snug">
              {quiz.title}
            </CardTitle>
          </div>

          {/* Public badge */}
          <div>
            <Badge
              variant="secondary"
              className="bg-[#B5CC89]/20 text-[#B5CC89]">
              {t('library.card.public')}
            </Badge>
          </div>

          {/* Description with consistent height */}
          <div className="min-h-[2.5rem]">
            {quiz.description ? (
              <CardDescription className="line-clamp-2">
                {quiz.description}
              </CardDescription>
            ) : (
              <CardDescription className="text-muted-foreground/50 italic">
                {t('library.card.noDescription')}
              </CardDescription>
            )}
          </div>

          {/* Category and Difficulty */}
          <div>
            <QuizCategoryBadge
              category={quiz.category}
              difficulty={quiz.difficulty}
              size="sm"
            />
          </div>
        </div>
      </CardHeader>

      {/* Content - Flexible grow area */}
      <CardContent className="space-y-4 flex-grow flex flex-col">
        {/* Tags with consistent height */}
        <div className="min-h-[2rem]">
          {quiz.tags && quiz.tags.length > 0 ? (
            <QuizTags tags={quiz.tags} maxTags={3} />
          ) : (
            <div className="h-6" /> // Placeholder for consistent spacing
          )}
        </div>

        {/* Spacer to push stats and buttons to bottom */}
        <div className="flex-grow" />

        {/* Stats - Fixed height area */}
        <div className="flex flex-wrap items-center text-sm text-muted-foreground gap-3 min-h-[1.5rem]">
          <div
            className="flex items-center gap-1"
            title={t('library.card.usageCount')}>
            <FileDown className="h-3.5 w-3.5 text-[#B5CC89]" />
            <span className="font-semibold text-foreground">
              {formatNumber(quiz.usage_count || 0)}
            </span>
          </div>
          <div
            className="flex items-center gap-1"
            title={t('library.card.downloadCount')}>
            <ArrowDown className="h-3.5 w-3.5 text-blue-500" />
            <span className="font-semibold text-foreground">
              {formatNumber(quiz.pdf_download_count || 0)}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <BookOpen className="h-3 w-3" />
            <span>{questionCount} {t('library.card.questions')}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{formatDate(quiz.created_at)}</span>
          </div>
        </div>

        {/* Action Buttons - Fixed height area */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onPreview}
            className="w-full min-w-0 hover:bg-accent transition-colors">
            {t('library.card.preview')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onUse}
            className="w-full min-w-0 hover:bg-[#B5CC89] hover:text-white transition-colors">
            {t('library.card.use')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onDownload}
            className="w-full min-w-0 hover:bg-muted">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
