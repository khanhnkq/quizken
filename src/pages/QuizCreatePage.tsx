import React from "react";
import { ManualQuizEditor } from "@/components/quiz/ManualQuizEditor";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import { BackgroundDecorations } from "@/components/ui/BackgroundDecorations";

const QuizCreatePage = () => {
  const navigate = useNavigate();

  const handleCancel = React.useCallback(() => {
    navigate('/', { replace: true });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 relative">
      <Navbar />
      <div className="fixed inset-0 z-0 pointer-events-none">
        <BackgroundDecorations />
      </div>
      
      <div className="relative z-10 pt-20 pb-10 container mx-auto px-4">
        <ManualQuizEditor 
          variant="page"
          onComplete={(quizId) => navigate(`/quiz/play/${quizId}`)}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
};

export default QuizCreatePage;
