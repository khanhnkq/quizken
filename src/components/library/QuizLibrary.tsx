import * as React from "react";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { BackgroundDecorations } from "@/components/ui/BackgroundDecorations";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useCountUp } from "@/hooks/useCountUp";
import {
  BookOpen,
  Search,
  Clock,
  Star,
  Download,
  Sparkles,
  TrendingUp,
  FileDown,
  X,
  Filter,
  ArrowUpDown,
  ArrowDown,
} from "@/lib/icons";
import { warmupPdfWorker, generateAndDownloadPdf } from "@/lib/pdfWorkerClient";
import type { Question, Quiz } from "@/types/quiz";
import {
  ScrollVelocityContainer,
  ScrollVelocityRow,
} from "@/components/ScrollVelocity";
import AuthModal from "@/components/AuthModal";
import Navbar from "@/components/layout/Navbar";
import {
  QUIZ_CATEGORIES,
  getCategoryIcon,
  getCategoryLabel,
  getCategoryColor,
  getDifficultyLabel,
  type QuizCategory,
  type QuizDifficulty,
} from "@/lib/constants/quizCategories";
import { CategoryFilters } from "@/components/library/CategoryFilters";
import {
  QuizCategoryBadge,
  QuizTags,
} from "@/components/library/QuizCategoryBadge";
import { QuizCard } from "@/components/library/QuizCard";
import { QuizCardSkeleton } from "@/components/library/QuizCardSkeleton";
import { useAudio } from "@/contexts/SoundContext";

import { Eye } from "lucide-react";
import SeoMeta from "@/components/SeoMeta";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTranslation } from "react-i18next";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { PreviewModal } from "@/components/quiz/PreviewModal";

interface PublicQuiz {
  id: string;
  title: string;
  description: string | null;
  prompt: string;
  questions: unknown;
  prompt_tokens: number;
  candidates_tokens: number;
  total_tokens: number;
  created_at: string;
  user_id: string;
  is_public: boolean;
  usage_count: number;
  pdf_download_count: number;
  category: QuizCategory;
  tags: string[];
  difficulty: QuizDifficulty;
}

interface QuizQuestion {
  question?: string;
  options?: string[];
  correctAnswer?: number;
  explanation?: string;
}

const QuizLibrary: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [quizzes, setQuizzes] = useState<PublicQuiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewQuiz, setPreviewQuiz] = useState<Quiz | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [sortBy, setSortBy] = useState<"usage" | "downloads" | "date">("usage");
  const [searchIn, setSearchIn] = useState<"all" | "title" | "content">("all");
  const [selectedCategory, setSelectedCategory] = useState<QuizCategory | "all">("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<QuizDifficulty | "all">("all");

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  // All available categories from database (fetched once, not affected by filters)
  // Only show categories with at least 2 quizzes, limit dynamic cats to top 10
  const [allCategories, setAllCategories] = useState<string[]>([]);
  useEffect(() => {
    const fetchAllCategories = async () => {
      const { data, error } = await supabase
        .from("quizzes")
        .select("category")
        .eq("is_public", true);
      if (!error && data) {
        // Count occurrences of each category
        const catCount: Record<string, number> = {};
        data.forEach(q => {
          if (q.category) {
            catCount[q.category] = (catCount[q.category] || 0) + 1;
          }
        });
        // Filter: only categories with 2+ quizzes, sort by count, limit to 15
        const filtered = Object.entries(catCount)
          .filter(([_, count]) => count >= 2)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 15)
          .map(([cat]) => cat);
        setAllCategories(filtered);
      }
    };
    fetchAllCategories();
  }, []);

  // Pagination State
  const PAGE_SIZE = 9;
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const searchInputRef = React.useRef<HTMLInputElement>(null);
  /* Removed bodyOverflowRef */

  const [showAuthModal, setShowAuthModal] = useState(false);
  const navigate = useNavigate();
  const { play } = useAudio();
  const isMobile = useIsMobile();

  // Lock body scroll when modal is open


  // GSAP ScrollSmoother handling


  // Total stats from database
  const [totalStats, setTotalStats] = useState({
    totalQuizzes: 0,
    totalCategories: 0,
    totalCreators: 0,
  });

  // GSAP count up animation refs
  const totalQuizzesRef = useCountUp(totalStats.totalQuizzes, {
    duration: 1.5,
    delay: 0.1,
  });
  const totalCategoriesRef = useCountUp(totalStats.totalCategories, {
    duration: 1.5,
    delay: 0.3,
  });
  const totalCreatorsRef = useCountUp(totalStats.totalCreators, {
    duration: 1.5,
    delay: 0.5,
  });

  // Use all categories from database (not affected by current filters)
  const availableCategories = allCategories;

  // Debounce search
  const [debouncedQuery, setDebouncedQuery] = useState("");
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setCurrentPage(1); // Reset to page 1 on new search
    }, 500);
    return () => clearTimeout(t);
  }, [searchQuery]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, selectedDifficulty, sortBy]);

  // Load total stats
  const loadTotalStats = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("quizzes")
        .select("category,user_id")
        .eq("is_public", true);

      if (error) throw error;

      if (data) {
        const uniqueCategories = new Set(
          data.map((q) => q.category).filter(Boolean)
        ).size;
        const uniqueCreators = new Set(data.map((q) => q.user_id)).size;

        setTotalStats({
          totalQuizzes: data.length,
          totalCategories: uniqueCategories,
          totalCreators: uniqueCreators,
        });
      }
    } catch (error) {
      console.error("Error loading total stats:", error);
    }
  }, []);

  // Fetch Quizzes with Server-Side Pagination & Filtering
  const fetchQuizzes = useCallback(async () => {
    try {
      setLoading(true);

      let query = supabase
        .from("quizzes")
        .select(
          "id,title,description,prompt,questions,prompt_tokens,candidates_tokens,total_tokens,created_at,user_id,is_public,usage_count,pdf_download_count,category,tags,difficulty",
          { count: "exact" }
        )
        .eq("is_public", true);

      // Apply Search
      if (debouncedQuery) {
        // Search in title or description - PostgREST uses * for wildcards in ilike
        query = query.or(`title.ilike.*${debouncedQuery}*,description.ilike.*${debouncedQuery}*`);
      }

      // Apply Filters
      if (selectedCategory !== "all") {
        query = query.eq("category", selectedCategory);
      }

      if (selectedDifficulty !== "all") {
        query = query.eq("difficulty", selectedDifficulty);
      }

      // Apply Sorting
      switch (sortBy) {
        case "usage":
          query = query.order("usage_count", { ascending: false });
          break;
        case "downloads":
          query = query.order("pdf_download_count", { ascending: false });
          break;
        case "date":
          query = query.order("created_at", { ascending: false });
          break;
      }

      // Apply Pagination
      const from = (currentPage - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) {
        throw error;
      }

      setQuizzes(data || []);
      setTotalItems(count || 0);
      setTotalPages(Math.ceil((count || 0) / PAGE_SIZE));

    } catch (error) {
      console.error("Error fetching quizzes:", error);
      toast({
        title: t('library.toasts.loadError'),
        description: t('library.toasts.loadDesc'),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedQuery, selectedCategory, selectedDifficulty, sortBy]);

  // Initial load and refetch on dependencies change
  useEffect(() => {
    loadTotalStats();
    fetchQuizzes();
  }, [fetchQuizzes, loadTotalStats]);

  // Keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatNumber = (n: number) => {
    try {
      return new Intl.NumberFormat("vi-VN").format(Number(n) || 0);
    } catch {
      return String(n ?? 0);
    }
  };

  // Warm up PDF worker và font để lần bấm đầu nhanh hơn
  useEffect(() => {
    warmupPdfWorker().catch(() => { });
  }, []);

  // Chuẩn hóa dữ liệu JSON từ DB thành Question[] chặt chẽ, không dùng any
  const normalizeToQuestions = (raw: unknown): Question[] => {
    const arr = Array.isArray(raw) ? raw : [];
    return arr.map((q) => {
      const obj: Record<string, unknown> =
        typeof q === "object" && q !== null
          ? (q as Record<string, unknown>)
          : {};
      const question =
        typeof obj.question === "string"
          ? obj.question
          : String(obj.question ?? "");
      const options = Array.isArray(obj.options)
        ? (obj.options as unknown[]).map((o) => String(o ?? ""))
        : [];
      const correctAnswer =
        typeof obj.correctAnswer === "number" ? obj.correctAnswer : 0;
      const explanation =
        typeof obj.explanation === "string" ? obj.explanation : undefined;
      return { question, options, correctAnswer, explanation };
    });
  };

  const handleUseQuiz = async (quiz: PublicQuiz) => {
    if (!user) {
      toast({
        title: t("library.toasts.loginRequired"),
        description: t("library.toasts.loginDesc"),
        variant: "warning",
      });
      setShowAuthModal(true);
      return;
    }

    // Navigate directly to play the quiz
    play("success");
    navigate(`/quiz/play/${quiz.id}`);
  };

  return (
    <>
      <SeoMeta
        title={t('library.meta.title')}
        description={t('library.meta.description')}
        canonical="/quiz/library"
        keywords={t('library.meta.keywords').split(',')}
      />
      <Navbar />

      <div className="min-h-screen pt-16 relative" id="smooth-wrapper">
        <div className="fixed inset-0 z-0 pointer-events-none">
          <BackgroundDecorations density="medium" />
        </div>
        <div id="smooth-content" className="relative z-10">
          {/* Hero Section */}
          <section className="relative overflow-hidden bg-gradient-to-b from-secondary/30 via-background to-background min-h-[60vh] flex flex-col justify-center py-12 px-2 md:py-20 md:px-4">
            {/* Enhanced Background Decorations */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {/* Animated Gradient Blobs - Matched with Main Hero */}
              <div className="absolute top-0 left-1/4 w-72 h-72 bg-primary/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
              <div className="absolute top-0 right-1/4 w-72 h-72 bg-purple-300/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
              <div className="absolute -bottom-8 left-1/3 w-72 h-72 bg-pink-300/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>

              {/* Floating Icons Style from Hero.tsx */}
              <div className="hidden lg:block absolute inset-0">
                <div className="absolute top-[10%] left-[15%] animate-float hover:scale-110 transition-transform duration-1000">
                  <div className="bg-white p-4 rounded-2xl shadow-lg border border-border/50 rotate-[-10deg]">
                    <div className="w-8 h-8 text-primary flex items-center justify-center text-3xl">🧠</div>
                  </div>
                </div>
                <div className="absolute top-[20%] right-[15%] animate-float animation-delay-2000 hover:scale-110 transition-transform duration-1000">
                  <div className="bg-white p-4 rounded-2xl shadow-lg border border-border/50 rotate-[10deg]">
                    <div className="w-8 h-8 text-yellow-400 flex items-center justify-center text-3xl">✨</div>
                  </div>
                </div>
                <div className="absolute bottom-[40%] left-[20%] animate-float animation-delay-4000 hover:scale-110 transition-transform duration-1000">
                  <div className="bg-white p-4 rounded-2xl shadow-lg border border-border/50 rotate-[5deg]">
                    <div className="w-8 h-8 text-blue-400 flex items-center justify-center text-3xl">🧩</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="container mx-auto max-w-4xl text-center relative z-10">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-medium text-sm animate-fade-in mx-auto mb-8">
                <span className="text-lg">✨</span>
                <span>{t('library.hero.badge')}</span>
              </div>

              <h1 className="font-heading text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.1] md:leading-tight text-foreground drop-shadow-sm mb-6">
                <span className="relative inline-block">
                  {t('library.hero.titlePart1')}
                  <svg className="absolute -bottom-2 left-0 w-full h-3 text-yellow-300 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                    <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
                  </svg>
                </span>{" "}
                <span className="text-primary relative inline-block">
                  {t('library.hero.titlePart2')}
                  <svg className="absolute -bottom-2 left-0 w-full h-3 text-pink-300 -z-10 opacity-70" viewBox="0 0 100 10" preserveAspectRatio="none">
                    <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
                  </svg>
                </span>
              </h1>

              <p className="text-lg md:text-2xl text-muted-foreground font-medium max-w-2xl mx-auto mb-10 leading-relaxed">
                {t('library.hero.description')}
              </p>
            </div>

            <div className="w-full md:container mx-auto max-w-6xl relative z-10">
              {/* Stats - Playful Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6 mb-16">
                {/* Quizzes Card */}
                <Card className="rounded-3xl border-4 border-primary/20 bg-gradient-to-br from-green-50 to-white backdrop-blur-md shadow-xl hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 group cursor-pointer overflow-hidden">
                  <CardContent className="p-6 text-center relative">
                    {/* Floating Icon */}
                    <div className="absolute -top-2 -right-2 p-3 bg-primary/10 rounded-full transform rotate-12 group-hover:rotate-0 group-hover:scale-110 transition-all duration-300">
                      <BookOpen className="w-8 h-8 text-primary" />
                    </div>
                    <div
                      ref={totalQuizzesRef}
                      className="text-5xl md:text-6xl font-bold font-heading text-primary mb-2">
                      0
                    </div>
                    <p className="text-base text-muted-foreground font-heading font-medium">
                      {t('library.stats.quizzes')}
                    </p>
                  </CardContent>
                </Card>

                {/* Topics Card */}
                <Card className="rounded-3xl border-4 border-purple-200 bg-gradient-to-br from-purple-50 to-white backdrop-blur-md shadow-xl hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 group cursor-pointer overflow-hidden">
                  <CardContent className="p-6 text-center relative">
                    {/* Floating Icon */}
                    <div className="absolute -top-2 -right-2 p-3 bg-purple-100 rounded-full transform rotate-12 group-hover:rotate-0 group-hover:scale-110 transition-all duration-300">
                      <Sparkles className="w-8 h-8 text-purple-500" />
                    </div>
                    <div
                      ref={totalCategoriesRef}
                      className="text-5xl md:text-6xl font-bold font-heading text-purple-600 mb-2">
                      0
                    </div>
                    <p className="text-base text-muted-foreground font-heading font-medium">
                      {t('library.stats.topics')}
                    </p>
                  </CardContent>
                </Card>

                {/* Creators Card */}
                <Card className="rounded-3xl border-4 border-orange-200 bg-gradient-to-br from-orange-50 to-white backdrop-blur-md shadow-xl hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 group cursor-pointer overflow-hidden">
                  <CardContent className="p-6 text-center relative">
                    {/* Floating Icon */}
                    <div className="absolute -top-2 -right-2 p-3 bg-orange-100 rounded-full transform rotate-12 group-hover:rotate-0 group-hover:scale-110 transition-all duration-300">
                      <Star className="w-8 h-8 text-orange-500" />
                    </div>
                    <div
                      ref={totalCreatorsRef}
                      className="text-5xl md:text-6xl font-bold font-heading text-orange-500 mb-2">
                      0
                    </div>
                    <p className="text-base text-muted-foreground font-heading font-medium">
                      {t('library.stats.creators')}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Search & Filters */}
              <div className="max-w-4xl mx-auto mb-12 space-y-4 relative z-10">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 h-5 w-5 md:h-8 md:w-8 text-primary/40" />
                  <Input
                    ref={searchInputRef}
                    placeholder={t('library.search.placeholder')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 pr-12 md:pl-16 md:pr-16 text-base md:text-xl py-4 md:py-8 h-14 md:h-20 rounded-full border-4 border-primary/20 focus:border-primary shadow-xl hover:shadow-2xl transition-all placeholder:text-muted-foreground/50 font-medium"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {searchQuery ? (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="p-2 hover:bg-red-100 text-red-400 hover:text-red-500 rounded-full transition-colors"
                        aria-label={t('library.search.clear')}>
                        <X className="h-6 w-6" />
                      </button>
                    ) : (
                      <div className="p-3 bg-primary/10 rounded-full text-primary">
                        <Search className="h-6 w-6" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Filters Row */}
                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                  <div className="flex flex-wrap gap-3 items-center">
                    {/* Sort By */}
                    <div className="flex items-center gap-2">
                      <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                      <Select
                        value={sortBy}
                        onValueChange={(v) => {
                          play("toggle");
                          setSortBy(v as typeof sortBy);
                        }}>
                        <SelectTrigger className="w-full sm:w-[180px] h-12 rounded-2xl border-4 border-border font-heading font-medium">
                          <SelectValue placeholder={t('library.search.sortBy')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="usage">
                            {t('library.search.sort.usage')}
                          </SelectItem>
                          <SelectItem value="downloads">
                            {t('library.search.sort.downloads')}
                          </SelectItem>
                          <SelectItem value="date">{t('library.search.sort.date')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Search In */}
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4 text-muted-foreground" />
                      <Select
                        value={searchIn}
                        onValueChange={(v) => {
                          play("toggle");
                          setSearchIn(v as typeof searchIn);
                        }}>
                        <SelectTrigger className="w-full sm:w-[160px] h-12 rounded-2xl border-4 border-border font-heading font-medium">
                          <SelectValue placeholder={t('library.search.searchIn')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">{t('library.search.scope.all')}</SelectItem>
                          <SelectItem value="title">{t('library.search.scope.title')}</SelectItem>
                          <SelectItem value="content">
                            {t('library.search.scope.content')}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Category & Difficulty Filters */}
                    <CategoryFilters
                      selectedCategory={selectedCategory}
                      selectedDifficulty={selectedDifficulty}
                      onCategoryChange={setSelectedCategory}
                      onDifficultyChange={setSelectedDifficulty}
                      availableCategories={availableCategories}
                    />
                  </div>

                  {/* Search Results Count */}
                  {debouncedQuery && (
                    <Badge
                      variant="secondary"
                      className="bg-primary/20 text-primary px-4 py-2">
                      {t('library.search.resultsCount', { count: totalItems })}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Quiz List */}
              {loading ? (
                <div
                  data-lib-list
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-6 animate-in fade-in duration-500 relative z-10">
                  {[...Array(6)].map((_, i) => (
                    <QuizCardSkeleton key={i} />
                  ))}
                </div>
              ) : (
                <div
                  data-lib-list
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-6 animate-in fade-in duration-500 relative z-10">
                  {quizzes.map((quiz, index) => (
                    <div
                      key={quiz.id}
                      className="animate-in fade-in zoom-in-50 duration-500 fill-mode-backwards h-full"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <QuizCard
                        quiz={quiz}
                        onPreview={() => {
                          const normalizedQuestions = normalizeToQuestions(
                            Array.isArray(quiz.questions)
                              ? quiz.questions
                              : JSON.parse(String(quiz.questions || "[]"))
                          );
                          setPreviewQuiz({
                            ...quiz,
                            questions: normalizedQuestions,
                          } as Quiz);
                        }}
                        onUse={() => handleUseQuiz(quiz)}
                        onDownload={async () => {
                          if (!user) {
                            toast({
                              title: t("library.toasts.loginRequired"),
                              description: t("library.toasts.loginDesc"),
                              variant: "warning",
                            });
                            setShowAuthModal(true);
                            return;
                          }
                          try {
                            // Increment PDF download count
                            await supabase.rpc("increment_quiz_pdf_download", {
                              quiz_id: quiz.id,
                            });

                            // Chuẩn hóa về Question[] chặt chẽ
                            const questionsArray: Question[] =
                              normalizeToQuestions(
                                Array.isArray(quiz.questions)
                                  ? quiz.questions
                                  : JSON.parse(String(quiz.questions || "[]"))
                              );

                            const title = quiz.title || "quiz";
                            const filename = `${title.replace(/\s+/g, "-").toLowerCase() || "quiz"
                              }.pdf`;

                            // Warm up worker (no-op if already warmed) then generate in background thread
                            await warmupPdfWorker().catch(() => { });
                            await generateAndDownloadPdf({
                              filename,
                              title,
                              description: quiz.description || "",
                              questions: questionsArray,
                              showResults: false,
                              userAnswers: [],
                              locale: i18n.language,
                            });

                            toast({
                              title: t('library.toasts.pdfDownloaded'),
                              description: t('library.toasts.pdfSaved', { filename }),
                              variant: "success",
                            });
                          } catch (e) {
                            console.error("Download error:", e);
                            toast({
                              title: t('library.toasts.pdfError'),
                              description: t('library.toasts.pdfErrorDesc'),
                              variant: "destructive",
                            });
                          }
                        }}
                        formatDate={formatDate}
                        formatNumber={formatNumber}
                      />
                    </div>
                  ))}
                </div>
              )}

              {!loading && quizzes.length > 0 && totalPages > 1 && (
                <div className="mt-12 mb-20 flex justify-center">
                  <div className="bg-white/90 backdrop-blur-xl rounded-full border-4 border-white shadow-2xl p-2 inline-block">
                    <Pagination>
                      <PaginationContent className="gap-2">
                        <PaginationItem>
                          <PaginationPrevious
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            className={cn(
                              "rounded-full px-4 h-10 font-heading font-bold transition-all duration-300",
                              currentPage === 1
                                ? "pointer-events-none opacity-50"
                                : "hover:bg-white hover:text-primary hover:shadow-md hover:-translate-x-1 cursor-pointer"
                            )}
                          />
                        </PaginationItem>

                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                          // Show first page, last page, current page, and pages around current
                          if (
                            page === 1 ||
                            page === totalPages ||
                            (page >= currentPage - 1 && page <= currentPage + 1)
                          ) {
                            return (
                              <PaginationItem key={page}>
                                <PaginationLink
                                  isActive={page === currentPage}
                                  onClick={() => setCurrentPage(page)}
                                  className={cn(
                                    "rounded-full w-10 h-10 font-heading font-bold transition-all duration-300 border-2",
                                    page === currentPage
                                      ? "bg-primary text-white border-white shadow-lg scale-110 rotate-[-6deg]"
                                      : "bg-transparent border-transparent hover:bg-white hover:text-primary hover:border-white/50 hover:shadow-md hover:scale-110 hover:rotate-12 cursor-pointer"
                                  )}
                                >
                                  {page}
                                </PaginationLink>
                              </PaginationItem>
                            );
                          }

                          // Show ellipsis
                          if (
                            page === currentPage - 2 ||
                            page === currentPage + 2
                          ) {
                            return (
                              <PaginationItem key={page}>
                                <PaginationEllipsis className="text-primary/50" />
                              </PaginationItem>
                            );
                          }

                          return null;
                        })}

                        <PaginationItem>
                          <PaginationNext
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            className={cn(
                              "rounded-full px-4 h-10 font-heading font-bold transition-all duration-300",
                              currentPage === totalPages
                                ? "pointer-events-none opacity-50"
                                : "hover:bg-white hover:text-primary hover:shadow-md hover:translate-x-1 cursor-pointer"
                            )}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                </div>
              )}

              {!loading && quizzes.length === 0 && (
                <div className="text-center py-16 px-4">
                  <div className="max-w-md mx-auto">
                    <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">
                      {searchQuery ? t('library.empty.noResults') : t('library.empty.noQuizzes')}
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {searchQuery
                        ? t('library.empty.noResultsFor', { query: searchQuery })
                        : t('library.empty.createAndShare')}
                    </p>
                    {searchQuery && (
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">{t('library.empty.suggestions')}</p>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>• {t('library.empty.suggestion1')}</li>
                          <li>• {t('library.empty.suggestion2')}</li>
                          <li>• {t('library.empty.suggestion3')}</li>
                          <li>• {t('library.empty.suggestion4')}</li>
                        </ul>
                        <Button
                          variant="outline"
                          onClick={() => setSearchQuery("")}
                          className="mt-4">
                          {t('library.empty.clearFilters')}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </section >


          <PreviewModal
            quiz={previewQuiz}
            open={!!previewQuiz}
            onOpenChange={(open) => !open && setPreviewQuiz(null)}
            onPlay={(quiz) => handleUseQuiz(quiz as unknown as PublicQuiz)}
          />

          <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} />
        </div>
      </div>
    </>
  );
};

export default QuizLibrary;
