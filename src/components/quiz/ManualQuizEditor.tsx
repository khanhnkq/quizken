import React, { useState, useCallback, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";
import { Plus, Trash2, Check, X, GripVertical, Sparkles, ArrowLeft, PenLine, Image as ImageIcon, Loader2, Bot, Lightbulb, Zap, Wand2, Layers, Eraser } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { uploadImage } from "@/lib/cloudinary";
import { useProfile } from "@/hooks/useProfile";
import { VietnamMapIcon, VietnamStarIcon, VietnamDrumIcon, VietnamLotusIcon } from "@/components/icons/VietnamIcons";
import { NeonBoltIcon, NeonCyberSkullIcon, PastelCloudIcon, PastelHeartIcon, ComicPowIcon, ComicBoomIcon } from "@/components/icons/ThemeIcons";
import { KnowledgeBaseManager } from "@/components/knowledge/KnowledgeBaseManager";
import { useNavbarActions } from "@/contexts/NavbarActionContext";
import type { Question, Quiz } from "@/types/quiz";
import QuizValidationResult, { ValidationResult } from "./QuizValidationResult";

interface ManualQuizEditorProps {
  onComplete?: (quizId: string) => void;
  onCancel?: () => void;
  variant?: "dialog" | "page";
  quizId?: string; // Optional quizId for editing mode
}

export function ManualQuizEditor({ onComplete, onCancel, variant = "dialog", quizId }: ManualQuizEditorProps) {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { profileData } = useProfile(user?.id);
  const { setActions } = useNavbarActions();

  const themeConfig = React.useMemo(() => {
    const theme = profileData?.equipped_theme;
    switch (theme) {
      case 'theme_vietnam_spirit':
        return {
          headerIcon: VietnamLotusIcon,
          headerGradient: "from-pink-500 to-rose-500",
          saveIcon: VietnamStarIcon,
          activeOptionColor: "bg-red-500 border-red-500 text-white",
          hoverOptionBorder: "hover:border-red-400 dark:hover:border-red-400",
        };
      case 'theme_neon_night':
        return {
          headerIcon: NeonCyberSkullIcon,
          headerGradient: "from-cyan-500 to-blue-600",
          saveIcon: NeonBoltIcon,
          activeOptionColor: "bg-cyan-500 border-cyan-500 text-white",
          hoverOptionBorder: "hover:border-cyan-400 dark:hover:border-cyan-400",
        };
      case 'theme_pastel_dream':
        return {
          headerIcon: PastelCloudIcon,
          headerGradient: "from-pink-300 to-purple-400",
          saveIcon: PastelHeartIcon,
          activeOptionColor: "bg-pink-400 border-pink-400 text-white",
          hoverOptionBorder: "hover:border-pink-300 dark:hover:border-pink-300",
        };
      case 'theme_comic_manga':
        return {
          headerIcon: ComicPowIcon,
          headerGradient: "from-yellow-400 to-orange-500 border-2 border-black",
          saveIcon: ComicBoomIcon,
          activeOptionColor: "bg-yellow-400 border-black text-black",
          hoverOptionBorder: "hover:border-black dark:hover:border-black",
        };
      default:
        return {
           headerIcon: PenLine,
           headerGradient: "from-emerald-500 to-teal-500",
           saveIcon: Sparkles,
           activeOptionColor: "bg-green-500 border-green-500 text-white",
           hoverOptionBorder: "hover:border-green-400 dark:hover:border-green-400",
        };
    }
  }, [profileData?.equipped_theme]);

  // Quiz metadata
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Questions array
  const [questions, setQuestions] = useState<Question[]>([
    { question: "", options: ["", "", "", ""], correctAnswer: 0, explanation: "" }
  ]);

  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState<number | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // AI Validation State
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isGeneratingExplanations, setIsGeneratingExplanations] = useState(false);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [pendingSave, setPendingSave] = useState(false);

  // RAG State
  const [useRAG, setUseRAG] = useState(false);
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
  const [availableDocs, setAvailableDocs] = useState<{id: string, title: string}[]>([]);
  const [isDocsLoading, setIsDocsLoading] = useState(false);

  // Fetch documents when RAG is enabled
  useEffect(() => {
    if (useRAG && user?.id) {
      fetchDocuments();
    }
  }, [useRAG, user?.id]);

  const fetchDocuments = async () => {
    setIsDocsLoading(true);
    const { data } = await supabase.from("documents").select("id, title").order("created_at", { ascending: false });
    if (data) setAvailableDocs(data);
    setIsDocsLoading(false);
  };

  const toggleDocSelection = useCallback((docId: string) => {
    setSelectedDocs(prev =>
      prev.includes(docId)
        ? prev.filter(id => id !== docId)
        : [...prev, docId]
    );
  }, []);

  // Fetch quiz data if handling edit mode
  React.useEffect(() => {
    if (!quizId) return;

    const fetchQuiz = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("quizzes")
          .select("*")
          .eq("id", quizId)
          .single();

        if (error) throw error;
        if (data) {
          setTitle(data.title);
          setDescription(data.description || "");
          setIsPublic(data.is_public ?? true);
          
          if (data.questions && Array.isArray(data.questions)) {
            // Cast to Question[] to ensure type safety
             const loadedQuestions = (data.questions as unknown as Question[]).map(q => ({
                question: q.question || "",
                options: q.options || ["", "", "", ""],
                correctAnswer: typeof q.correctAnswer === 'number' ? q.correctAnswer : 0,
                explanation: q.explanation || "",
                image: q.image || undefined
             }));
             setQuestions(loadedQuestions.length > 0 ? loadedQuestions : [{ question: "", options: ["", "", "", ""], correctAnswer: 0, explanation: "" }]);
          }
        }
      } catch (error) {
        console.error("Error fetching quiz:", error);
        toast({
          title: t("common.error"),
          description: "Failed to load quiz data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuiz();
  }, [quizId, toast, t]);

  // Add a new question
  const addQuestion = useCallback(() => {
    setQuestions(prev => [
      ...prev,
      { question: "", options: ["", "", "", ""], correctAnswer: 0, explanation: "" }
    ]);
  }, []);

  // Remove a question
  const removeQuestion = useCallback((index: number) => {
    if (questions.length <= 1) {
      toast({
        title: t("manualQuiz.errors.minQuestions"),
        description: t("manualQuiz.errors.minQuestionsDesc"),
        variant: "warning",
      });
      return;
    }
    setQuestions(prev => prev.filter((_, i) => i !== index));
  }, [questions.length, toast, t]);

  // Update question text
  const updateQuestion = useCallback((index: number, field: keyof Question, value: Question[keyof Question]) => {
    setQuestions(prev => prev.map((q, i) => 
      i === index ? { ...q, [field]: value } : q
    ));
  }, []);

  // Update an option
  const updateOption = useCallback((qIndex: number, optIndex: number, value: string) => {
    setQuestions(prev => prev.map((q, i) => {
      if (i !== qIndex) return q;
      const newOptions = [...q.options];
      newOptions[optIndex] = value;
      return { ...q, options: newOptions };
    }));
  }, []);

  // Add option to a question
  const addOption = useCallback((qIndex: number) => {
    setQuestions(prev => prev.map((q, i) => {
      if (i !== qIndex) return q;
      if (q.options.length >= 6) return q; // Max 6 options
      return { ...q, options: [...q.options, ""] };
    }));
  }, []);

  // Remove option from a question
  const removeOption = useCallback((qIndex: number, optIndex: number) => {
    setQuestions(prev => prev.map((q, i) => {
      if (i !== qIndex) return q;
      if (q.options.length <= 2) return q; // Min 2 options
      const newOptions = q.options.filter((_, oi) => oi !== optIndex);
      // Adjust correctAnswer if needed
      let newCorrect = q.correctAnswer;
      if (optIndex === q.correctAnswer) {
        newCorrect = 0;
      } else if (optIndex < q.correctAnswer) {
        newCorrect = q.correctAnswer - 1;
      }
      return { ...q, options: newOptions, correctAnswer: newCorrect };
    }));
  }, []);

  // Handle Image Upload
  const handleImageUpload = async (file: File, index: number) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (PNG, JPG, WEBP)",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Image size should be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    setUploadingImage(index);
    try {
      const url = await uploadImage(file);
      updateQuestion(index, "image", url);
    } catch (error) {
      console.error("Upload failed", error);
      toast({
        title: t("manualQuiz.imageUploadFailed"),
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setUploadingImage(null);
    }
  };

  // Validate form
  const validate = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = t("manualQuiz.errors.titleRequired");
    }

    questions.forEach((q, i) => {
      if (!q.question.trim()) {
        newErrors[`q${i}`] = t("manualQuiz.errors.questionRequired");
      }
      const filledOptions = q.options.filter(o => o.trim());
      if (filledOptions.length < 2) {
        newErrors[`q${i}opts`] = t("manualQuiz.errors.minOptions");
      }
      if (!q.options[q.correctAnswer]?.trim()) {
        newErrors[`q${i}correct`] = t("manualQuiz.errors.correctRequired");
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [title, questions, t]);

  // Perform AI Validation
  const performAiCheck = useCallback(async (): Promise<ValidationResult | null> => {
    setIsChecking(true);
    setValidationResult(null);

    try {
      const quizPayload = {
        title,
        description,
        questions: questions.map(q => ({
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation
        })),
        language: i18n.language // Get current language from i18n
      };

      const { data, error } = await supabase.functions.invoke('check-quiz-content', {
        body: { quiz: quizPayload }
      });

      if (error) throw error;

      setValidationResult(data);
      return data;

    } catch (error) {
      console.error("AI Check Failed:", error);
      toast({
        title: "AI Check Failed",
        description: (error as Error).message || "Could not validate quiz.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsChecking(false);
    }
  }, [title, description, questions, i18n.language, toast]);

  // Handle AI Check Button Click
  const handleCheckQuiz = useCallback(async () => {
    if (!validationResult) {
       if (!validate()) {
         toast({
           title: t("manualQuiz.errors.validationFailed"),
           description: "Please fix basic errors before checking with AI.",
           variant: "destructive",
         });
         return;
       }
    }

    const result = await performAiCheck();
    
    if (result) {
      if (result.isValid && (!result.issues || result.issues.length === 0)) {
         toast({
            title: "AI Check Complete",
            description: "No issues found!",
            variant: "success",
         });
      } else {
         toast({
            title: "AI Check Complete",
            description: `Found ${result.issues?.length || 0} potential issues.`,
            variant: "default",
         });
      }
    }
  }, [validationResult, validate, toast, t, performAiCheck]);

  // Handle Auto Fill
  const handleAutoFill = useCallback(async () => {
    // Validation
    if (!title.trim()) {
       toast({
         title: t("manualQuiz.errors.validationFailed"),
         description: t("manualQuiz.errors.autoFillTitleRequired"),
         variant: "destructive",
       });
       return;
    }

    // Check if there are any questions at all
    if (questions.length === 0) {
        toast({
          title: t("manualQuiz.errors.validationFailed"),
          description: t("manualQuiz.errors.autoFillQuestionRequired"),
          variant: "destructive",
        });
        return;
    }
    
    // Check if at least one question has content
    const hasContent = questions.some(q => q.question.trim().length > 0);
    if (!hasContent) {
        toast({
          title: t("manualQuiz.errors.validationFailed"),
          description: t("manualQuiz.errors.autoFillQuestionRequired"),
          variant: "destructive",
        });
        return;
    }

    setIsGeneratingExplanations(true);
    try {
      // Send current state so AI knows what to fill
      const payload = questions.map((q, index) => ({
        index,
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation
      }));

      const { data, error } = await supabase.functions.invoke('generate-explanation', {
        body: { 
          questions: payload,
          language: i18n.language,
          documentIds: useRAG ? selectedDocs : []
        }
      });

      if (error) throw error;

      if (data && data.results && Array.isArray(data.results)) {
        setQuestions(prev => {
          const newQuestions = [...prev];
          data.results.forEach((item: { index: number, options?: string[], correctAnswer?: number, explanation?: string }) => {
            if (newQuestions[item.index]) {
              const q = newQuestions[item.index];
              // Only overwrite if new data provided
              newQuestions[item.index] = {
                ...q,
                options: (item.options && item.options.length >= 2) ? item.options : q.options,
                correctAnswer: (typeof item.correctAnswer === 'number') ? item.correctAnswer : q.correctAnswer,
                explanation: item.explanation || q.explanation
              };
            }
          });
          return newQuestions;
        });

        toast({
          title: "Auto Fill Complete",
          description: `Generated content for ${data.results.length} questions.`,
          variant: "success",
        });
      }

    } catch (error) {
      console.error("Auto Fill Failed:", error);
      toast({
        title: "Auto Fill Failed",
        description: (error as Error).message || "Could not generate content.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingExplanations(false);
    }
  }, [title, questions, t, i18n.language, useRAG, selectedDocs, toast]);

  // Handle Quick Add Questions
  const handleQuickAddQuestions = useCallback(async () => {
    // Validation: Title required
    if (!title.trim()) {
        toast({
          title: t("manualQuiz.errors.validationFailed"),
          description: t("manualQuiz.errors.autoFillTitleRequired"),
          variant: "destructive",
        });
        return;
     }

    setIsGeneratingQuestions(true);
    try {
        const { data, error } = await supabase.functions.invoke('generate-explanation', {
            body: { 
              action: 'generate_questions',
              topic: title,
              count: 5,
              language: i18n.language,
              documentIds: useRAG ? selectedDocs : []
            }
        });

        if (error) throw error;

        if (data && data.results && Array.isArray(data.results)) {
            const newQuestions: Question[] = data.results.map((item: any) => ({
                question: item.question || "",
                options: Array.isArray(item.options) ? item.options : ["", "", "", ""],
                correctAnswer: typeof item.correctAnswer === 'number' ? item.correctAnswer : 0,
                explanation: item.explanation || ""
            }));

            setQuestions(prev => [...prev, ...newQuestions]);

            toast({
                title: t("manualQuiz.success.quickAdd"),
                description: t("manualQuiz.success.quickAddDesc", { count: newQuestions.length }),
                variant: "success",
            });
        }
    } catch (error) {
        console.error("Quick Add Failed:", error);
        toast({
            title: t("manualQuiz.errors.quickAddFailed"),
            description: (error as Error).message || "Could not generate questions.",
            variant: "destructive",
        });
    } finally {
        setIsGeneratingQuestions(false);
    }
  }, [title, t, i18n.language, useRAG, selectedDocs, toast]);

  // Step 1: Actually save & navigate (called from dialog confirm button or directly if AI check fails)
  const executeSave = useCallback(async () => {
    if (!user) return;
    
    setPendingSave(false);
    setValidationResult(null);
    setSaving(true);

    try {
      // Clean questions (remove empty options)
      const cleanedQuestions = questions.map(q => ({
        question: q.question.trim(),
        options: q.options.filter(o => o.trim()),
        correctAnswer: q.correctAnswer,
        explanation: q.explanation?.trim() || undefined,
        image: q.image || undefined,
      }));

      let result;
      
      if (quizId) {
        // Update existing quiz
        result = await supabase
          .from("quizzes")
          .update({
             title: title.trim(),
             description: description.trim() || null,
             questions: cleanedQuestions,
             is_public: isPublic,
             updated_at: new Date().toISOString()
           })
           .eq("id", quizId)
           .select("id")
           .single();
      } else {
        // Create new quiz
        result = await supabase
        .from("quizzes")
        .insert({
          title: title.trim(),
          description: description.trim() || null,
          prompt: `[Manual] ${title.trim()}`,
          questions: cleanedQuestions,
          user_id: user.id,
          is_public: isPublic,
          status: "completed",
          source_type: "manual",
        })
        .select("id")
        .single();
      }

      const { data, error } = result;

      if (error) throw error;

      toast({
        title: quizId ? t("manualQuiz.success.updated") : t("manualQuiz.success.title"),
        description: t("manualQuiz.success.description", { count: cleanedQuestions.length }),
        variant: "success",
      });

      if (onComplete) {
        onComplete(data.id);
      } else {
        navigate(`/quiz/play/${data.id}`);
      }
    } catch (error) {
      console.error("Failed to save quiz:", error);
      toast({
        title: t("manualQuiz.errors.saveFailed"),
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }, [user, questions, title, description, toast, t, onComplete, navigate, isPublic, quizId]);

  // Step 2: Run AI check and show dialog for user review, or save directly if AI check fails
  const handleSave = useCallback(async () => {
    if (!user) {
      toast({
        title: t("auth.required"),
        description: t("auth.loginToCreate"),
        variant: "warning",
      });
      return;
    }

    if (!validate()) {
      toast({
        title: t("manualQuiz.errors.validationFailed"),
        description: t("manualQuiz.errors.fixErrors"),
        variant: "destructive",
      });
      return;
    }

    // Run AI check — dialog will open via setValidationResult
    const checkResult = await performAiCheck();

    if (!checkResult) {
      // AI Check failed (network error etc) — save directly without AI review
      await executeSave();
      return;
    }

    // Mark that we're waiting for user confirmation in the dialog
    setPendingSave(true);
    // Dialog is now open (validationResult is set by performAiCheck)
    // User must click "Confirm & Save" or "Close" in the dialog
  }, [user, validate, toast, t, performAiCheck, executeSave]);

  // Navbar Actions Integration
  useEffect(() => {
    if (variant !== "page") {
      setActions(null);
      return;
    }

    const isBusy = saving || isChecking || isGeneratingQuestions || isGeneratingExplanations;

    setActions(
      <div className="flex items-center gap-1 md:gap-2">{variant === 'page' ? (
          <Button 
            variant="ghost" 
            size="sm" 
            asChild
            disabled={isBusy} 
            className="px-2 sm:px-3 text-muted-foreground h-9"
            title={t("common.back")}
          >
            <Button onClick={() => navigate("/")}>
               <ArrowLeft className="w-4 h-4 sm:hidden" />
               <span className="hidden sm:inline">{t("common.back")}</span>
            </Button>
           </Button>
        ) : onCancel && (
           <Button 
             variant="ghost" 
             size="sm" 
             type="button"
             onClick={(e) => {
               e.preventDefault();
               onCancel();
             }} 
             disabled={isBusy} 
             className="px-2 sm:px-3 text-muted-foreground h-9"
             title={t("common.cancel")}
           >
              <X className="w-4 h-4 sm:hidden" />
              <span className="hidden sm:inline">{t("common.cancel")}</span>
            </Button>
        )}
           <Sheet>
          <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={isBusy}
                    className={cn(
                      "px-2 sm:px-3 text-xs sm:text-sm whitespace-nowrap h-9",
                      useRAG
                        ? "text-yellow-700 bg-yellow-50 hover:bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20"
                        : "text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/50"
                    )}
                    title={t("knowledgeBase.title")}
                  >
                    <Layers className="w-4 h-4" />
                    <span className="hidden xl:inline ml-2">{t("knowledgeBase.title")}</span>
                    {useRAG && selectedDocs.length > 0 && (
                      <span className="ml-1 bg-yellow-400 text-yellow-900 text-xs font-bold px-1.5 py-0.5 rounded-full">{selectedDocs.length}</span>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle>{t("knowledgeBase.title")}</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6 space-y-6">
                    <div className="flex items-center justify-between p-4 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg border border-yellow-200 dark:border-yellow-700/50">
                      <div>
                        <h4 className="font-bold text-sm">{t("knowledgeBase.useDocuments")}</h4>
                        <p className="text-xs text-gray-500">{t("knowledgeBase.useDocumentsDesc")}</p>
                      </div>
                      <Switch checked={useRAG} onCheckedChange={setUseRAG} />
                    </div>

                    {useRAG && (
                      <div className="border rounded-lg p-4 animate-in fade-in slide-in-from-top-2">
                        <h4 className="text-sm font-semibold mb-3">{t("knowledgeBase.selectAppliedDocs")}</h4>
                        {isDocsLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                        {!isDocsLoading && availableDocs.length === 0 && (
                          <p className="text-xs text-gray-400 text-center py-4">{t("knowledgeBase.noDocsAvailable")}</p>
                        )}
                        <ScrollArea className="h-40">
                          <div className="space-y-2">
                            {availableDocs.map(doc => (
                              <div key={doc.id} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`doc-navbar-${doc.id}`}
                                  checked={selectedDocs.includes(doc.id)}
                                  onCheckedChange={() => toggleDocSelection(doc.id)}
                                />
                                <label htmlFor={`doc-navbar-${doc.id}`} className="text-sm cursor-pointer truncate flex-1">
                                  {doc.title}
                                </label>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </div>
                    )}

                    <div className="border-t pt-6">
                      <KnowledgeBaseManager />
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
               <Button
                variant="ghost"
                size="sm"
                onClick={handleCheckQuiz}
                disabled={isBusy}
                className="text-blue-700 hover:bg-blue-50 dark:text-blue-300 dark:hover:bg-blue-900/20 px-2 sm:px-3 text-xs sm:text-sm whitespace-nowrap h-9"
                title={t("manualQuiz.checkAI")}
              >
                {isChecking ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Bot className="w-4 h-4" />
                )}
                <span className="hidden xl:inline ml-2">{t("manualQuiz.checkAI")}</span>
              </Button>
               <Button
                variant="ghost"
                size="sm"
                onClick={handleAutoFill}
                disabled={isBusy}
                className="text-purple-700 hover:bg-purple-50 dark:text-purple-300 dark:hover:bg-purple-900/20 px-2 sm:px-3 text-xs sm:text-sm whitespace-nowrap h-9"
                title={t("manualQuiz.autoFill")}
              >
                {isGeneratingExplanations ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Wand2 className="w-4 h-4" />
                )}
                <span className="hidden xl:inline ml-2">{t("manualQuiz.autoFill")}</span>
              </Button>
              <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleQuickAddQuestions} 
                  disabled={isBusy}
                  className="text-amber-700 hover:bg-amber-50 dark:text-amber-300 dark:hover:bg-amber-900/20 px-2 sm:px-3 text-xs sm:text-sm whitespace-nowrap h-9"
                  title={t("manualQuiz.quickAdd")}
              >
                {isGeneratingQuestions ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                <span className="hidden xl:inline ml-2">{t("manualQuiz.quickAdd")}</span>
              </Button>
        
        <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-1 hidden sm:block" />


        <Button 
          onClick={handleSave} 
          disabled={isBusy}
          size="sm"
          className="rounded-full px-3 sm:px-4 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm transition-all font-bold whitespace-nowrap h-9 text-xs sm:text-sm ml-1"
        >
          {saving ? (
            <span className="animate-pulse">{t("common.saving")}</span>
          ) : (
            (quizId ? t("manualQuiz.updateQuiz") : t("manualQuiz.saveQuiz"))
          )}
        </Button>
    </div>
    );

    return () => setActions(null);
  }, [
    variant, i18n.language, t, useRAG, selectedDocs, isDocsLoading, availableDocs, isChecking, saving, isGeneratingQuestions, isGeneratingExplanations,
    handleCheckQuiz, handleAutoFill, handleQuickAddQuestions, handleSave, onCancel, quizId, toggleDocSelection, setActions, navigate
  ]);

  const isDialog = variant === "dialog";

  return (
    <div className={cn("flex flex-col", isDialog ? "h-full" : "w-full pb-32")}>
      {/* Header - Sticky (Only for Dialog) */}
      {isDialog && (
      <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950 dark:border-slate-800 shrink-0">
        <div className="flex items-center gap-3">
          {onCancel && (
            <button 
              onClick={onCancel}
              className="p-2 hover:bg-white/50 dark:hover:bg-slate-800/50 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
          )}
          {/* Icon placeholder - can be replaced later */}
          <div className={cn("w-10 h-10 rounded-full bg-gradient-to-br flex items-center justify-center shrink-0", themeConfig.headerGradient)}>
            <themeConfig.headerIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-800 dark:text-gray-100">{quizId ? t("manualQuiz.editTitle") : t("manualQuiz.title")}</h2>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "rounded-full px-3 text-sm",
                  useRAG
                    ? "border-yellow-400 text-yellow-700 bg-yellow-50 hover:bg-yellow-100 dark:border-yellow-600 dark:text-yellow-400 dark:bg-yellow-900/20"
                    : "border-slate-200 text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400"
                )}
              >
                <Layers className="w-4 h-4" />
                <span className="hidden sm:inline ml-1">{t("knowledgeBase.title")}</span>
                {useRAG && selectedDocs.length > 0 && (
                  <span className="ml-1 bg-yellow-400 text-yellow-900 text-xs font-bold px-1.5 py-0.5 rounded-full">{selectedDocs.length}</span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
              <SheetHeader>
                <SheetTitle>{t("knowledgeBase.title")}</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-6">
                <div className="flex items-center justify-between p-4 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg border border-yellow-200 dark:border-yellow-700/50">
                  <div>
                    <h4 className="font-bold text-sm">{t("knowledgeBase.useDocuments")}</h4>
                    <p className="text-xs text-gray-500">{t("knowledgeBase.useDocumentsDesc")}</p>
                  </div>
                  <Switch checked={useRAG} onCheckedChange={setUseRAG} />
                </div>

                {useRAG && (
                  <div className="border rounded-lg p-4 animate-in fade-in slide-in-from-top-2">
                    <h4 className="text-sm font-semibold mb-3">{t("knowledgeBase.selectAppliedDocs")}</h4>
                    {isDocsLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                    {!isDocsLoading && availableDocs.length === 0 && (
                      <p className="text-xs text-gray-400 text-center py-4">{t("knowledgeBase.noDocsAvailable")}</p>
                    )}
                    <ScrollArea className="h-40">
                      <div className="space-y-2">
                        {availableDocs.map(doc => (
                          <div key={doc.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`doc-${doc.id}`}
                              checked={selectedDocs.includes(doc.id)}
                              onCheckedChange={() => toggleDocSelection(doc.id)}
                            />
                            <label htmlFor={`doc-${doc.id}`} className="text-sm cursor-pointer truncate flex-1">
                              {doc.title}
                            </label>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                )}

                <div className="border-t pt-6">
                  <KnowledgeBaseManager />
                </div>
              </div>
            </SheetContent>
          </Sheet>
          <Button
            variant="outline"
            onClick={handleCheckQuiz}
            disabled={isChecking || saving || isGeneratingQuestions}
            size="sm"
            className="rounded-full px-3 text-sm border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-300 dark:hover:bg-blue-900/20"
          >
            {isChecking ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Bot className="w-4 h-4" />
            )}
            <span className="hidden sm:inline ml-1">{t("manualQuiz.checkAI")}</span>
          </Button>
          <Button
            variant="outline"
            onClick={handleAutoFill}
            disabled={isGeneratingExplanations || saving || isGeneratingQuestions}
            size="sm"
            className="rounded-full px-3 text-sm border-purple-200 text-purple-700 hover:bg-purple-50 dark:border-purple-800 dark:text-purple-300 dark:hover:bg-purple-900/20"
          >
            {isGeneratingExplanations ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Wand2 className="w-4 h-4" />
            )}
            <span className="hidden sm:inline ml-1">{t("manualQuiz.autoFill")}</span>
          </Button>
          <Button 
          onClick={handleSave} 
          disabled={saving || isGeneratingQuestions}
          className="rounded-full px-4 text-sm"
          size="sm"
        >
          {saving ? (
            <span className="animate-pulse">{t("common.saving")}</span>
          ) : (
            t("manualQuiz.saveQuiz")
          )}
        </Button>
        </div>
      </div>
      )}

      

      {/* Content - Scrollable */}
      <div className={cn("flex-1 p-4", isDialog ? "overflow-y-auto min-h-0" : "")}>
        <div className={cn("space-y-6 mx-auto", isDialog ? "max-w-2xl" : "max-w-4xl")}>
          {!isDialog && (
        <div className="mb-6">
           <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50 tracking-tight">{quizId ? t("manualQuiz.editTitle") : t("manualQuiz.title")}</h1>
            
           </div>
        </div>
      )}


          {/* Quiz Metadata */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div>
                <Label htmlFor="title">{t("manualQuiz.quizTitle")} *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={t("manualQuiz.titlePlaceholder")}
                  className={cn(errors.title && "border-red-500")}
                  disabled={saving || isChecking}
                />
                {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
              </div>
              <div>
                <Label htmlFor="description">{t("manualQuiz.description")}</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t("manualQuiz.descriptionPlaceholder")}
                  rows={2}
                  disabled={saving || isChecking}
                />
              </div>

              <div className="flex items-center justify-between space-x-2 bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                <div className="flex flex-col space-y-1">
                  <Label htmlFor="public-mode" className="text-base font-medium">{t("manualQuiz.public")}</Label>
                  <span className="text-xs text-slate-500">{t("manualQuiz.publicDesc")}</span>
                </div>
                <Switch
                  id="public-mode"
                  checked={isPublic}
                  onCheckedChange={setIsPublic}
                />
              </div>
            </CardContent>
          </Card>

          {/* Validation Result Dialog */}
          <Dialog open={!!validationResult} onOpenChange={(open) => {
            if (!open) {
              setValidationResult(null);
              setPendingSave(false);
            }
          }}>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{t("validation.report_title")}</DialogTitle>
                <DialogDescription>
                  Review the feedback from AI for your quiz.
                </DialogDescription>
              </DialogHeader>
              
              {validationResult && (
                 <QuizValidationResult 
                    result={validationResult} 
                    questions={questions}
                 />
              )}
              
              <DialogFooter className="gap-2">
                 <Button variant="outline" onClick={() => { setValidationResult(null); setPendingSave(false); }}>
                   {pendingSave ? t("common.cancel") : t("common.close")}
                 </Button>
                 {pendingSave && (
                   <Button onClick={executeSave} disabled={saving}>
                     {saving ? (
                       <span className="animate-pulse">{t("common.saving")}</span>
                     ) : (
                       t("manualQuiz.saveQuiz")
                     )}
                   </Button>
                 )}
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Questions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{t("manualQuiz.questions")} ({questions.length})</h3>
              
            </div>

            {questions.map((q, qIndex) => (
              <Card key={qIndex} className="relative">
                <CardContent className="pt-6 space-y-4">
                  {/* Question Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <Label>{t("manualQuiz.questionLabel", { num: qIndex + 1 })}</Label>
                      <Textarea
                        value={q.question}
                        onChange={(e) => updateQuestion(qIndex, "question", e.target.value)}
                        placeholder={t("manualQuiz.questionPlaceholder")}
                        className={cn(errors[`q${qIndex}`] && "border-red-500")}
                        rows={2}
                        disabled={saving || isChecking}
                      />
                      {errors[`q${qIndex}`] && <p className="text-xs text-red-500 mt-1">{errors[`q${qIndex}`]}</p>}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeQuestion(qIndex)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                      disabled={saving || isChecking}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Image Upload */}
                  <div className="space-y-2">
                    <Label>{t("manualQuiz.image")}</Label>
                    
                    {q.image ? (
                        <div className="relative w-full max-w-sm h-48 rounded-lg overflow-hidden border border-slate-200 group">
                            <img src={q.image} alt="Question" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <label className="cursor-pointer p-2 bg-white rounded-full hover:bg-slate-100 transition-colors" title={t("manualQuiz.changeImage")}>
                                    <ImageIcon className="w-4 h-4 text-slate-700" />
                                    <input 
                                        type="file" 
                                        className="hidden" 
                                        accept="image/*"
                                        onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], qIndex)}
                                        disabled={uploadingImage === qIndex || saving || isChecking}
                                    />
                                </label>
                                <button 
                                    onClick={() => updateQuestion(qIndex, "image", null)}
                                    className="p-2 bg-white rounded-full hover:bg-red-50 text-red-500 transition-colors"
                                    title={t("manualQuiz.removeImage")}
                                    disabled={saving || isChecking}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg p-6 hover:border-blue-400 dark:hover:border-blue-400 hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-all text-center">
                            {uploadingImage === qIndex ? (
                                <div className="flex flex-col items-center gap-2 text-blue-500">
                                    <Loader2 className="w-8 h-8 animate-spin" />
                                    <span className="text-sm font-medium">{t("manualQuiz.uploading")}</span>
                                </div>
                            ) : (
                                <label className="cursor-pointer flex flex-col items-center gap-2">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                        <ImageIcon className="w-5 h-5" />
                                    </div>
                                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">{t("manualQuiz.addImage")}</span>
                                    <input 
                                        type="file" 
                                        className="hidden" 
                                        accept="image/*"
                                        onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], qIndex)}
                                    />
                                </label>
                            )}
                        </div>
                    )}
                  </div>

                  {/* Options */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label>{t("manualQuiz.options")}</Label>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                const newQuestions = [...questions];
                                newQuestions[qIndex].options = newQuestions[qIndex].options.map(() => "");
                                setQuestions(newQuestions);
                            }}
                            className="h-6 px-2 text-xs text-muted-foreground hover:text-red-500"
                            title={t("manualQuiz.clearOptions")}
                            disabled={saving || isChecking}
                        >
                            <Eraser className="w-3 h-3 mr-1" />
                            {t("manualQuiz.clear")}
                        </Button>
                    </div>
                    {q.options.map((opt, optIndex) => (
                      <div key={optIndex} className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => updateQuestion(qIndex, "correctAnswer", optIndex)}
                          className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all",
                            q.correctAnswer === optIndex
                              ? themeConfig.activeOptionColor // USE THEME CONFIG
                              : cn("border-gray-300 dark:border-slate-600 text-gray-400 dark:text-slate-400", themeConfig.hoverOptionBorder),
                            (saving || isChecking) && "opacity-50 cursor-not-allowed"
                          )}
                          title={t("manualQuiz.markCorrect")}
                          disabled={saving || isChecking}
                        >
                          {q.correctAnswer === optIndex && <Check className="w-4 h-4" />}
                        </button>
                        <Input
                          value={opt}
                          onChange={(e) => updateOption(qIndex, optIndex, e.target.value)}
                          placeholder={t("manualQuiz.optionPlaceholder", { num: optIndex + 1 })}
                          className="flex-1"
                          disabled={saving || isChecking}
                        />
                        {q.options.length > 2 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeOption(qIndex, optIndex)}
                            className="text-gray-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400"
                            disabled={saving || isChecking}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    {q.options.length < 6 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => addOption(qIndex)}
                        className="text-gray-500"
                        disabled={saving || isChecking}
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        {t("manualQuiz.addOption")}
                      </Button>
                    )}
                    {errors[`q${qIndex}opts`] && <p className="text-xs text-red-500">{errors[`q${qIndex}opts`]}</p>}
                    {errors[`q${qIndex}correct`] && <p className="text-xs text-red-500">{errors[`q${qIndex}correct`]}</p>}
                  </div>

                  {/* Explanation (Optional) */}
                  <div>
                    <Label>{t("manualQuiz.explanation")} ({t("common.optional")})</Label>
                    <Input
                      value={q.explanation || ""}
                      onChange={(e) => updateQuestion(qIndex, "explanation", e.target.value)}
                      placeholder={t("manualQuiz.explanationPlaceholder")}
                      disabled={saving || isChecking}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
            
            <Button 
              variant="outline" 
              className="w-full border-dashed border-2 py-8 text-slate-500 dark:text-slate-400 dark:border-slate-700 hover:text-primary hover:border-primary hover:bg-primary/5 dark:hover:bg-primary/10 transition-all mt-4"
              onClick={addQuestion}
              disabled={saving || isChecking}
            >
              <Plus className="w-5 h-5 mr-2" />
              {t("manualQuiz.addQuestion")}
            </Button>
          </div>
        </div>
      </div>

    </div>
  );
}

export default ManualQuizEditor;
