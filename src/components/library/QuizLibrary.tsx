import * as React from "react";
import { useState, useEffect, useMemo, useCallback, useRef, useLayoutEffect } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
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
import { ShareDialog } from "@/components/common/ShareDialog";
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
import { CreateChallengeDialog } from "@/components/challenge/CreateChallengeDialog";
import { gsap } from "gsap";

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
  profiles?: {
    display_name: string | null;
    avatar_url: string | null;
    equipped_avatar_frame: string | null;
  };
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
  const containerRef = useRef<HTMLDivElement>(null);

  const [sortBy, setSortBy] = useState<"usage" | "downloads" | "date">("usage");
  const [searchIn, setSearchIn] = useState<"all" | "title" | "content">("all");
  const [selectedCategory, setSelectedCategory] = useState<QuizCategory | "all">("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<QuizDifficulty | "all">("all");
  const [viewMode, setViewMode] = useState<"public" | "mine">("public");

  const [shareQuiz, setShareQuiz] = useState<PublicQuiz | null>(null);
  
  // Challenge Mode
  const [searchParams] = useSearchParams();
  const isChallengeMode = searchParams.get('mode') === 'challenge';
  const [challengeQuiz, setChallengeQuiz] = useState<PublicQuiz | null>(null);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  // Entry Animations with GSAP
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Hero content
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.from(".hero-badge", {
        y: 20,
        opacity: 0,
        duration: 0.6,
        delay: 0.1,
      })
        .from(".hero-title", {
          y: 40,
          opacity: 0,
          duration: 0.8,
        }, "-=0.4")
        .from(".hero-desc", {
          y: 20,
          opacity: 0,
          duration: 0.8,
        }, "-=0.6");

      // Stats Cards Stagger
      gsap.fromTo(".stats-card",
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.15,
          ease: "back.out(1.2)",
          delay: 0.4,
          clearProps: "transform" // Optional: clear transform after animation to avoid conflicts with hover effects
        }
      );

      // Search & Filters Slide In
      gsap.from(".search-filter-section", {
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: "power2.out",
        delay: 0.6,
      });

    }, containerRef);

    return () => ctx.revert();
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
    delay: 0.8, // Increased delay to match entry animation
  });
  const totalCategoriesRef = useCountUp(totalStats.totalCategories, {
    duration: 1.5,
    delay: 1.0,
  });
  const totalCreatorsRef = useCountUp(totalStats.totalCreators, {
    duration: 1.5,
    delay: 1.2,
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
        .eq("is_public", true); // Stats currently only for public, maybe update later

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
          "id,title,description,prompt,questions,prompt_tokens,candidates_tokens,total_tokens,created_at,user_id,is_public,usage_count,pdf_download_count,category,tags,difficulty, profiles:user_id(display_name, avatar_url, equipped_avatar_frame)",
          { count: "exact" }
        )
        
      if (viewMode === 'mine') {
         if (!user) {
            setQuizzes([]);
            setLoading(false);
            return;
         }
         query = query.eq('user_id', user.id);
      } else {
         query = query.eq("is_public", true);
      }

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
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedQuery, selectedCategory, selectedDifficulty, sortBy, viewMode, user]);

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

  const handleShareQuiz = (quiz: PublicQuiz) => {
    setShareQuiz(quiz);
  };

  const handleCreateChallenge = async (betAmount: number) => {
    if (!challengeQuiz || !user) return;
    
    try {
      // 1. Create Room (call RPC or Insert directly)
      // Since we already have existing logic in ChallengeLobby, we can reuse or just replicate insert here.
      // Replicating insert is cleaner for this context.
      
      const { data, error } = await supabase
        .from('challenges')
        .insert({
           host_id: user.id,
           quiz_id: challengeQuiz.id,
           bet_amount: betAmount,
           status: 'waiting'
        })
        .select()
        .single();
        
      if (error) throw error;
      
      // 2. Redirect to Waiting Room
      navigate(`/challenge/${data.id}`);
      
    } catch (err) {
       console.error(err);
       toast({
         title: "Error creating challenge",
         variant: "destructive"
       });
    }
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

      <div className="min-h-screen pt-16 relative" id="smooth-wrapper" ref={containerRef}>
        <div className="fixed inset-0 z-0 pointer-events-none">
          <BackgroundDecorations density="medium" />
        </div>
        <div id="smooth-content" className="relative z-10">
          {/* Hero Section */}
          <section className="relative overflow-hidden bg-gradient-to-b from-secondary/30 via-background to-background min-h-[60vh] flex flex-col justify-center py-12 px-2 md:py-20 md:px-4">
            {/* Enhanced Background Decorations */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {/* Animated Gradient Blobs - Matched with Screenshot Request */}
              <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-emerald-500/20 dark:bg-emerald-500/10 rounded-full mix-blend-screen filter blur-[100px] opacity-70 animate-blob"></div>
              <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-500/20 dark:bg-purple-500/10 rounded-full mix-blend-screen filter blur-[100px] opacity-70 animate-blob animation-delay-2000"></div>

              {/* Floating Icons Style from Hero.tsx */}
              <div className="hidden lg:block absolute inset-0">
                <div className="absolute top-[10%] left-[15%] animate-float hover:scale-110 transition-transform duration-1000">
                  <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-lg border border-border/50 rotate-[-10deg]">
                    <div className="w-8 h-8 text-primary flex items-center justify-center text-3xl">🧠</div>
                  </div>
                </div>
                <div className="absolute top-[20%] right-[15%] animate-float animation-delay-2000 hover:scale-110 transition-transform duration-1000">
                  <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-lg border border-border/50 rotate-[10deg]">
                    <div className="w-8 h-8 text-yellow-400 flex items-center justify-center text-3xl">✨</div>
                  </div>
                </div>
                <div className="absolute bottom-[40%] left-[20%] animate-float animation-delay-4000 hover:scale-110 transition-transform duration-1000">
                  <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-lg border border-border/50 rotate-[5deg]">
                    <div className="w-8 h-8 text-blue-400 flex items-center justify-center text-3xl">🧩</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="container mx-auto max-w-4xl text-center relative z-10">
              


              <h1 className="hero-title font-heading text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.1] md:leading-tight text-foreground drop-shadow-sm mb-6">
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

              <p className="hero-desc text-lg md:text-2xl text-muted-foreground font-medium max-w-2xl mx-auto mb-10 leading-relaxed">
                {t('library.hero.description')}
              </p>
            </div>

            <div className="w-full md:container mx-auto max-w-6xl relative z-10">
              {/* Stats - Playful Cards */}
              <div className="hidden md:grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6 mb-16">
                {/* Quizzes Card */}
                <Card className={cn(
                  "stats-card rounded-3xl border-4 border-primary/20 dark:border-primary/10 bg-gradient-to-br from-green-50 to-white dark:from-green-950/30 dark:to-slate-900/50 backdrop-blur-md shadow-xl transition-all duration-300 group cursor-pointer overflow-hidden",
                  !isMobile && "hover:-translate-y-2 hover:shadow-2xl"
                )}>
                  <CardContent className="p-6 text-center relative">
                    {/* Floating Icon */}
                    <div className="absolute -top-2 -right-2 p-3 bg-primary/10 dark:bg-primary/20 rounded-full transform rotate-12 group-hover:rotate-0 group-hover:scale-110 transition-all duration-300">
                      <BookOpen className="w-8 h-8 text-primary dark:text-primary-400" />
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
                <Card className={cn(
                  "stats-card rounded-3xl border-4 border-purple-200 dark:border-purple-900/30 bg-gradient-to-br from-purple-50 to-white dark:from-purple-950/30 dark:to-slate-900/50 backdrop-blur-md shadow-xl transition-all duration-300 group cursor-pointer overflow-hidden",
                  !isMobile && "hover:-translate-y-2 hover:shadow-2xl"
                )}>
                  <CardContent className="p-6 text-center relative">
                    {/* Floating Icon */}
                    <div className="absolute -top-2 -right-2 p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full transform rotate-12 group-hover:rotate-0 group-hover:scale-110 transition-all duration-300">
                      <Sparkles className="w-8 h-8 text-purple-500 dark:text-purple-400" />
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
                <Card className={cn(
                  "stats-card rounded-3xl border-4 border-orange-200 dark:border-orange-900/30 bg-gradient-to-br from-orange-50 to-white dark:from-orange-950/30 dark:to-slate-900/50 backdrop-blur-md shadow-xl transition-all duration-300 group cursor-pointer overflow-hidden",
                  !isMobile && "hover:-translate-y-2 hover:shadow-2xl"
                )}>
                  <CardContent className="p-6 text-center relative">
                    {/* Floating Icon */}
                    <div className="absolute -top-2 -right-2 p-3 bg-orange-100 dark:bg-orange-900/30 rounded-full transform rotate-12 group-hover:rotate-0 group-hover:scale-110 transition-all duration-300">
                      <Star className="w-8 h-8 text-orange-500 dark:text-orange-400" />
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
              <div className="search-filter-section max-w-5xl mx-auto mb-12 space-y-4 relative z-10">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 h-5 w-5 md:h-8 md:w-8 text-primary/40" />
                  <Input
                    ref={searchInputRef}
                    placeholder={t('library.search.placeholder')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={cn(
                      "pl-12 pr-12 md:pl-16 md:pr-16 text-base md:text-xl py-4 md:py-8 h-14 md:h-20 rounded-full border-4 border-primary/20 focus:border-primary shadow-xl transition-all placeholder:text-muted-foreground/50 font-medium",
                      !isMobile && "hover:shadow-2xl"
                    )}
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
                <div className="flex flex-col lg:flex-row gap-4 items-center lg:items-center justify-between">
                  <div className="flex flex-wrap lg:flex-nowrap gap-2 md:gap-3 items-center justify-center lg:justify-start w-full lg:w-auto overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0">
                    {/* View Mode Toggle Group */}
                    <div className="flex bg-secondary/20 p-1 rounded-[22px] border-4 border-border backdrop-blur-sm">
                      <Button
                        variant="ghost"
                        onClick={() => {
                          play("toggle");
                          setViewMode('public');
                          setCurrentPage(1);
                        }}
                        className={cn(
                          "h-10 rounded-[14px] px-3 md:px-5 font-heading font-bold transition-all duration-300 text-sm md:text-base",
                          viewMode === 'public' 
                            ? "bg-primary text-primary-foreground shadow-lg scale-105" 
                            : "hover:bg-primary/10 text-muted-foreground hover:text-primary"
                        )}
                      >
                        {t('library.viewMode.public', 'Public Library')}
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => {
                          play("toggle");
                          if (!user) {
                            toast({ title: t("auth.loginRequired"), variant: "warning" });
                            setShowAuthModal(true);
                            return;
                          }
                          setViewMode('mine');
                          setCurrentPage(1);
                        }}
                        className={cn(
                          "h-10 rounded-[14px] px-3 md:px-5 font-heading font-bold transition-all duration-300 text-sm md:text-base",
                          viewMode === 'mine'
                            ? "bg-primary text-primary-foreground shadow-lg scale-105"
                            : "hover:bg-primary/10 text-muted-foreground hover:text-primary"
                        )}
                      >
                        {t('library.viewMode.mine', 'My Quizzes')}
                      </Button>
                    </div>

                    {/* Sort By */}
                    <div className="flex items-center gap-2">
                      <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                      <Select
                        value={sortBy}
                        onValueChange={(v) => {
                          play("toggle");
                          setSortBy(v as typeof sortBy);
                        }}>
                        <SelectTrigger className="w-full sm:w-[160px] h-12 rounded-2xl border-4 border-border font-heading font-medium">
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
                        onChallenge={isChallengeMode ? () => setChallengeQuiz(quiz) : undefined}
                        onShare={() => handleShareQuiz(quiz)}
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
                  <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-full border-4 border-white dark:border-slate-800 shadow-2xl p-2 inline-block">
                    <Pagination>
                      <PaginationContent className="gap-2">
                        <PaginationItem>
                          <PaginationPrevious
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            className={cn(
                              "rounded-full px-4 h-10 font-heading font-bold transition-all duration-300",
                              currentPage === 1
                                ? "pointer-events-none opacity-50"
                                : "hover:bg-white dark:hover:bg-slate-800 hover:text-primary hover:shadow-md hover:-translate-x-1 cursor-pointer"
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
          </section>


          <PreviewModal
            quiz={previewQuiz}
            open={!!previewQuiz}
            onOpenChange={(open) => !open && setPreviewQuiz(null)}
            onPlay={(quiz) => handleUseQuiz(quiz as unknown as PublicQuiz)}
          />

          <ShareDialog
            isOpen={!!shareQuiz}
            onClose={() => setShareQuiz(null)}
            url={shareQuiz ? `${window.location.origin}/quiz/play/${shareQuiz.id}` : ""}
            title={t('share.title', 'Share Quiz')}
            quizTitle={shareQuiz?.title}
            questionCount={Array.isArray(shareQuiz?.questions) ? shareQuiz?.questions.length : undefined}
          />
          <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} />
        </div>
        {/* Create Challenge Dialog */}
        {challengeQuiz && (
           <CreateChallengeDialog 
             isOpen={!!challengeQuiz}
             onClose={() => setChallengeQuiz(null)}
             onConfirm={handleCreateChallenge}
             quizTitle={challengeQuiz.title}
           />
        )}
      </div>
    </>
  );
};

export default QuizLibrary;
