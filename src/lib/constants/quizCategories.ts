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
export const CATEGORY_COLOR = '#22c55e'; // Single green color for all categories to match theme

// SUGGESTED/COMMON CATEGORIES - AI có thể tạo category mới ngoài danh sách này
// These are used for UI filtering and display suggestions
export const QUIZ_CATEGORIES: CategoryInfo[] = [
  {
    value: 'general',
    label: 'categories.general',
    icon: BookOpen,
    color: CATEGORY_COLOR,
    description: 'categories.generalDesc',
  },
  {
    value: 'education',
    label: 'categories.education',
    icon: GraduationCap,
    color: CATEGORY_COLOR,
    description: 'categories.educationDesc',
  },
  {
    value: 'research',
    label: 'categories.research',
    icon: Microscope,
    color: CATEGORY_COLOR,
    description: 'categories.researchDesc',
  },
  {
    value: 'science',
    label: 'categories.science',
    icon: FlaskConical,
    color: CATEGORY_COLOR,
    description: 'categories.scienceDesc',
  },
  {
    value: 'entertainment',
    label: 'categories.entertainment',
    icon: Film,
    color: CATEGORY_COLOR,
    description: 'categories.entertainmentDesc',
  },
  {
    value: 'trivia',
    label: 'categories.trivia',
    icon: Target,
    color: CATEGORY_COLOR,
    description: 'categories.triviaDesc',
  },
  {
    value: 'language',
    label: 'categories.language',
    icon: Globe,
    color: CATEGORY_COLOR,
    description: 'categories.languageDesc',
  },
  {
    value: 'math',
    label: 'categories.math',
    icon: Calculator,
    color: CATEGORY_COLOR,
    description: 'categories.mathDesc',
  },
  {
    value: 'history',
    label: 'categories.history',
    icon: Scroll,
    color: CATEGORY_COLOR,
    description: 'categories.historyDesc',
  },
  {
    value: 'geography',
    label: 'categories.geography',
    icon: MapPin,
    color: CATEGORY_COLOR,
    description: 'categories.geographyDesc',
  },
  {
    value: 'literature',
    label: 'categories.literature',
    icon: Book,
    color: CATEGORY_COLOR,
    description: 'categories.literatureDesc',
  },
  {
    value: 'technology',
    label: 'categories.technology',
    icon: Laptop,
    color: CATEGORY_COLOR,
    description: 'categories.technologyDesc',
  },
  {
    value: 'business',
    label: 'categories.business',
    icon: Briefcase,
    color: CATEGORY_COLOR,
    description: 'categories.businessDesc',
  },
  {
    value: 'health',
    label: 'categories.health',
    icon: Heart,
    color: CATEGORY_COLOR,
    description: 'categories.healthDesc',
  },
  {
    value: 'sports',
    label: 'categories.sports',
    icon: Trophy,
    color: CATEGORY_COLOR,
    description: 'categories.sportsDesc',
  },
  {
    value: 'arts',
    label: 'categories.arts',
    icon: Palette,
    color: CATEGORY_COLOR,
    description: 'categories.artsDesc',
  },
  {
    value: 'music',
    label: 'categories.music',
    icon: Music,
    color: CATEGORY_COLOR,
    description: 'categories.musicDesc',
  },
];

export const DIFFICULTY_LEVELS: DifficultyInfo[] = [
  { value: 'easy', label: 'difficulty.easy', icon: CircleCheck, color: '#22C55E' },
  { value: 'medium', label: 'difficulty.medium', icon: AlertCircle, color: '#F59E0B' },
  { value: 'hard', label: 'difficulty.hard', icon: AlertTriangle, color: '#EF4444' },
];

// Helper functions
export const getCategoryInfo = (category: QuizCategory): CategoryInfo | undefined => {
  return QUIZ_CATEGORIES.find((cat) => cat.value === category);
};

export const getCategoryLabel = (category: QuizCategory): string => {
  const info = getCategoryInfo(category);
  if (info) return info.label;
  // For unknown categories, capitalize first letter
  if (!category) return 'categories.general'; // Default for undefined/null
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
