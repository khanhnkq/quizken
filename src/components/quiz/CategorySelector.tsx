import * as React from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X } from '@/lib/icons';
import {
  QUIZ_CATEGORIES,
  DIFFICULTY_LEVELS,
  type QuizCategory,
  type QuizDifficulty,
} from "@/lib/constants/quizCategories";
import { useTranslation } from "react-i18next";

interface CategorySelectorProps {
  category: QuizCategory;
  difficulty: QuizDifficulty;
  tags: string[];
  onCategoryChange: (category: QuizCategory) => void;
  onDifficultyChange: (difficulty: QuizDifficulty) => void;
  onTagsChange: (tags: string[]) => void;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  category,
  difficulty,
  tags,
  onCategoryChange,
  onDifficultyChange,
  onTagsChange,
}) => {
  const { t } = useTranslation();
  const [tagInput, setTagInput] = React.useState("");

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().toLowerCase();
      if (!tags.includes(newTag) && tags.length < 5) {
        onTagsChange([...tags, newTag]);
        setTagInput("");
      }
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onTagsChange(tags.filter((tag) => tag !== tagToRemove));
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Category Selection */}
        <div className="space-y-2">
          <Label htmlFor="category">{t('library.search.category')}</Label>
          <Select
            value={category}
            onValueChange={(v) => onCategoryChange(v as QuizCategory)}
          >
            <SelectTrigger id="category" className="w-full">
              <SelectValue placeholder={t('library.search.category')} />
            </SelectTrigger>
            <SelectContent>
              {QUIZ_CATEGORIES.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  <div className="flex items-center gap-2">
                    <span>{cat.icon}</span>
                    <div className="flex flex-col items-start">
                      <span className="font-medium">{t(cat.label)}</span>
                      <span className="text-xs text-muted-foreground">
                        {t(cat.description)}
                      </span>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Difficulty Selection */}
        <div className="space-y-2">
          <Label htmlFor="difficulty">{t('library.search.difficulty')}</Label>
          <Select
            value={difficulty}
            onValueChange={(v) => onDifficultyChange(v as QuizDifficulty)}
          >
            <SelectTrigger id="difficulty" className="w-full">
              <SelectValue placeholder={t('library.search.difficulty')} />
            </SelectTrigger>
            <SelectContent>
              {DIFFICULTY_LEVELS.map((diff) => (
                <SelectItem key={diff.value} value={diff.value}>
                  <span className="flex items-center gap-2">
                    <diff.icon className="w-4 h-4" />
                    {t(diff.label)}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tags Input */}
      <div className="space-y-2">
        <Label htmlFor="tags">
          {t('library.tags.label')}
        </Label>
        <Input
          id="tags"
          type="text"
          placeholder={t('library.tags.placeholder')}
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={handleAddTag}
          disabled={tags.length >= 5}
          className="w-full"
        />
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {tags.map((tag, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="flex items-center gap-1 px-2 py-1"
              >
                #{tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-1 hover:bg-muted rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
        <p className="text-xs text-muted-foreground">
          {t('library.tags.helper', { count: tags.length })}
        </p>
      </div>
    </div>
  );
};
