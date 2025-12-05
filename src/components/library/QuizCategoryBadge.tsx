import * as React from "react";
import { Badge } from "@/components/ui/badge";
import {
  getCategoryIcon,
  getCategoryLabel,
  getCategoryColor,
  getDifficultyInfo,
  getDifficultyLabel,
  QUIZ_CATEGORIES,
  type QuizCategory,
  type QuizDifficulty,
} from "@/lib/constants/quizCategories";
import { useTranslation } from "react-i18next";

interface QuizCategoryBadgeProps {
  category: QuizCategory;
  difficulty?: QuizDifficulty;
  size?: "sm" | "md" | "lg";
  showDifficulty?: boolean;
}

export const QuizCategoryBadge: React.FC<QuizCategoryBadgeProps> = ({
  category,
  difficulty,
  size = "md",
  showDifficulty = true,
}) => {
  const { t } = useTranslation();
  const categoryColor = getCategoryColor(category);
  const CategoryIcon = getCategoryIcon(category);

  // Use translation if available, fallback to helper for dynamic categories
  const categoryLabel = t(getCategoryLabel(category));

  const difficultyInfo = difficulty ? getDifficultyInfo(difficulty) : null;
  const DifficultyIcon = difficultyInfo?.icon;

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-3 py-1",
    lg: "text-base px-4 py-1.5",
  };

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16,
  };

  return (
    <div className="flex items-center gap-2">
      {/* Category Badge */}
      <Badge
        variant="secondary"
        className={`${sizeClasses[size]} font-medium flex items-center gap-1.5`}
        style={{
          backgroundColor: `${categoryColor}20`,
          color: categoryColor,
          borderColor: `${categoryColor}40`,
        }}
      >
        <CategoryIcon size={iconSizes[size]} strokeWidth={2} />
        {categoryLabel}
      </Badge>

      {/* Difficulty Badge */}
      {showDifficulty && difficulty && difficultyInfo && DifficultyIcon && (
        <Badge
          variant="outline"
          className={`${sizeClasses[size]} font-medium flex items-center gap-1.5`}
          style={{
            backgroundColor: `${difficultyInfo.color}20`,
            color: difficultyInfo.color,
            borderColor: `${difficultyInfo.color}40`,
          }}
        >
          <DifficultyIcon size={iconSizes[size]} strokeWidth={2} />
          {t(getDifficultyLabel(difficulty))}
        </Badge>
      )}
    </div>
  );
};

interface QuizTagsProps {
  tags: string[];
  maxTags?: number;
}

export const QuizTags: React.FC<QuizTagsProps> = ({ tags, maxTags = 3 }) => {
  if (!tags || tags.length === 0) return null;

  const displayTags = tags.slice(0, maxTags);
  const remainingCount = tags.length - maxTags;

  return (
    <div className="flex flex-wrap gap-1.5">
      {displayTags.map((tag, index) => (
        <Badge
          key={index}
          variant="secondary"
          className="text-xs px-2 py-0.5 bg-secondary/50"
        >
          #{tag}
        </Badge>
      ))}
      {remainingCount > 0 && (
        <Badge
          variant="secondary"
          className="text-xs px-2 py-0.5 bg-secondary/30 text-muted-foreground"
        >
          +{remainingCount}
        </Badge>
      )}
    </div>
  );
};
