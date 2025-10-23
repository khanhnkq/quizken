import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  QUIZ_CATEGORIES,
  DIFFICULTY_LEVELS,
  getCategoryIcon,
  getCategoryLabel,
  type QuizCategory,
  type QuizDifficulty,
} from "@/lib/constants/quizCategories";
import { BookOpen } from '@/lib/icons';
import { useAudio } from "@/contexts/SoundContext";

interface CategoryFiltersProps {
  selectedCategory: QuizCategory | "all";
  selectedDifficulty: QuizDifficulty | "all";
  onCategoryChange: (category: QuizCategory | "all") => void;
  onDifficultyChange: (difficulty: QuizDifficulty | "all") => void;
  availableCategories?: string[]; // Dynamic categories from quizzes
}

export const CategoryFilters: React.FC<CategoryFiltersProps> = ({
  selectedCategory,
  selectedDifficulty,
  onCategoryChange,
  onDifficultyChange,
  availableCategories = [],
}) => {
  // Merge common categories with dynamic categories
  const commonCategoryValues = QUIZ_CATEGORIES.map((c) => c.value as string);
  const dynamicCategories = availableCategories.filter(
    (cat) => !commonCategoryValues.includes(cat)
  );

  // Preset A: âm thanh khi áp dụng bộ lọc
  const { play } = useAudio();

  return (
    <div className="flex flex-wrap gap-3 items-center">
      {/* Category Filter */}
      <Select
        value={selectedCategory}
        onValueChange={(v) => {
          play("toggle");
          onCategoryChange(v as QuizCategory | "all");
        }}>
        <SelectTrigger className="w-[180px] border-2">
          <SelectValue placeholder="Chủ đề" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">
            <span className="flex items-center gap-2">
              <BookOpen size={14} className="mr-1" />
              Tất cả chủ đề
            </span>
          </SelectItem>

          {/* Common/Suggested Categories */}
          {QUIZ_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <SelectItem key={cat.value} value={cat.value}>
                <span className="flex items-center gap-2">
                  <Icon size={14} className="mr-1" />
                  <span>{cat.label}</span>
                </span>
              </SelectItem>
            );
          })}

          {/* Dynamic AI-generated Categories */}
          {dynamicCategories.length > 0 && (
            <>
              <SelectItem
                value="separator"
                disabled
                className="text-xs text-muted-foreground">
                ─── AI-generated ───
              </SelectItem>
              {dynamicCategories.map((cat) => {
                const Icon = getCategoryIcon(cat);
                return (
                  <SelectItem key={cat} value={cat}>
                    <span className="flex items-center gap-2">
                      <Icon size={14} className="mr-1" />
                      <span>{getCategoryLabel(cat)}</span>
                    </span>
                  </SelectItem>
                );
              })}
            </>
          )}
        </SelectContent>
      </Select>

      {/* Difficulty Filter */}
      <Select
        value={selectedDifficulty}
        onValueChange={(v) => {
          play("toggle");
          onDifficultyChange(v as QuizDifficulty | "all");
        }}>
        <SelectTrigger className="w-[150px] border-2">
          <SelectValue placeholder="Độ khó" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tất cả độ khó</SelectItem>
          {DIFFICULTY_LEVELS.map((diff) => {
            const Icon = diff.icon;
            return (
              <SelectItem key={diff.value} value={diff.value}>
                <span className="flex items-center gap-2">
                  <Icon size={14} className="mr-1" />
                  {diff.label}
                </span>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>

      {/* Active Filters Display */}
      {(selectedCategory !== "all" || selectedDifficulty !== "all") && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>|</span>
          {selectedCategory !== "all" &&
            (() => {
              const categoryInfo = QUIZ_CATEGORIES.find(
                (c) => c.value === selectedCategory
              );
              if (categoryInfo) {
                const Icon = categoryInfo.icon;
                return (
                  <span className="text-foreground font-medium flex items-center gap-1">
                    <Icon size={14} />
                    {categoryInfo.label}
                  </span>
                );
              }
              return null;
            })()}
          {selectedDifficulty !== "all" &&
            (() => {
              const diffInfo = DIFFICULTY_LEVELS.find(
                (d) => d.value === selectedDifficulty
              );
              if (diffInfo) {
                const Icon = diffInfo.icon;
                return (
                  <span className="text-foreground font-medium flex items-center gap-1">
                    <Icon size={14} />
                    {diffInfo.label}
                  </span>
                );
              }
              return null;
            })()}
        </div>
      )}
    </div>
  );
};
