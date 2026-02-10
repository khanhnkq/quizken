import React from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { BackgroundDecorations } from '@/components/ui/BackgroundDecorations';
import { Timer, ArrowRight, Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Question } from '@/types/quiz';

interface ActiveMatchViewProps {
    question: Question | null;
    currentQuestionIndex: number;
    totalQuestions: number;
    timerValue: number;
    timeLimit?: number; // Added to calculate progress percentage
    selectedAnswer: number | null;
    isSubmitted: boolean;
    isHost: boolean;
    phase: 'question' | 'result' | 'finished';
    onAnswer: (index: number) => void;
    onNext?: () => void;
    onSkip?: () => void;
    correctAnswer?: number;
    isCorrect?: boolean | null;
}

export const ActiveMatchView: React.FC<ActiveMatchViewProps> = ({
    question,
    currentQuestionIndex,
    totalQuestions,
    timerValue,
    timeLimit = 20, // Default to 20s if not provided
    selectedAnswer,
    isSubmitted,
    isHost,
    phase,
    onAnswer,
    onNext,
    onSkip,
    correctAnswer,
    isCorrect
}) => {
    return (
        <div className="min-h-screen bg-background relative overflow-hidden font-outfit flex flex-col items-center">
            <BackgroundDecorations density="medium" />
            
            {/* Top HUD */}
            <div className="w-full max-w-6xl px-4 py-6 z-20 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    {/* Timer Pill */}
                    <div className={cn(
                        "flex items-center gap-4 px-6 py-3 rounded-[2rem] border-4 shadow-xl backdrop-blur-xl transition-all transform hover:scale-105",
                        timerValue <= 5 
                            ? "bg-red-500 border-red-400 text-white animate-pulse shadow-red-500/50" 
                            : "bg-card/80 border-primary text-primary shadow-primary/20"
                    )}>
                        <Timer className="w-7 h-7 stroke-[3]" />
                        <span className="text-4xl font-black font-outfit tabular-nums leading-none pt-1">
                            {timerValue}
                        </span>
                    </div>

                    {/* Right Side: Question Count & Host Controls */}
                    <div className="flex items-center gap-3">
                        {isHost && (
                            <div className="flex gap-2 mr-2">
                                {phase === 'question' ? (
                                    <Button 
                                        onClick={onSkip}
                                        size="icon"
                                        variant="secondary" 
                                        className="rounded-full w-12 h-12 border-4 border-white/10 shadow-lg hover:bg-white/20"
                                        title="Skip Question"
                                    >
                                        <ArrowRight className="w-5 h-5" />
                                    </Button>
                                ) : (
                                    <Button 
                                        onClick={onNext}
                                        className="rounded-full px-6 h-12 bg-primary text-primary-foreground font-black border-4 border-primary-foreground/20 shadow-xl animate-pulse hover:scale-105 transition-transform"
                                    >
                                        NEXT <Play className="ml-2 w-4 h-4 fill-current" />
                                    </Button>
                                )}
                            </div>
                        )}

                        <div className="flex flex-col items-end px-5 py-2 rounded-[1.5rem] bg-card/50 backdrop-blur-md border border-white/10 shadow-lg">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Question</span>
                            <div className="text-xl font-black text-foreground leading-none">
                                <span className="text-2xl">{currentQuestionIndex + 1}</span>
                                <span className="text-muted-foreground/50 text-base mx-1">/</span>
                                <span className="text-lg text-muted-foreground">{totalQuestions}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Progress Bar (Timer) */}
                <div className="w-full h-3 bg-card/30 rounded-full overflow-hidden backdrop-blur-sm border border-white/5 shadow-inner mx-1">
                    <div 
                        className={cn(
                            "h-full transition-all duration-1000 linear shadow-[0_0_10px_rgba(255,255,255,0.3)] relative",
                            // Color transitions based on percentage remaining
                            (timerValue / timeLimit) > 0.5 ? "bg-gradient-to-r from-emerald-400 to-green-500" :
                            (timerValue / timeLimit) > 0.25 ? "bg-gradient-to-r from-yellow-400 to-orange-500" :
                            "bg-gradient-to-r from-red-500 to-red-600 animate-pulse"
                        )}
                        style={{ width: `${(timerValue / timeLimit) * 100}%` }}
                    >
                        <div className="absolute right-0 top-0 bottom-0 w-1 bg-white/50 shadow-sm" />
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 w-full max-w-6xl px-4 flex flex-col items-center justify-center z-20 pb-12">
                
                {/* Question */}
                <div className="mb-10 text-center animate-in zoom-in-50 slide-in-from-bottom-5 duration-500 w-full">
                    <h1 className="text-2xl md:text-5xl font-black leading-tight drop-shadow-sm max-w-5xl mx-auto text-foreground">
                        {question?.question}
                    </h1>
                </div>

                {/* Options Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 w-full">
                    {question?.options.map((option, index) => {
                        // Use prop correctAnswer if available, fallback to question object
                        const validCorrectAnswer = correctAnswer ?? question?.correctAnswer;
                        const isOptionCorrect = index === validCorrectAnswer;
                        const showAnswer = phase === 'result' || phase === 'finished'; // Allow explicit finished phase
                        
                        // Distinct colors for options (Kahoot-style but polished)
                        const colors = [
                            "bg-red-500 border-red-700 hover:bg-red-400 text-white", 
                            "bg-blue-500 border-blue-700 hover:bg-blue-400 text-white", 
                            "bg-yellow-500 border-yellow-700 hover:bg-yellow-400 text-white", 
                            "bg-green-500 border-green-700 hover:bg-green-400 text-white"
                        ];
                        const icons = ["A", "B", "C", "D"];

                        return (
                            <Button
                                key={index}
                                onClick={() => onAnswer(index)}
                                disabled={isSubmitted || showAnswer} 
                                className={cn(
                                    "h-auto min-h-[6rem] py-6 px-8 rounded-[2rem] border-b-[6px] transition-all relative overflow-hidden whitespace-normal text-left shadow-lg",
                                    // Use base colors if active, else subdued stuff
                                    !showAnswer ? colors[index % 4] : "",
                                    
                                    // Interactive states
                                    !showAnswer && "hover:-translate-y-1 hover:shadow-xl active:translate-y-[2px] active:border-b-0 active:shadow-none active:mt-[6px]",
                                    
                                    // Selected/Submitted states
                                    isSubmitted && selectedAnswer !== index && !showAnswer && "opacity-40 grayscale scale-95",
                                    isSubmitted && selectedAnswer === index && !showAnswer && "ring-4 ring-white scale-100 z-10 brightness-110",
                                    
                                    // Result States
                                    showAnswer && isOptionCorrect && "bg-green-500 border-green-700 ring-4 ring-green-300 scale-105 z-10 shadow-green-500/50 shadow-2xl text-white",
                                    showAnswer && !isOptionCorrect && selectedAnswer === index && "bg-red-500 border-red-700 opacity-100 ring-4 ring-red-300 text-white", // Wrong choice
                                    showAnswer && !isOptionCorrect && selectedAnswer !== index && "bg-muted border-muted-foreground/20 opacity-30 grayscale text-muted-foreground shadow-none border-b-2"
                                )}
                            >
                                <div className="flex items-center w-full gap-5">
                                     <div className={cn(
                                         "w-10 h-10 rounded-xl border-b-4 flex items-center justify-center font-black text-xl shrink-0 shadow-sm transition-all",
                                         showAnswer && isCorrect ? "bg-white text-green-600 border-white/50" : "bg-black/20 border-black/10 text-white/90"
                                     )}>
                                        {icons[index]}
                                    </div>
                                    <span className={cn(
                                        "text-xl md:text-2xl font-bold leading-tight break-words w-full",
                                        showAnswer && !isCorrect && selectedAnswer !== index ? "text-muted-foreground" : "text-white"
                                    )}>
                                        {option}
                                    </span>
                                </div>
                            </Button>
                        )
                    })}
                </div>
            </div>
        </div>
    );
};
