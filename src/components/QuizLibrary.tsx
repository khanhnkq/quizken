import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
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
import { useToast } from "@/hooks/use-toast";
import {
  BookOpen,
  Search,
  Eye,
  Clock,
  Star,
  Download,
  Sparkles,
} from "lucide-react";
import jsPDF from "jspdf";
import { ScrollVelocityContainer, ScrollVelocityRow } from "./ScrollVelocity";
import AuthModal from "./AuthModal";

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
  const [showAuthModal, setShowAuthModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadPublicQuizzes();
  }, []);

  const loadPublicQuizzes = async () => {
    try {
      const { data, error } = await supabase
        .from("quizzes")
        .select("*")
        .eq("is_public", true)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading public quizzes:", error);
        toast({
          title: "Lỗi",
          description: "Không thể tải thư viện quiz.",
          variant: "destructive",
        });
      } else {
        setQuizzes(data || []);
      }
    } catch (error) {
      console.error("Load public quizzes error:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredQuizzes = quizzes.filter(
    (quiz) =>
      quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quiz.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quiz.prompt.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Helpers: đảm bảo jsPDF nhúng font Unicode để hiển thị tiếng Việt đúng dấu
  const arrayBufferToBinaryString = (buffer: ArrayBuffer) => {
    const bytes = new Uint8Array(buffer);
    let binary = "";
    const chunkSize = 0x8000;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.subarray(i, i + chunkSize);
      binary += String.fromCharCode(...chunk);
    }
    return binary;
  };

  const ensurePdfVnFont = async (doc: jsPDF) => {
    // Cache dữ liệu font trong window, nhưng luôn add vào VFS của tài liệu hiện tại
    const w = window as unknown as {
      __pdfVnFontDataReg?: string;
      __pdfVnFontDataBold?: string;
    };

    // Tải Regular nếu chưa có
    if (!w.__pdfVnFontDataReg) {
      const regCandidates = [
        "https://cdn.jsdelivr.net/gh/googlefonts/roboto@v20.0.0/src/hinted/Roboto-Regular.ttf",
        "https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/roboto/Roboto-Regular.ttf",
        "https://cdn.jsdelivr.net/gh/googlefonts/noto-fonts/hinted/ttf/NotoSans/NotoSans-Regular.ttf",
      ];
      for (const url of regCandidates) {
        try {
          const res = await fetch(url, { mode: "cors" });
          if (!res.ok) continue;
          const buf = await res.arrayBuffer();
          w.__pdfVnFontDataReg = arrayBufferToBinaryString(buf);
          break;
        } catch {
          // thử candidate tiếp theo
        }
      }
    }

    // Tải Bold nếu chưa có
    if (!w.__pdfVnFontDataBold) {
      const boldCandidates = [
        "https://cdn.jsdelivr.net/gh/googlefonts/roboto@v20.0.0/src/hinted/Roboto-Bold.ttf",
        "https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/roboto/Roboto-Bold.ttf",
        "https://cdn.jsdelivr.net/gh/googlefonts/noto-fonts/hinted/ttf/NotoSans/NotoSans-Bold.ttf",
      ];
      for (const url of boldCandidates) {
        try {
          const res = await fetch(url, { mode: "cors" });
          if (!res.ok) continue;
          const buf = await res.arrayBuffer();
          w.__pdfVnFontDataBold = arrayBufferToBinaryString(buf);
          break;
        } catch {
          // thử candidate tiếp theo
        }
      }
    }

    if (w.__pdfVnFontDataReg) {
      // Luôn add vào VFS của jsPDF hiện tại
      doc.addFileToVFS("Roboto-Regular.ttf", w.__pdfVnFontDataReg);
      doc.addFont("Roboto-Regular.ttf", "Roboto", "normal");
      if (w.__pdfVnFontDataBold) {
        doc.addFileToVFS("Roboto-Bold.ttf", w.__pdfVnFontDataBold);
        doc.addFont("Roboto-Bold.ttf", "Roboto", "bold");
      }
      return true;
    }

    console.warn(
      "Không thể tải font hỗ trợ tiếng Việt cho jsPDF; sẽ dùng font mặc định (có thể lỗi dấu)."
    );
    return false;
  };

  const handleUseQuiz = (quiz: PublicQuiz) => {
    if (!user) {
      toast({
        title: "Yêu cầu đăng nhập",
        description: "Vui lòng đăng nhập để sử dụng quiz.",
        variant: "warning",
      });
      setShowAuthModal(true);
      return;
    }

    // Navigate to home and open the quiz generator with selected quiz data
    navigate("/", { state: { quiz } });

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
      <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-primary" />
              <span className="text-2xl font-bold">
                Quiz<span className="text-primary">AI</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                asChild
                variant="outline"
                className="hover:bg-[#B5CC89] hover:text-white transition-colors">
                <Link to="/" className="flex items-center gap-2">
                  <span className="hidden sm:inline">Back to Home</span>
                  <span className="sm:hidden">← Home</span>
                </Link>
              </Button>
              {!user && (
                <Button
                  variant="outline"
                  onClick={() => setShowAuthModal(true)}
                  className="hover:bg-primary hover:text-primary-foreground hover:border-foreground transition-colors">
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-secondary/30 to-background min-h-screen py-20 px-4">
        <div className="absolute inset-0 -z-10 opacity-5">
          <ScrollVelocityContainer className="text-6xl md:text-8xl font-bold">
            <ScrollVelocityRow baseVelocity={40} rowIndex={0}>
              Community Shared Quizzes Learning Resources Educational Content
              Knowledge Base
            </ScrollVelocityRow>
            <ScrollVelocityRow baseVelocity={40} rowIndex={1}>
              Quiz Database Learning Materials Study Guides Assessment Tools
              Practice Questions
            </ScrollVelocityRow>
            <ScrollVelocityRow baseVelocity={40} rowIndex={2}>
              Interactive Learning Gamified Education Smart Assessments
              Personalized Tests
            </ScrollVelocityRow>
            <ScrollVelocityRow baseVelocity={40} rowIndex={3}>
              AI Generated Content Machine Learning Education Cognitive Training
              Skill Development
            </ScrollVelocityRow>
            <ScrollVelocityRow baseVelocity={40} rowIndex={4}>
              Collaborative Learning Peer Education Knowledge Sharing Academic
              Resources
            </ScrollVelocityRow>
            <ScrollVelocityRow baseVelocity={40} rowIndex={5}>
              Community Shared Quizzes Learning Resources Educational Content
              Knowledge Base
            </ScrollVelocityRow>
            <ScrollVelocityRow baseVelocity={40} rowIndex={6}>
              Quiz Database Learning Materials Study Guides Assessment Tools
              Practice Questions
            </ScrollVelocityRow>
            <ScrollVelocityRow baseVelocity={40} rowIndex={7}>
              Interactive Learning Gamified Education Smart Assessments
              Personalized Tests
            </ScrollVelocityRow>
            <ScrollVelocityRow baseVelocity={40} rowIndex={8}>
              AI Generated Content Machine Learning Education Cognitive Training
              Skill Development
            </ScrollVelocityRow>
            <ScrollVelocityRow baseVelocity={40} rowIndex={9}>
              Collaborative Learning Peer Education Knowledge Sharing Academic
              Resources
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
            <Card className="border-2">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-primary mb-2">
                  {quizzes.length}+
                </div>
                <p className="text-sm text-muted-foreground">Quiz Công khai</p>
              </CardContent>
            </Card>
            <Card className="border-2">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {quizzes.reduce((sum, quiz) => sum + quiz.total_tokens, 0)}
                </div>
                <p className="text-sm text-muted-foreground">Total Tokens</p>
              </CardContent>
            </Card>
            <Card className="border-2">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {new Set(quizzes.map((q) => q.user_id)).size}
                </div>
                <p className="text-sm text-muted-foreground">Người Tạo</p>
              </CardContent>
            </Card>
          </div>

          {/* Search */}
          <div className="max-w-md mx-auto mb-12">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm quiz..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 text-lg py-3"
              />
            </div>
          </div>

          {/* Quiz List */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredQuizzes.map((quiz) => (
                <Card
                  key={quiz.id}
                  className="border-2 hover:border-[#B5CC89] transition-all duration-300 hover:shadow-lg hover:scale-105">
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg line-clamp-2 leading-tight">
                        {quiz.title}
                      </CardTitle>
                      <Badge
                        variant="secondary"
                        className="bg-[#B5CC89]/20 text-[#B5CC89]">
                        Public
                      </Badge>
                    </div>
                    {quiz.description && (
                      <CardDescription className="line-clamp-2 mt-2">
                        {quiz.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center text-sm text-muted-foreground space-x-4">
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        <span>
                          {quiz.prompt_tokens + quiz.candidates_tokens}
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
                        onClick={() => handleUseQuiz(quiz)}
                        className="flex-1 hover:bg-[#B5CC89] hover:text-white transition-colors">
                        <Star className="h-4 w-4 mr-2" />
                        Sử dụng
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={async () => {
                          try {
                            // Normalize questions to an array
                            const questionsArray = Array.isArray(quiz.questions)
                              ? (quiz.questions as unknown[])
                              : JSON.parse(String(quiz.questions || "[]"));
                            const title = quiz.title || "quiz";
                            const filename = `${
                              title.replace(/\s+/g, "-").toLowerCase() || "quiz"
                            }.pdf`;

                            const doc = new jsPDF({ unit: "mm", format: "a4" });
                            const vnFontReady = await ensurePdfVnFont(doc);
                            const FONT_FAMILY = vnFontReady
                              ? "Roboto"
                              : "helvetica";
                            const pageWidth = doc.internal.pageSize.getWidth();
                            const pageHeight =
                              doc.internal.pageSize.getHeight();
                            const marginX = 15;
                            const marginTop = 15;
                            const marginBottom = 15;
                            const contentWidth = pageWidth - marginX * 2;
                            let y = marginTop;

                            const addPageIfNeeded = (increment: number) => {
                              if (y + increment > pageHeight - marginBottom) {
                                doc.addPage();
                                y = marginTop;
                              }
                            };

                            const addBlock = (
                              text: string,
                              fontSize = 11,
                              fontStyle: "normal" | "bold" = "normal",
                              gapAfter = 3
                            ) => {
                              doc.setFont(FONT_FAMILY, fontStyle);
                              doc.setFontSize(fontSize);
                              const lines = doc.splitTextToSize(
                                text,
                                contentWidth
                              );
                              const lineHeight = fontSize * 0.55;
                              lines.forEach((line: string) => {
                                addPageIfNeeded(lineHeight);
                                doc.text(line, marginX, y);
                                y += lineHeight;
                              });
                              y += gapAfter;
                            };

                            // Header
                            addBlock(title, 16, "bold", 2);
                            addBlock(
                              `Mô tả: ${quiz.description || ""}`,
                              10,
                              "normal",
                              4
                            );
                            addBlock(
                              `Tải xuống: ${new Date().toLocaleString(
                                "vi-VN"
                              )}`,
                              10,
                              "normal",
                              4
                            );

                            // Divider
                            addPageIfNeeded(2);
                            doc.setDrawColor(200);
                            doc.line(marginX, y, pageWidth - marginX, y);
                            y += 6;

                            // Questions
                            (questionsArray || []).forEach(
                              (q: QuizQuestion, idx: number) => {
                                if (!q) return;
                                const questionText =
                                  typeof q.question === "string"
                                    ? q.question
                                    : String(q.question || "");
                                addBlock(
                                  `${idx + 1}. ${questionText}`,
                                  11,
                                  "bold",
                                  2
                                );

                                const options = Array.isArray(q.options)
                                  ? q.options
                                  : [];
                                options.forEach((opt: string, i: number) => {
                                  const prefix =
                                    String.fromCharCode(65 + i) + ". ";
                                  addBlock(`${prefix}${opt}`, 11, "normal", 1);
                                });

                                if (q.explanation) {
                                  addBlock(
                                    `Giải thích: ${q.explanation}`,
                                    10,
                                    "normal",
                                    3
                                  );
                                } else {
                                  y += 2;
                                }
                              }
                            );

                            doc.save(filename);

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

          {!loading && filteredQuizzes.length === 0 && (
            <div className="text-center py-16">
              <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                Không tìm thấy quiz
              </h3>
              <p className="text-muted-foreground">
                {searchQuery
                  ? "Hãy thử với từ khóa khác"
                  : "Hãy tạo một quiz và chia sẻ!"}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Selected Quiz Preview Modal */}
      {selectedQuiz && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl mb-2">
                    {selectedQuiz.title}
                  </CardTitle>
                  {selectedQuiz.description && (
                    <CardDescription>
                      {selectedQuiz.description}
                    </CardDescription>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedQuiz(null)}
                  className="hover:bg-primary hover:text-primary-foreground hover:border-foreground transition-colors">
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Tokens:</strong> {selectedQuiz.total_tokens}
                  </div>
                  <div>
                    <strong>Người tạo:</strong>{" "}
                    {selectedQuiz.user_id.slice(0, 8)}...
                  </div>
                  <div>
                    <strong>Ngày tạo:</strong>{" "}
                    {formatDate(selectedQuiz.created_at)}
                  </div>
                  <div>
                    <strong>Câu hỏi:</strong>{" "}
                    {Array.isArray(selectedQuiz.questions)
                      ? selectedQuiz.questions.length
                      : "N/A"}
                  </div>
                </div>
                <Button
                  onClick={async () => {
                    try {
                      const questionsArray = Array.isArray(
                        selectedQuiz.questions
                      )
                        ? (selectedQuiz.questions as unknown[])
                        : JSON.parse(String(selectedQuiz.questions || "[]"));
                      const title = selectedQuiz.title || "quiz";
                      const filename = `${
                        title.replace(/\s+/g, "-").toLowerCase() || "quiz"
                      }.pdf`;

                      const doc = new jsPDF({ unit: "mm", format: "a4" });
                      const vnFontReady = await ensurePdfVnFont(doc);
                      const FONT_FAMILY = vnFontReady ? "Roboto" : "helvetica";
                      const pageWidth = doc.internal.pageSize.getWidth();
                      const pageHeight = doc.internal.pageSize.getHeight();
                      const marginX = 15;
                      const marginTop = 15;
                      const marginBottom = 15;
                      const contentWidth = pageWidth - marginX * 2;
                      let y = marginTop;

                      const addPageIfNeeded = (increment: number) => {
                        if (y + increment > pageHeight - marginBottom) {
                          doc.addPage();
                          y = marginTop;
                        }
                      };

                      const addBlock = (
                        text: string,
                        fontSize = 11,
                        fontStyle: "normal" | "bold" = "normal",
                        gapAfter = 3
                      ) => {
                        doc.setFont(FONT_FAMILY, fontStyle);
                        doc.setFontSize(fontSize);
                        const lines = doc.splitTextToSize(text, contentWidth);
                        const lineHeight = fontSize * 0.55;
                        lines.forEach((line: string) => {
                          addPageIfNeeded(lineHeight);
                          doc.text(line, marginX, y);
                          y += lineHeight;
                        });
                        y += gapAfter;
                      };

                      // Header
                      addBlock(title, 16, "bold", 2);
                      addBlock(
                        `Mô tả: ${selectedQuiz.description || ""}`,
                        10,
                        "normal",
                        4
                      );
                      addBlock(
                        `Tải xuống: ${new Date().toLocaleString("vi-VN")}`,
                        10,
                        "normal",
                        4
                      );

                      // Divider
                      addPageIfNeeded(2);
                      doc.setDrawColor(200);
                      doc.line(marginX, y, pageWidth - marginX, y);
                      y += 6;

                      (questionsArray || []).forEach(
                        (q: unknown, idx: number) => {
                          if (!q) return;
                          const qq = q as QuizQuestion;
                          const questionText =
                            typeof qq.question === "string"
                              ? qq.question
                              : String(qq.question || "");
                          addBlock(
                            `${idx + 1}. ${questionText}`,
                            11,
                            "bold",
                            2
                          );

                          const options = Array.isArray(qq.options)
                            ? qq.options
                            : [];
                          options.forEach((opt: string, i: number) => {
                            const prefix = String.fromCharCode(65 + i) + ". ";
                            addBlock(`${prefix}${opt}`, 11, "normal", 1);
                          });

                          if (qq.explanation) {
                            addBlock(
                              `Giải thích: ${qq.explanation}`,
                              10,
                              "normal",
                              3
                            );
                          } else {
                            y += 2;
                          }
                        }
                      );

                      doc.save(filename);

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
                  Download Quiz PDF
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} />
    </div>
  );
};

export default QuizLibrary;
