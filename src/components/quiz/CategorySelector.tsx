import React from "react";
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
import { X } from "lucide-react";
import {
  QUIZ_CATEGORIES,
  type QuizCategory,
  type QuizDifficulty,
} from "@/lib/constants/quizCategories";

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
          <Label htmlFor="category">Chủ đề</Label>
          <Select
            value={category}
            onValueChange={(v) => onCategoryChange(v as QuizCategory)}
          >
            <SelectTrigger id="category" className="w-full">
              <SelectValue placeholder="Chọn chủ đề" />
            </SelectTrigger>
            <SelectContent>
              {QUIZ_CATEGORIES.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  <div className="flex items-center gap-2">
                    <span>{cat.icon}</span>
                    <div className="flex flex-col items-start">
                      <span className="font-medium">{cat.label}</span>
                      <span className="text-xs text-muted-foreground">
                        {cat.description}
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
          <Label htmlFor="difficulty">Độ khó</Label>
          <Select
            value={difficulty}
            onValueChange={(v) => onDifficultyChange(v as QuizDifficulty)}
          >
            <SelectTrigger id="difficulty" className="w-full">
              <SelectValue placeholder="Chọn độ khó" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="easy">
                <span className="flex items-center gap-2">
                  🟢 Dễ
                </span>
              </SelectItem>
              <SelectItem value="medium">
                <span className="flex items-center gap-2">
                  🟡 Trung bình
                </span>
              </SelectItem>
              <SelectItem value="hard">
                <span className="flex items-center gap-2">
                  🔴 Khó
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tags Input */}
      <div className="space-y-2">
        <Label htmlFor="tags">
          Tags (tối đa 5 tags, nhấn Enter để thêm)
        </Label>
        <Input
          id="tags"
          type="text"
          placeholder="VD: lịch sử, việt nam, cơ bản..."
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
          {tags.length}/5 tags • Tags giúp người dùng tìm kiếm quiz dễ dàng hơn
        </p>
      </div>
    </div>
  );
};
