import React, { useState, useEffect, useMemo, useCallback } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
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
} from "lucide-react";
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
import { useAudio } from "@/contexts/SoundContext";

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
  const { user } = useAuth();
  const { toast } = useToast();
  const [quizzes, setQuizzes] = useState<PublicQuiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedQuiz, setSelectedQuiz] = useState<PublicQuiz | null>(null);
  const [sortBy, setSortBy] = useState<"usage" | "downloads" | "date">("usage");
  const [searchIn, setSearchIn] = useState<"all" | "title" | "content">("all");
  const [selectedCategory, setSelectedCategory] = useState<
    QuizCategory | "all"
  >("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<
    QuizDifficulty | "all"
  >("all");
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  // Scroll to top when opening a new quiz preview
  useEffect(() => {
    if (selectedQuiz) {
      window.scrollTo({ top: 300, behavior: "smooth" });
    }
  }, [selectedQuiz]);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const navigate = useNavigate();
  const { play } = useAudio();

  const PAGE_SIZE = 9;
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

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

  // Debounce search để giảm tính toán khi người dùng đang gõ
  const [debouncedQuery, setDebouncedQuery] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(searchQuery), 200);
    return () => clearTimeout(t);
  }, [searchQuery]);

  // Load total stats from database
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

  const loadPublicQuizzes = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("quizzes")
        .select(
          "id,title,description,prompt,questions,prompt_tokens,candidates_tokens,total_tokens,created_at,user_id,is_public,usage_count,pdf_download_count,category,tags,difficulty"
        )
        .eq("is_public", true)
        .order("usage_count", { ascending: false })
        .order("pdf_download_count", { ascending: false })
        .order("created_at", { ascending: false })
        .range(0, PAGE_SIZE - 1);

      if (error) {
        console.error("Error loading public quizzes:", error);
        toast({
          title: "Lỗi",
          description: "Không thể tải thư viện quiz.",
          variant: "destructive",
        });
      } else {
        const rows = data || [];
        setQuizzes(rows);
        setHasMore(rows.length === PAGE_SIZE);
      }
    } catch (error) {
      console.error("Load public quizzes error:", error);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadTotalStats();
    loadPublicQuizzes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Keyboard shortcut: Ctrl/Cmd + K to focus search
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

  // Tải thêm trang tiếp theo (phân trang phía server)
  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    try {
      setLoadingMore(true);
      const from = quizzes.length;
      const to = from + PAGE_SIZE - 1;
      const { data, error } = await supabase
        .from("quizzes")
        .select(
          "id,title,description,prompt,questions,prompt_tokens,candidates_tokens,total_tokens,created_at,user_id,is_public,usage_count,pdf_download_count,category,tags,difficulty"
        )
        .eq("is_public", true)
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) {
        console.error("Error loading more quizzes:", error);
        toast({
          title: "Lỗi",
          description: "Không thể tải thêm quiz.",
          variant: "destructive",
        });
        return;
      }

      const rows = data || [];
      console.log(
        "📥 loadMore - loaded rows:",
        rows.length,
        "current quizzes:",
        quizzes.length
      );

      // Direct state updates without startTransition to avoid race conditions
      setQuizzes((prev) => {
        const updated = [...prev, ...rows];
        console.log(
          "📥 setQuizzes - prev:",
          prev.length,
          "rows:",
          rows.length,
          "updated:",
          updated.length
        );
        return updated;
      });
      setDisplayLimit((prev) => prev + PAGE_SIZE);
      setHasMore(rows.length === PAGE_SIZE);
    } finally {
      setLoadingMore(false);
    }
  };

  // Discover all unique categories from loaded quizzes
  const availableCategories = useMemo(() => {
    const categoriesSet = new Set<string>();
    quizzes.forEach((quiz) => {
      if (quiz.category) {
        categoriesSet.add(quiz.category);
      }
    });
    return Array.from(categoriesSet).sort();
  }, [quizzes]);

  const filteredQuizzes = useMemo(() => {
    console.log("🔍 filteredQuizzes memo - quizzes.length:", quizzes.length);
    const q = debouncedQuery.toLowerCase();
    let results = quizzes;

    // Apply category filter
    if (selectedCategory !== "all") {
      results = results.filter((quiz) => quiz.category === selectedCategory);
    }

    // Apply difficulty filter
    if (selectedDifficulty !== "all") {
      results = results.filter(
        (quiz) => quiz.difficulty === selectedDifficulty
      );
    }

    // Apply search filter
    if (q) {
      results = results.filter((quiz) => {
        const title = (quiz.title || "").toLowerCase();
        const desc = (quiz.description || "").toLowerCase();
        const prompt = (quiz.prompt || "").toLowerCase();

        // Search in questions content
        let questionsText = "";
        if (Array.isArray(quiz.questions)) {
          questionsText = quiz.questions
            .map((q: QuizQuestion) => {
              const question = q.question || "";
              const options = Array.isArray(q.options)
                ? q.options.join(" ")
                : "";
              const explanation = q.explanation || "";
              return `${question} ${options} ${explanation}`;
            })
            .join(" ")
            .toLowerCase();
        }

        // Apply search scope
        switch (searchIn) {
          case "title":
            return title.includes(q) || desc.includes(q);
          case "content":
            return questionsText.includes(q) || prompt.includes(q);
          case "all":
          default:
            return (
              title.includes(q) ||
              desc.includes(q) ||
              prompt.includes(q) ||
              questionsText.includes(q)
            );
        }
      });
    }

    // Apply sorting
    const sorted = [...results].sort((a, b) => {
      switch (sortBy) {
        case "usage":
          return (b.usage_count || 0) - (a.usage_count || 0);
        case "downloads":
          return (b.pdf_download_count || 0) - (a.pdf_download_count || 0);
        case "date":
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        default:
          return 0;
      }
    });

    return sorted;
  }, [
    quizzes,
    debouncedQuery,
    sortBy,
    searchIn,
    selectedCategory,
    selectedDifficulty,
  ]);

  // Reset displayLimit chỉ khi search query hoặc filters thay đổi
  useEffect(() => {
    if (
      debouncedQuery ||
      selectedCategory !== "all" ||
      selectedDifficulty !== "all"
    ) {
      // Reset về PAGE_SIZE khi có filter
      setDisplayLimit(PAGE_SIZE);
    }
  }, [debouncedQuery, selectedCategory, selectedDifficulty]);

  // Display limit: số lượng quiz tối đa hiển thị
  const [displayLimit, setDisplayLimit] = useState(PAGE_SIZE);

  // Stats cho dashboard - dựa vào quiz đang hiển thị
  const displayedStats = useMemo(() => {
    const displayedQuizzesForStats = filteredQuizzes.slice(0, displayLimit);
    const totalTokens = displayedQuizzesForStats.reduce(
      (sum, quiz) => sum + (quiz.total_tokens || 0),
      0
    );
    const uniqueCreators = new Set(
      displayedQuizzesForStats.map((q) => q.user_id)
    ).size;

    return {
      quizCount: displayedQuizzesForStats.length,
      totalTokens,
      uniqueCreators,
    };
  }, [filteredQuizzes, displayLimit]);

  // Stats tổng cho toàn bộ quiz đã load (để hiển thị khi cần)
  const allQuizzesStats = useMemo(() => {
    const totalTokens = quizzes.reduce(
      (sum, quiz) => sum + (quiz.total_tokens || 0),
      0
    );
    const uniqueCreators = new Set(quizzes.map((q) => q.user_id)).size;

    return {
      quizCount: quizzes.length,
      totalTokens,
      uniqueCreators,
    };
  }, [quizzes]);

  const displayedQuizzes = useMemo(() => {
    // Đảm bảo displayLimit không vượt quá số quiz có sẵn
    const maxDisplay = Math.min(displayLimit, filteredQuizzes.length);
    const result = filteredQuizzes.slice(0, maxDisplay);

    // Debug log để theo dõi
    console.log("DisplayedQuizzes Debug:", {
      displayLimit,
      filteredQuizzesLength: filteredQuizzes.length,
      maxDisplay,
      resultLength: result.length,
      hasMore,
      debouncedQuery,
      quizzesLength: quizzes.length,
    });

    return result;
  }, [filteredQuizzes, displayLimit, hasMore, debouncedQuery, quizzes.length]);

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
    warmupPdfWorker().catch(() => {});
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
        title: "Yêu cầu đăng nhập",
        description: "Vui lòng đăng nhập để sử dụng quiz.",
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
    navigate("/", { state: { quiz, scrollToQuiz: true } });

    // Provide quick confirmation
    toast({
      title: "Chuyển đến trình làm quiz",
      description: `Đang mở "${quiz.title}" để làm bài.`,
      variant: "success",
    });
  };

  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-secondary/30 to-background min-h-screen py-20 px-4">
        <div className="absolute inset-0 -z-10 opacity-5 hidden md:block">
          <ScrollVelocityContainer className="text-6xl md:text-8xl font-bold">
            <ScrollVelocityRow baseVelocity={40} rowIndex={0}>
              AI Education Smart Learning Intelligent Teaching Digital Classroom
            </ScrollVelocityRow>
            <ScrollVelocityRow baseVelocity={40} rowIndex={1}>
              Adaptive Assessment Personalized Learning Virtual Teacher
              Cognitive Training
            </ScrollVelocityRow>
            <ScrollVelocityRow baseVelocity={40} rowIndex={2}>
              Educational Analytics Student Engagement Knowledge Discovery
              Learning Analytics
            </ScrollVelocityRow>
            <ScrollVelocityRow baseVelocity={40} rowIndex={3}>
              Artificial Intelligence Machine Learning Neural Networks Cognitive
              Computing
            </ScrollVelocityRow>
            <ScrollVelocityRow baseVelocity={40} rowIndex={4}>
              Interactive Assessment Educational Technology Intelligent Tutoring
              Automated Grading
            </ScrollVelocityRow>
            <ScrollVelocityRow baseVelocity={40} rowIndex={5}>
              AI Education Smart Learning Intelligent Teaching Digital Classroom
            </ScrollVelocityRow>
            <ScrollVelocityRow baseVelocity={40} rowIndex={6}>
              Adaptive Assessment Personalized Learning Virtual Teacher
              Cognitive Training
            </ScrollVelocityRow>
            <ScrollVelocityRow baseVelocity={40} rowIndex={7}>
              Educational Analytics Student Engagement Knowledge Discovery
              Learning Analytics
            </ScrollVelocityRow>
            <ScrollVelocityRow baseVelocity={40} rowIndex={8}>
              Artificial Intelligence Machine Learning Neural Networks Cognitive
              Computing
            </ScrollVelocityRow>
            <ScrollVelocityRow baseVelocity={40} rowIndex={9}>
              Interactive Assessment Educational Technology Intelligent Tutoring
              Automated Grading
            </ScrollVelocityRow>
          </ScrollVelocityContainer>
        </div>

        <div className="container mx-auto max-w-4xl text-center">
          <div className="flex justify-center mb-6">
            <BookOpen className="w-16 h-16 text-[#B5CC89]" />
          </div>

          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Thư viện Quiz Chung
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            Khám phá và sử dụng hàng nghìn bài quiz do cộng đồng chia sẻ. Học
            tập, ôn luyện và mở rộng kiến thức của bạn.
          </p>
        </div>

        <div className="container mx-auto max-w-6xl">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
            <Card className="rounded-2xl bg-secondary/20 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div
                  ref={totalQuizzesRef}
                  className="text-4xl md:text-5xl font-bold text-primary mb-2">
                  0
                </div>
                <p className="text-sm md:text-base text-muted-foreground font-medium">
                  Quiz
                </p>
              </CardContent>
            </Card>
            <Card className="rounded-2xl bg-secondary/20 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div
                  ref={totalCategoriesRef}
                  className="text-4xl md:text-5xl font-bold text-primary mb-2">
                  0
                </div>
                <p className="text-sm md:text-base text-muted-foreground font-medium">
                  Chủ đề
                </p>
              </CardContent>
            </Card>
            <Card className="rounded-2xl bg-secondary/20 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div
                  ref={totalCreatorsRef}
                  className="text-4xl md:text-5xl font-bold text-primary mb-2">
                  0
                </div>
                <p className="text-sm md:text-base text-muted-foreground font-medium">
                  Người tạo
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Search & Filters */}
          <div className="max-w-4xl mx-auto mb-12 space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                ref={searchInputRef}
                placeholder="Tìm kiếm trong tiêu đề, mô tả, câu hỏi... (⌘K)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-12 text-base py-6 rounded-xl border-2 focus:border-[#B5CC89] transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded-full transition-colors"
                  aria-label="Xóa tìm kiếm">
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              )}
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
                    <SelectTrigger className="w-[180px] border-2">
                      <SelectValue placeholder="Sắp xếp theo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="usage">
                        Nhiều lượt dùng nhất
                      </SelectItem>
                      <SelectItem value="downloads">
                        Nhiều lượt tải nhất
                      </SelectItem>
                      <SelectItem value="date">Mới nhất</SelectItem>
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
                    <SelectTrigger className="w-[160px] border-2">
                      <SelectValue placeholder="Tìm trong" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả</SelectItem>
                      <SelectItem value="title">Tiêu đề & Mô tả</SelectItem>
                      <SelectItem value="content">Nội dung câu hỏi</SelectItem>
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
                  {filteredQuizzes.length} kết quả
                </Badge>
              )}
            </div>
          </div>

          {/* Quiz List */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div
              data-lib-list
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
              {displayedQuizzes.map((quiz) => (
                <Card
                  key={quiz.id}
                  className="border-2 hover:border-[#B5CC89] transition-all duration-300 hover:shadow-lg hover:scale-105">
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg line-clamp-2 leading-snug">
                        {quiz.title}
                      </CardTitle>
                      <Badge
                        variant="secondary"
                        className="bg-[#B5CC89]/20 text-[#B5CC89]">
                        Công khai
                      </Badge>
                    </div>
                    {quiz.description && (
                      <CardDescription className="line-clamp-2 mt-2">
                        {quiz.description}
                      </CardDescription>
                    )}
                    <div className="mt-3">
                      <QuizCategoryBadge
                        category={quiz.category}
                        difficulty={quiz.difficulty}
                        size="sm"
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Tags */}
                    {quiz.tags && quiz.tags.length > 0 && (
                      <QuizTags tags={quiz.tags} maxTags={3} />
                    )}
                    <div className="flex flex-wrap items-center text-sm text-muted-foreground gap-3">
                      <div
                        className="flex items-center gap-1"
                        title="Số lần sử dụng">
                        <TrendingUp className="h-3.5 w-3.5 text-[#B5CC89]" />
                        <span className="font-semibold text-foreground">
                          {formatNumber(quiz.usage_count || 0)}
                        </span>
                      </div>
                      <div
                        className="flex items-center gap-1"
                        title="Số lần tải PDF">
                        <FileDown className="h-3.5 w-3.5 text-blue-500" />
                        <span className="font-semibold text-foreground">
                          {formatNumber(quiz.pdf_download_count || 0)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <BookOpen className="h-3 w-3" />
                        <span>
                          {Array.isArray(quiz.questions)
                            ? quiz.questions.length
                            : 0}{" "}
                          câu
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{formatDate(quiz.created_at)}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedQuiz(quiz)}
                        className="flex-1 hover:bg-accent transition-colors">
                        Xem trước
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUseQuiz(quiz)}
                        className="flex-1 hover:bg-[#B5CC89] hover:text-white transition-colors">
                        <Star className="h-4 w-4 mr-2" />
                        Sử dụng
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={async () => {
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
                            const filename = `${
                              title.replace(/\s+/g, "-").toLowerCase() || "quiz"
                            }.pdf`;

                            // Warm up worker (no-op if already warmed) then generate in background thread
                            await warmupPdfWorker().catch(() => {});
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
                            console.error("Download quiz PDF error:", e);
                            toast({
                              title: "Lỗi",
                              description: "Không thể tạo/tải PDF.",
                              variant: "destructive",
                            });
                          }
                        }}
                        className="hover:bg-muted">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {(filteredQuizzes.length > PAGE_SIZE ||
            (hasMore && !debouncedQuery)) && (
            <div className="flex justify-center gap-3 mt-8">
              {filteredQuizzes.length > PAGE_SIZE && (
                <Button
                  variant="outline"
                  onClick={() => {
                    if (displayLimit > PAGE_SIZE) {
                      setDisplayLimit(PAGE_SIZE);
                    } else {
                      setDisplayLimit(
                        Math.max(PAGE_SIZE, filteredQuizzes.length)
                      );
                    }
                  }}
                  className="min-w-[140px]">
                  {displayLimit > PAGE_SIZE ? "Thu gọn" : "Hiển thị tất cả"}
                </Button>
              )}

              {hasMore && !debouncedQuery && (
                <Button
                  variant="outline"
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="min-w-[140px]">
                  {loadingMore ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
                      Đang tải...
                    </span>
                  ) : (
                    "Xem thêm"
                  )}
                </Button>
              )}
            </div>
          )}

          {!loading && filteredQuizzes.length === 0 && (
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
      </section>

      {/* Selected Quiz Preview Modal */}
      {selectedQuiz && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-3xl h-[85vh] flex flex-col">
            <Card className="w-full h-full border-2 rounded-xl shadow-lg bg-card flex flex-col">
              <CardHeader className="pb-4 border-b bg-card z-10 flex-shrink-0">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-2xl md:text-3xl font-bold mb-2">
                      {selectedQuiz.title}
                    </CardTitle>
                    {selectedQuiz.description && (
                      <CardDescription className="text-base">
                        {selectedQuiz.description}
                      </CardDescription>
                    )}
                    <div className="mt-3">
                      <QuizCategoryBadge
                        category={selectedQuiz.category}
                        difficulty={selectedQuiz.difficulty}
                        size="md"
                      />
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setSelectedQuiz(null)}
                    className="rounded-full hover:bg-destructive hover:text-destructive-foreground flex-shrink-0">
                    ✕
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto">
                <div className="space-y-6">
                  <div className="flex flex-wrap gap-3 py-4 border-b">
                    {/* Tags */}
                    {selectedQuiz.tags && selectedQuiz.tags.length > 0 && (
                      <QuizTags tags={selectedQuiz.tags} />
                    )}
                    <Badge
                      variant="secondary"
                      className="bg-[#B5CC89]/20 text-[#B5CC89]">
                      {Array.isArray(selectedQuiz.questions)
                        ? selectedQuiz.questions.length
                        : 0}{" "}
                      câu hỏi
                    </Badge>
                    <Badge variant="secondary" className="bg-secondary/50">
                      {formatDate(selectedQuiz.created_at)}
                    </Badge>
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg mb-4">
                      Danh sách câu hỏi:
                    </h3>
                    {Array.isArray(selectedQuiz.questions) &&
                    selectedQuiz.questions.length > 0 ? (
                      (selectedQuiz.questions as QuizQuestion[]).map(
                        (q, idx) => (
                          <div
                            key={idx}
                            className="border-2 hover:border-[#B5CC89] rounded-lg p-4 space-y-3 transition-colors duration-300 hover:shadow-md">
                            <h4 className="font-semibold text-base text-foreground">
                              {idx + 1}. {q.question || "Không có câu hỏi"}
                            </h4>
                            <div className="space-y-2 pl-4">
                              {Array.isArray(q.options) &&
                              q.options.length > 0 ? (
                                q.options.map((opt, optIdx) => (
                                  <div
                                    key={optIdx}
                                    className="text-sm text-muted-foreground">
                                    <span className="font-medium text-foreground">
                                      {String.fromCharCode(65 + optIdx)}.
                                    </span>{" "}
                                    {opt}
                                  </div>
                                ))
                              ) : (
                                <div className="text-sm text-muted-foreground italic">
                                  Không có đáp án
                                </div>
                              )}
                            </div>
                            {q.explanation && (
                              <div className="text-xs text-muted-foreground pt-3 border-t">
                                <span className="font-semibold text-foreground">
                                  Giải thích:
                                </span>{" "}
                                {q.explanation}
                              </div>
                            )}
                          </div>
                        )
                      )
                    ) : (
                      <div className="text-sm text-muted-foreground text-center py-8">
                        Không có câu hỏi
                      </div>
                    )}
                  </div>
                  <Button
                    onClick={async () => {
                      try {
                        // Increment PDF download count
                        await supabase.rpc("increment_quiz_pdf_download", {
                          quiz_id: selectedQuiz.id,
                        });

                        const questionsArray: Question[] = normalizeToQuestions(
                          Array.isArray(selectedQuiz.questions)
                            ? selectedQuiz.questions
                            : JSON.parse(String(selectedQuiz.questions || "[]"))
                        );

                        const title = selectedQuiz.title || "quiz";
                        const filename = `${
                          title.replace(/\s+/g, "-").toLowerCase() || "quiz"
                        }.pdf`;

                        await warmupPdfWorker().catch(() => {});
                        await generateAndDownloadPdf({
                          filename,
                          title,
                          description: selectedQuiz.description || "",
                          questions: questionsArray,
                          showResults: false,
                          userAnswers: [],
                        });

                        toast({
                          title: "Đã tải xuống PDF",
                          description: `Đã lưu ${filename}`,
                          variant: "success",
                        });
                      } catch (e) {
                        console.error("Download quiz PDF error:", e);
                        toast({
                          title: "Lỗi",
                          description: "Không thể tạo/tải PDF.",
                          variant: "destructive",
                        });
                      }
                    }}
                    variant="hero"
                    className="w-full group hover:bg-black hover:text-white">
                    <Download className="h-4 w-4 mr-2" />
                    Tải xuống PDF Quiz
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
      <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} />
    </div>
  );
};

export default QuizLibrary;
