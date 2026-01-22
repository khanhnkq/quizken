import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
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
import { Plus, Trash2, Check, X, GripVertical, Sparkles, ArrowLeft, PenLine, Image as ImageIcon, Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { uploadImage } from "@/lib/cloudinary";
import type { Question, Quiz } from "@/types/quiz";

interface ManualQuizEditorProps {
  onComplete?: (quizId: string) => void;
  onCancel?: () => void;
  variant?: "dialog" | "page";
  quizId?: string; // Optional quizId for editing mode
}

export function ManualQuizEditor({ onComplete, onCancel, variant = "dialog", quizId }: ManualQuizEditorProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

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
  const updateQuestion = useCallback((index: number, field: keyof Question, value: any) => {
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

  // Save quiz
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
            // Only update prompt if not AI generated, or let user override it. 
            // Ideally keep original prompt if AI, but here we just update metadata.
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
  }, [user, validate, questions, title, description, toast, t, onComplete, navigate]);

  const isDialog = variant === "dialog";

  return (
    <div className={cn("flex flex-col", isDialog ? "h-[500px]" : "w-full pb-20")}>
      {/* Header - Sticky (Only for Dialog) */}
      {isDialog && (
      <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-emerald-50 to-teal-50 shrink-0">
        <div className="flex items-center gap-3">
          {onCancel && (
            <button 
              onClick={onCancel}
              className="p-2 hover:bg-white/50 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
          )}
          {/* Icon placeholder - can be replaced later */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shrink-0">
            <PenLine className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-800">{quizId ? t("manualQuiz.editTitle") : t("manualQuiz.title")}</h2>
            <p className="text-xs text-gray-500">{t("manualQuiz.subtitle")}</p>
          </div>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={saving}
          className="rounded-full px-4 text-sm"
          size="sm"
        >
          {saving ? (
            <span className="animate-pulse">{t("common.saving")}</span>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-1" />
              {t("manualQuiz.saveQuiz")}
            </>
          )}
        </Button>
      </div>
      )}

      {/* Content - Scrollable */}
      <div className={cn("flex-1 p-4", isDialog ? "overflow-y-auto min-h-0" : "")}>
        <div className={cn("space-y-6 mx-auto", isDialog ? "max-w-2xl" : "max-w-4xl")}>
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
                />
              </div>

              <div className="flex items-center justify-between space-x-2 bg-slate-50 p-4 rounded-xl border border-slate-100">
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

          {/* Questions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{t("manualQuiz.questions")} ({questions.length})</h3>
              <Button variant="outline" size="sm" onClick={addQuestion}>
                <Plus className="w-4 h-4 mr-1" />
                {t("manualQuiz.addQuestion")}
              </Button>
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
                      />
                      {errors[`q${qIndex}`] && <p className="text-xs text-red-500 mt-1">{errors[`q${qIndex}`]}</p>}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeQuestion(qIndex)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
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
                                        disabled={uploadingImage === qIndex}
                                    />
                                </label>
                                <button 
                                    onClick={() => updateQuestion(qIndex, "image", null)}
                                    className="p-2 bg-white rounded-full hover:bg-red-50 text-red-500 transition-colors"
                                    title={t("manualQuiz.removeImage")}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 hover:border-blue-400 hover:bg-blue-50/30 transition-all text-center">
                            {uploadingImage === qIndex ? (
                                <div className="flex flex-col items-center gap-2 text-blue-500">
                                    <Loader2 className="w-8 h-8 animate-spin" />
                                    <span className="text-sm font-medium">{t("manualQuiz.uploading")}</span>
                                </div>
                            ) : (
                                <label className="cursor-pointer flex flex-col items-center gap-2">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                                        <ImageIcon className="w-5 h-5" />
                                    </div>
                                    <span className="text-sm font-medium text-slate-600">{t("manualQuiz.addImage")}</span>
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
                    <Label>{t("manualQuiz.options")}</Label>
                    {q.options.map((opt, optIndex) => (
                      <div key={optIndex} className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => updateQuestion(qIndex, "correctAnswer", optIndex)}
                          className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all",
                            q.correctAnswer === optIndex
                              ? "bg-green-500 border-green-500 text-white"
                              : "border-gray-300 hover:border-green-400"
                          )}
                          title={t("manualQuiz.markCorrect")}
                        >
                          {q.correctAnswer === optIndex && <Check className="w-4 h-4" />}
                        </button>
                        <Input
                          value={opt}
                          onChange={(e) => updateOption(qIndex, optIndex, e.target.value)}
                          placeholder={t("manualQuiz.optionPlaceholder", { num: optIndex + 1 })}
                          className="flex-1"
                        />
                        {q.options.length > 2 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeOption(qIndex, optIndex)}
                            className="text-gray-400 hover:text-red-500"
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
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
            
            <Button 
              variant="outline" 
              className="w-full border-dashed border-2 py-8 text-slate-500 hover:text-primary hover:border-primary hover:bg-primary/5 transition-all mt-4"
              onClick={addQuestion}
            >
              <Plus className="w-5 h-5 mr-2" />
              {t("manualQuiz.addQuestion")}
            </Button>
          </div>
        </div>
      </div>
      {/* Sticky Footer for Page Mode */}
      {!isDialog && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t z-50">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <p className="text-sm text-slate-500 hidden md:block">
              {t("manualQuiz.questionsCount", { count: questions.length })}
            </p>
            <div className="flex items-center gap-3 ml-auto">
              <Button variant="outline" onClick={onCancel} disabled={saving}>
                {t("common.cancel")}
              </Button>
              <Button 
                onClick={handleSave} 
                disabled={saving}
                className="rounded-full px-6 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 transition-all"
              >
                {saving ? (
                  <span className="animate-pulse">{t("common.saving")}</span>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    {quizId ? t("manualQuiz.updateQuiz") : t("manualQuiz.saveQuiz")}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManualQuizEditor;
