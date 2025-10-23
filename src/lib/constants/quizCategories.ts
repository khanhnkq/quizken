// Quiz Categories and Tags Constants
import type { LucideIcon } from '@/lib/icons';
import {
  BookOpen,
  GraduationCap,
  Microscope,
  FlaskConical,
  Film,
  Target,
  Globe,
  Calculator,
  Scroll,
  MapPin,
  Book,
  Laptop,
  Briefcase,
  Heart,
  Trophy,
  Palette,
  Music,
  Tag,
  CircleCheck,
  AlertCircle,
  AlertTriangle,
} from '@/lib/icons';

// Category is now flexible - AI can generate any category name
export type QuizCategory = string;

// These are SUGGESTED/COMMON categories for UI filtering
// AI không bị giới hạn - có thể tạo category mới bất kỳ
export type CommonCategory =
  | 'education'
  | 'research'
  | 'science'
  | 'entertainment'
  | 'trivia'
  | 'language'
  | 'math'
  | 'history'
  | 'geography'
  | 'literature'
  | 'technology'
  | 'business'
  | 'health'
  | 'sports'
  | 'arts'
  | 'music'
  | 'general';

export type QuizDifficulty = 'easy' | 'medium' | 'hard';

export interface CategoryInfo {
  value: CommonCategory;
  label: string;
  icon: LucideIcon;
  color: string;
  description: string;
}

export interface DifficultyInfo {
  value: QuizDifficulty;
  label: string;
  icon: LucideIcon;
  color: string;
}

// Single Color for All Categories
// Differentiate by icons and labels only
export const CATEGORY_COLOR = '#3B82F6'; // Single blue color for all categories

// SUGGESTED/COMMON CATEGORIES - AI có thể tạo category mới ngoài danh sách này
// These are used for UI filtering and display suggestions
export const QUIZ_CATEGORIES: CategoryInfo[] = [
  {
    value: 'general',
    label: 'Tổng hợp',
    icon: BookOpen,
    color: CATEGORY_COLOR,
    description: 'Câu hỏi tổng hợp nhiều chủ đề',
  },
  {
    value: 'education',
    label: 'Học tập',
    icon: GraduationCap,
    color: CATEGORY_COLOR,
    description: 'Tài liệu học tập và ôn thi',
  },
  {
    value: 'research',
    label: 'Nghiên cứu',
    icon: Microscope,
    color: CATEGORY_COLOR,
    description: 'Nghiên cứu khoa học và học thuật',
  },
  {
    value: 'science',
    label: 'Khoa học',
    icon: FlaskConical,
    color: CATEGORY_COLOR,
    description: 'Vật lý, Hóa học, Sinh học',
  },
  {
    value: 'entertainment',
    label: 'Giải trí',
    icon: Film,
    color: CATEGORY_COLOR,
    description: 'Phim ảnh, âm nhạc, giải trí',
  },
  {
    value: 'trivia',
    label: 'Đố vui',
    icon: Target,
    color: CATEGORY_COLOR,
    description: 'Câu đố vui, kiến thức tổng hợp',
  },
  {
    value: 'language',
    label: 'Ngôn ngữ',
    icon: Globe,
    color: CATEGORY_COLOR,
    description: 'Tiếng Anh, tiếng Việt, ngoại ngữ',
  },
  {
    value: 'math',
    label: 'Toán học',
    icon: Calculator,
    color: CATEGORY_COLOR,
    description: 'Toán học, đại số, hình học',
  },
  {
    value: 'history',
    label: 'Lịch sử',
    icon: Scroll,
    color: CATEGORY_COLOR,
    description: 'Lịch sử Việt Nam và thế giới',
  },
  {
    value: 'geography',
    label: 'Địa lý',
    icon: MapPin,
    color: CATEGORY_COLOR,
    description: 'Địa lý tự nhiên và kinh tế',
  },
  {
    value: 'literature',
    label: 'Văn học',
    icon: Book,
    color: CATEGORY_COLOR,
    description: 'Văn học Việt Nam và thế giới',
  },
  {
    value: 'technology',
    label: 'Công nghệ',
    icon: Laptop,
    color: CATEGORY_COLOR,
    description: 'CNTT, lập trình, công nghệ số',
  },
  {
    value: 'business',
    label: 'Kinh doanh',
    icon: Briefcase,
    color: CATEGORY_COLOR,
    description: 'Kinh tế, quản trị, marketing',
  },
  {
    value: 'health',
    label: 'Sức khỏe',
    icon: Heart,
    color: CATEGORY_COLOR,
    description: 'Y học, sức khỏe, dinh dưỡng',
  },
  {
    value: 'sports',
    label: 'Thể thao',
    icon: Trophy,
    color: CATEGORY_COLOR,
    description: 'Thể dục thể thao, Olympic',
  },
  {
    value: 'arts',
    label: 'Nghệ thuật',
    icon: Palette,
    color: CATEGORY_COLOR,
    description: 'Hội họa, điêu khắc, kiến trúc',
  },
  {
    value: 'music',
    label: 'Âm nhạc',
    icon: Music,
    color: CATEGORY_COLOR,
    description: 'Âm nhạc, nhạc cụ, ca sĩ',
  },
];

export const DIFFICULTY_LEVELS: DifficultyInfo[] = [
  { value: 'easy', label: 'Dễ', icon: CircleCheck, color: '#22C55E' },
  { value: 'medium', label: 'Trung bình', icon: AlertCircle, color: '#F59E0B' },
  { value: 'hard', label: 'Khó', icon: AlertTriangle, color: '#EF4444' },
];

// Helper functions
export const getCategoryInfo = (category: QuizCategory): CategoryInfo | undefined => {
  return QUIZ_CATEGORIES.find((cat) => cat.value === category);
};

export const getCategoryLabel = (category: QuizCategory): string => {
  const info = getCategoryInfo(category);
  if (info) return info.label;
  // For unknown categories, capitalize first letter
  if (!category) return 'Tổng hợp'; // Default for undefined/null
  return category.charAt(0).toUpperCase() + category.slice(1);
};

export const getCategoryIcon = (category: QuizCategory): LucideIcon => {
  return getCategoryInfo(category)?.icon || Tag; // Tag icon for unknown categories
};

export const getCategoryColor = (category: QuizCategory): string => {
  return getCategoryInfo(category)?.color || CATEGORY_COLOR; // Same color for unknown
};

export const getDifficultyInfo = (difficulty: QuizDifficulty) => {
  return DIFFICULTY_LEVELS.find((d) => d.value === difficulty);
};

export const getDifficultyLabel = (difficulty: QuizDifficulty): string => {
  return getDifficultyInfo(difficulty)?.label || difficulty;
};
