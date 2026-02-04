import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface QuizActionPanelProps {
  onAnswer: (isCorrect: boolean) => void;
  disabled: boolean;
}

// Mock Data for specific text
const MOCK_QUESTION = {
  question: "What does 'Optimization' mean in computer science?",
  options: [
    { id: 1, text: "Making code run faster or use less memory", correct: true },
    { id: 2, text: "Wait for the computer to restart", correct: false },
    { id: 3, text: "Buying a new monitor", correct: false },
    { id: 4, text: "Installing Windows 95", correct: false },
  ]
};

export const QuizActionPanel = ({ onAnswer, disabled }: QuizActionPanelProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 w-full max-w-4xl mx-auto">
      <div className="md:col-span-2 bg-slate-800/80 p-6 rounded-xl border border-slate-700 mb-4 shadow-xl backdrop-blur-md">
        <h3 className="text-xl md:text-2xl text-white font-semibold text-center">
          {MOCK_QUESTION.question}
        </h3>
      </div>
      
      {MOCK_QUESTION.options.map((opt, idx) => (
        <motion.div
          key={opt.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
        >
          <Button
            variant="outline"
            className="w-full h-16 text-lg hover:bg-indigo-600 hover:text-white hover:border-indigo-400 transition-all active:scale-95"
            onClick={() => onAnswer(opt.correct)}
            disabled={disabled}
          >
            {opt.text}
          </Button>
        </motion.div>
      ))}
    </div>
  );
};
