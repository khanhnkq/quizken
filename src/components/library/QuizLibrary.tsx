import * as React from "react";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
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
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
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
import type { Question } from "@/types/quiz";
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
import ScrollSmoother from "gsap/ScrollSmoother";
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
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [quizzes, setQuizzes] = useState<PublicQuiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedQuiz, setSelectedQuiz] = useState<PublicQuiz | null>(null);
  const [sortBy, setSortBy] = useState<"usage" | "downloads" | "date">("usage");
  const [searchIn, setSearchIn] = useState<"all" | "title" | "content">("all");
  const [selectedCategory, setSelectedCategory] = useState<QuizCategory | "all">("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<QuizDifficulty | "all">("all");

  // Pagination State
  const PAGE_SIZE = 9;
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const bodyOverflowRef = React.useRef<{
    body: string;
    html: string;
    touch: string;
  }>({
    body: "",
    html: "",
    touch: "",
  });

  const [showAuthModal, setShowAuthModal] = useState(false);
  const navigate = useNavigate();
  const { play } = useAudio();
  const isMobile = useIsMobile();

  // Lock body scroll when modal is open
  useEffect(() => {
    if (selectedQuiz) {
      if (
        !bodyOverflowRef.current.body &&
        !bodyOverflowRef.current.html &&
        !bodyOverflowRef.current.touch
      ) {
        bodyOverflowRef.current = {
          body: document.body.style.overflow,
          html: document.documentElement.style.overflow,
          touch: document.body.style.touchAction,
        };
      }
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
      document.body.style.touchAction = "none";
    } else {
      document.body.style.overflow = bodyOverflowRef.current.body || "";
      document.documentElement.style.overflow = bodyOverflowRef.current.html || "";
      document.body.style.touchAction = bodyOverflowRef.current.touch || "";
      bodyOverflowRef.current = { body: "", html: "", touch: "" };
    }

    return () => {
      document.body.style.overflow = bodyOverflowRef.current.body || "";
      document.documentElement.style.overflow = bodyOverflowRef.current.html || "";
      document.body.style.touchAction = bodyOverflowRef.current.touch || "";
    };
  }, [selectedQuiz]);

  // GSAP ScrollSmoother handling
  useEffect(() => {
    type ScrollSmootherInterface = {
      get?: () => {
        paused?: (v?: boolean) => void;
        pause?: () => void;
        resume?: () => void;
      };
    };
    const smoother = (
      ScrollSmoother as unknown as ScrollSmootherInterface
    ).get?.();
    if (!smoother) return;
    try {
      if (selectedQuiz) {
        if (typeof smoother.paused === "function") smoother.paused(true);
        else if (typeof smoother.pause === "function") smoother.pause();
      } else {
        if (typeof smoother.paused === "function") smoother.paused(false);
        else if (typeof smoother.resume === "function") smoother.resume();
      }
    } catch {
      // no-op
    }
  }, [selectedQuiz]);

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

  // Available categories for filter
  const availableCategories = React.useMemo(() => QUIZ_CATEGORIES.map(c => c.value), []);

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
        title: t('library.toasts.loginRequired'),
        description: t('library.toasts.loginDesc'),
        variant: "warning",
      });
      setShowAuthModal(true);
      return;
    }

    // Increment usage count
    try {
      await supabase.rpc("increment_quiz_usage", { quiz_id: quiz.id });
    } catch (error) {
      console.error("Failed to increment usage count:", error);
    }

    // Navigate to home and open the quiz generator with selected quiz data
    // Add scrollToQuiz flag to trigger auto-scroll
    // Dùng query param để tránh hành vi auto-scroll mặc định của hash gây giật
    navigate("/?scrollTo=quiz", { state: { quiz, scrollToQuiz: true } });

    // Provide quick confirmation
    toast({
      title: t('library.toasts.openingQuiz'),
      description: t('library.toasts.openingDesc', { title: quiz.title }),
      variant: "success",
    });
  };

  return (
    <>
      <SeoMeta
        title="Thư viện các bài tập trắc nghiệm miễn phí"
        description="Khám phá hàng trăm quiz trắc nghiệm được tạo bằng AI trên QuizKen, lọc theo chủ đề và độ khó để luyện tập hiệu quả."
        canonical="/library"
        keywords={["thư viện quiz", "quiz ai", "quiz miễn phí", "trắc nghiệm"]}
      />
      <Navbar />

      <div className="min-h-screen" id="smooth-wrapper">
        <div id="smooth-content">
          {/* Hero Section */}
          <section className="relative overflow-hidden bg-gradient-to-b from-secondary/30 via-background to-background min-h-[60vh] flex flex-col justify-center py-20 px-4">
            {/* Background Decorations */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-20 left-10 w-24 h-24 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
              <div className="absolute top-40 right-10 w-32 h-32 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
              <div className="absolute -bottom-8 left-20 w-32 h-32 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
            </div>
            {!isMobile && (
              <div className="absolute inset-0 -z-10 opacity-5 hidden md:block">
                <ScrollVelocityContainer className="text-6xl md:text-8xl font-bold">
                  <ScrollVelocityRow
                    baseVelocity={75}
                    rowIndex={0}
                    paused={!!selectedQuiz}>
                    AI Education Smart Learning Intelligent Teaching Digital
                    Classroom
                  </ScrollVelocityRow>
                  <ScrollVelocityRow
                    baseVelocity={75}
                    rowIndex={1}
                    paused={!!selectedQuiz}>
                    Adaptive Assessment Personalized Learning Virtual Teacher
                    Cognitive Training
                  </ScrollVelocityRow>
                  <ScrollVelocityRow
                    baseVelocity={75}
                    rowIndex={2}
                    paused={!!selectedQuiz}>
                    Educational Analytics Student Engagement Knowledge Discovery
                    Learning Analytics
                  </ScrollVelocityRow>
                  <ScrollVelocityRow
                    baseVelocity={75}
                    rowIndex={3}
                    paused={!!selectedQuiz}>
                    Artificial Intelligence Machine Learning Neural Networks
                    Cognitive Computing
                  </ScrollVelocityRow>
                  <ScrollVelocityRow
                    baseVelocity={75}
                    rowIndex={4}
                    paused={!!selectedQuiz}>
                    Interactive Assessment Educational Technology Intelligent
                    Tutoring Automated Grading
                  </ScrollVelocityRow>
                  <ScrollVelocityRow
                    baseVelocity={75}
                    rowIndex={5}
                    paused={!!selectedQuiz}>
                    AI Education Smart Learning Intelligent Teaching Digital
                    Classroom
                  </ScrollVelocityRow>
                  <ScrollVelocityRow
                    baseVelocity={75}
                    rowIndex={6}
                    paused={!!selectedQuiz}>
                    Adaptive Assessment Personalized Learning Virtual Teacher
                    Cognitive Training
                  </ScrollVelocityRow>
                  <ScrollVelocityRow
                    baseVelocity={75}
                    rowIndex={7}
                    paused={!!selectedQuiz}>
                    Educational Analytics Student Engagement Knowledge Discovery
                    Learning Analytics
                  </ScrollVelocityRow>
                  <ScrollVelocityRow
                    baseVelocity={75}
                    rowIndex={8}
                    paused={!!selectedQuiz}>
                    Artificial Intelligence Machine Learning Neural Networks
                    Cognitive Computing
                  </ScrollVelocityRow>
                  <ScrollVelocityRow
                    baseVelocity={75}
                    rowIndex={9}
                    paused={!!selectedQuiz}>
                    Interactive Assessment Educational Technology Intelligent
                    Tutoring Automated Grading
                  </ScrollVelocityRow>
                </ScrollVelocityContainer>
              </div>
            )}
            {/* Peeking Mascots - Just like Footer */}
            <div className="absolute top-24 left-[8%] opacity-30 hidden md:block animate-bounce-slow" style={{ animationDelay: '0s' }}>
              <Star className="w-20 h-20 text-primary rotate-[-12deg]" />
            </div>
            <div className="absolute top-32 right-[12%] opacity-30 hidden md:block animate-bounce-slow" style={{ animationDelay: '1s' }}>
              <Sparkles className="w-16 h-16 text-[#B5CC89] rotate-[12deg]" />
            </div>
            <div className="absolute bottom-48 left-[15%] opacity-20 hidden lg:block animate-bounce-slow" style={{ animationDelay: '0.5s' }}>
              <TrendingUp className="w-14 h-14 text-primary rotate-[6deg]" />
            </div>
            <div className="absolute bottom-56 right-[18%] opacity-20 hidden lg:block animate-bounce-slow" style={{ animationDelay: '1.5s' }}>
              <BookOpen className="w-18 h-18 text-[#B5CC89] rotate-[-8deg]" />
            </div>

            <div className="container mx-auto max-w-4xl text-center relative z-10">
              {/* Bouncy Icon Badge - Like Footer */}
              <div className="inline-flex justify-center p-5 bg-white/60 backdrop-blur-sm rounded-full shadow-xl mb-6 animate-bounce-slow border-4 border-white/50">
                <BookOpen className="w-14 h-14 text-[#B5CC89]" />
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold font-heading bg-gradient-to-br from-primary to-primary/60 bg-clip-text text-transparent mb-4">
                {t('library.hero.title')}
              </h1>
              <p className="text-xl text-muted-foreground font-medium max-w-2xl mx-auto mb-8">
                {t('library.hero.description')}
              </p>
            </div>

            <div className="container mx-auto max-w-6xl">
              {/* Stats - Playful Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
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
              <div className="max-w-4xl mx-auto mb-12 space-y-4">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-8 w-8 text-primary/40" />
                  <Input
                    ref={searchInputRef}
                    placeholder={t('library.search.placeholder')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-16 pr-16 text-xl py-8 h-20 rounded-full border-4 border-primary/20 focus:border-primary shadow-xl hover:shadow-2xl transition-all placeholder:text-muted-foreground/50 font-medium"
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
                      className="bg-[#B5CC89]/20 text-[#B5CC89] px-4 py-2">
                      {totalItems} kết quả
                    </Badge>
                  )}
                </div>
              </div>

              {/* Quiz List */}
              {loading ? (
                <div
                  data-lib-list
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
                  {[...Array(6)].map((_, i) => (
                    <QuizCardSkeleton key={i} />
                  ))}
                </div>
              ) : (
                <div
                  data-lib-list
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500 items-start">
                  {quizzes.map((quiz, index) => (
                    <div
                      key={quiz.id}
                      className="animate-in fade-in zoom-in-50 duration-500 fill-mode-backwards"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <QuizCard
                        quiz={quiz}
                        onPreview={() => setSelectedQuiz(quiz)}
                        onUse={() => handleUseQuiz(quiz)}
                        onDownload={async () => {
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
                            });

                            toast({
                              title: "Đã tải xuống PDF",
                              description: `Quiz được lưu thành ${filename}`,
                              variant: "success",
                            });
                          } catch (e) {
                            console.error("Download error:", e);
                            toast({
                              title: "Lỗi tải xuống",
                              description: "Không thể tạo file PDF. Vui lòng thử lại.",
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
                      {searchQuery ? "Không tìm thấy kết quả" : "Không có quiz"}
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {searchQuery
                        ? `Không tìm thấy quiz nào cho "${searchQuery}"`
                        : "Hãy tạo một quiz và chia sẻ!"}
                    </p>
                    {searchQuery && (
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Gợi ý:</p>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>• Thử từ khóa khác hoặc ngắn gọn hơn</li>
                          <li>• Kiểm tra chính tả</li>
                          <li>• Thử thay đổi phạm vi tìm kiếm</li>
                          <li>• Thử sắp xếp theo tiêu chí khác</li>
                        </ul>
                        <Button
                          variant="outline"
                          onClick={() => setSearchQuery("")}
                          className="mt-4">
                          Xóa bộ lọc
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </section >

          {/* Selected Quiz Preview Modal */}
          <Dialog
            open={!!selectedQuiz}
            onOpenChange={(open) => {
              if (!open) setSelectedQuiz(null);
            }}>
            <DialogContent className="p-0 w-full max-w-4xl rounded-3xl border-4 border-primary/20 overflow-hidden shadow-2xl bg-card sm:max-h-[90vh] max-h-[95vh] flex flex-col">
              <DialogTitle className="sr-only">
                {selectedQuiz
                  ? `Xem trước quiz: ${selectedQuiz.title}`
                  : "Xem trước quiz"}
              </DialogTitle>

              {/* Header - Game Cartridge Style */}
              <div className="relative overflow-hidden bg-gradient-to-br from-secondary/50 to-secondary/20 p-6 sm:p-8 border-b-2 border-border/30 flex-shrink-0">
                {/* Decorative Pattern */}
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_1px_1px,hsl(var(--primary))_1px,transparent_0)] bg-[length:16px_16px]" />

                {/* Floating Icon */}
                <div className="absolute -right-6 -bottom-6 text-primary/10 transform rotate-12">
                  <BookOpen className="w-32 h-32" />
                </div>

                {/* Close Button */}
                <div className="absolute top-4 right-4 z-20">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedQuiz(null);
                    }}
                    className="h-12 w-12 rounded-full border-4 border-border bg-white text-muted-foreground hover:border-destructive/50 hover:bg-destructive/10 hover:text-destructive active:scale-95 transition-all duration-200 shadow-lg"
                    aria-label="Đóng">
                    <X className="w-6 h-6" />
                  </Button>
                </div>

                <div className="pr-16 relative z-10">
                  {/* Badges */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {selectedQuiz && (
                      <Badge variant="secondary" className="rounded-xl border-2 border-white/50 shadow-sm bg-white/80 backdrop-blur-sm text-primary hover:bg-white">
                        {getCategoryLabel(selectedQuiz.category)}
                      </Badge>
                    )}
                    {selectedQuiz && selectedQuiz.difficulty && (
                      <Badge className={cn(
                        "rounded-full border-2 px-3 py-1 font-heading uppercase text-[10px] tracking-wider shadow-sm",
                        selectedQuiz.difficulty === "easy" && "bg-green-100 text-green-700 border-green-200",
                        selectedQuiz.difficulty === "medium" && "bg-yellow-100 text-yellow-700 border-yellow-200",
                        selectedQuiz.difficulty === "hard" && "bg-red-100 text-red-700 border-red-200"
                      )}>
                        {t(`difficulty.${selectedQuiz.difficulty}`)}
                      </Badge>
                    )}
                  </div>

                  {/* Title */}
                  <h2 className="text-2xl sm:text-3xl font-heading font-bold text-foreground mb-2 leading-tight">
                    {selectedQuiz?.title}
                  </h2>

                  {/* Description */}
                  {selectedQuiz?.description && (
                    <p className="text-muted-foreground font-medium text-base">
                      {selectedQuiz.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 bg-card">
                {selectedQuiz && (
                  <>
                    {/* Stats Bubbles */}
                    <div className="flex flex-wrap gap-3">
                      <div className="flex items-center gap-1.5 bg-secondary/40 rounded-full px-4 py-2 text-sm font-medium text-muted-foreground">
                        <BookOpen className="w-4 h-4" />
                        <span>{Array.isArray(selectedQuiz.questions) ? selectedQuiz.questions.length : 0} câu hỏi</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-green-50 text-green-600 rounded-full px-4 py-2 text-sm font-medium">
                        <TrendingUp className="w-4 h-4" />
                        <span>{selectedQuiz.usage_count || 0} lượt chơi</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-blue-50 text-blue-600 rounded-full px-4 py-2 text-sm font-medium">
                        <Clock className="w-4 h-4" />
                        <span>{formatDate(selectedQuiz.created_at)}</span>
                      </div>
                    </div>

                    {/* Tags */}
                    {selectedQuiz.tags && selectedQuiz.tags.length > 0 && (
                      <div>
                        <QuizTags tags={selectedQuiz.tags} maxTags={5} />
                      </div>
                    )}

                    {/* Questions List */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="h-0.5 flex-1 bg-border rounded-full"></div>
                        <span className="text-xs font-heading uppercase tracking-widest text-muted-foreground">Xem trước câu hỏi</span>
                        <div className="h-0.5 flex-1 bg-border rounded-full"></div>
                      </div>

                      {Array.isArray(selectedQuiz.questions) && selectedQuiz.questions.length > 0 ? (
                        (selectedQuiz.questions as QuizQuestion[]).map((q, idx) => (
                          <div
                            key={idx}
                            className="group bg-white border-2 border-border/50 rounded-2xl p-5 hover:border-primary/40 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                          >
                            <div className="flex gap-4">
                              <div className="flex-shrink-0 w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center font-heading font-bold text-lg group-hover:scale-110 transition-transform">
                                {idx + 1}
                              </div>
                              <div className="flex-1 space-y-3">
                                <h4 className="font-heading font-semibold text-base text-foreground leading-snug">
                                  {q.question || "Không có nội dung câu hỏi"}
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  {Array.isArray(q.options) && q.options.map((opt, optIdx) => (
                                    <div key={optIdx} className="flex items-start gap-2 text-sm font-medium text-muted-foreground bg-secondary/30 p-2 rounded-lg">
                                      <span className="w-5 h-5 bg-white border-2 border-border rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                                        {String.fromCharCode(65 + optIdx)}
                                      </span>
                                      <span>{opt}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-12 text-muted-foreground italic bg-secondary/20 rounded-2xl border-2 border-dashed border-border">
                          Chưa có câu hỏi nào được thêm vào quiz này.
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Action Footer */}
              <div className="p-5 border-t-2 border-border/30 bg-secondary/10 flex flex-col sm:flex-row gap-3 items-center justify-between flex-shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={async () => {
                    if (!selectedQuiz) return;
                    try {
                      await supabase.rpc("increment_quiz_pdf_download", { quiz_id: selectedQuiz.id });
                      // @ts-ignore
                      const questionsArray: Question[] = selectedQuiz.questions || [];
                      const title = selectedQuiz.title || "quiz";
                      const filename = `${title.replace(/\s+/g, "-").toLowerCase() || "quiz"}.pdf`;
                      await warmupPdfWorker().catch(() => { });
                      await generateAndDownloadPdf({
                        filename,
                        title,
                        description: selectedQuiz.description || "",
                        questions: questionsArray,
                        showResults: false,
                        userAnswers: [],
                      });
                      toast({ title: "Đã tải xuống PDF", description: `Đã lưu ${filename}`, variant: "default" });
                    } catch (e) {
                      console.error("Download quiz PDF error:", e);
                      toast({ title: "Lỗi", description: "Không thể tạo/tải PDF.", variant: "destructive" });
                    }
                  }}
                  className="h-12 w-12 rounded-3xl border-4 border-border bg-white text-muted-foreground hover:border-blue-400 hover:bg-blue-50 hover:text-blue-500 active:scale-95 transition-all duration-200"
                  title="Tải PDF"
                >
                  <Download className="w-5 h-5" />
                </Button>

                <div className="flex gap-3 w-full sm:w-auto">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      if (selectedQuiz) {
                        play("click");
                        navigate(`/flashcard/${selectedQuiz.id}`);
                      }
                    }}
                    className="flex-1 sm:flex-none h-12 px-6 rounded-3xl border-4 border-border bg-white text-muted-foreground hover:border-primary/50 hover:bg-primary/10 hover:text-primary active:scale-95 transition-all duration-200 font-heading"
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    Flashcard
                  </Button>

                  <Button
                    variant="hero"
                    onClick={() => {
                      if (selectedQuiz) {
                        play("success");
                        navigate(`/quiz/${selectedQuiz.id}`);
                      }
                    }}
                    className="flex-1 sm:flex-none rounded-3xl font-heading shadow-xl border-4 border-primary hover:border-primary-foreground/50 active:scale-95 transition-all duration-200 text-sm bg-primary text-white"
                    size="lg"
                  >
                    <Sparkles className="w-4 h-4 mr-1.5" />
                    Làm bài ngay
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} />
        </div >
      </div >
    </>
  );
};

export default QuizLibrary;
