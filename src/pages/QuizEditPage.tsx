import { useParams, useNavigate } from "react-router-dom";
import { ManualQuizEditor } from "@/components/quiz/ManualQuizEditor";
import { BackgroundDecorations } from "@/components/ui/BackgroundDecorations";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";

const QuizEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleBack = () => {
    navigate(-1);
  };

  const handleComplete = (quizId: string) => {
    navigate(`/quiz/play/${quizId}`);
  };

  if (!id) return null;

  return (
    <div className="h-screen bg-slate-50 dark:bg-slate-950 flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <BackgroundDecorations />
      </div>
      
      {/* Header - Sticky Top */}
      <div className="relative z-20 shrink-0 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-3 md:py-4 flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleBack}
            title={t('common.back')}
            className="rounded-full hover:bg-slate-200/50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
          </Button>
          <div className="flex flex-col">
             <h1 className="text-lg md:text-xl font-bold text-slate-800 dark:text-slate-100">
               {t('manualQuiz.editTitle')}
             </h1>
             <p className="text-xs text-slate-500 hidden md:block">{t('manualQuiz.editSubtitle')}</p>
          </div>
        </div>
      </div>

      {/* Main Content - Scrollable */}
      <div className="flex-1 overflow-y-auto relative z-10 scroll-smooth">
        <div className="container mx-auto px-4 py-6 md:py-8 text-center max-w-4xl pb-32">
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 dark:border-slate-800 overflow-hidden text-left">
              <ManualQuizEditor 
                  variant="page"
                  quizId={id} 
                  onComplete={handleComplete}
                  onCancel={handleBack}
              />
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizEditPage;
