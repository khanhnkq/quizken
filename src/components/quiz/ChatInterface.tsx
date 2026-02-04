import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";
import logo from "@/assets/logo/logo.png";
import { Send, Sparkles, Zap, ArrowLeft, Settings2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { containsVietnameseBadwords } from "@/lib/vnBadwordsFilter";
import Mascot from "@/components/ui/Mascot";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

interface ChatInterfaceProps {
    onComplete: (topic: string, count: string, fastMode: boolean, difficulty: string) => void;
    onCancel: () => void;
    userLimit?: number;
    hasApiKey?: boolean;
    isComic?: boolean;
}

type Step = "GREETING" | "TOPIC" | "COUNT" | "CONFIRM";

interface Message {
    id: string;
    sender: "bot" | "user";
    text: string;
    timestamp: number;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
    onComplete, 
    onCancel, 
    userRemaining = 0, 
    userLimit = 5, 
    hasApiKey = false,
    isComic = false
}) => {
    const { t } = useTranslation();
    const { toast } = useToast();
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [step, setStep] = useState<Step>("GREETING");
    const [isTyping, setIsTyping] = useState(false);
    const [topic, setTopic] = useState("");
    const [topicError, setTopicError] = useState("");
    
    // New settings state
    const [fastMode, setFastMode] = useState(false);
    const [difficulty, setDifficulty] = useState<"mixed" | "easy" | "medium" | "hard">("mixed");
    const [isDifficultySelected, setIsDifficultySelected] = useState(false);

    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Validate topic input
    const validateTopic = (input: string): boolean => {
        const trimmed = input.trim();
        if (trimmed.length === 0) {
            setTopicError("");
            return false;
        }
        if (containsVietnameseBadwords(trimmed)) {
            setTopicError(t("quizGenerator.toasts.profanity"));
            return false;
        }
        if (trimmed.length < 5) {
            setTopicError(t("quizGenerator.errors.minLength"));
            return false;
        }
        if (trimmed.length > 500) {
            setTopicError(t("quizGenerator.toasts.maxLength"));
            return false;
        }
        setTopicError("");
        return true;
    };

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    // Initial Greeting
    useEffect(() => {
        addBotMessage(t("quizGenerator.chat.greeting"));
    }, []);

    const addBotMessage = (text: string, delay = 600) => {
        setIsTyping(true);
        setTimeout(() => {
            setMessages((prev) => [
                ...prev,
                { id: Date.now().toString(), sender: "bot", text, timestamp: Date.now() },
            ]);
            setIsTyping(false);
            // Auto-focus input after bot speaks
            setTimeout(() => inputRef.current?.focus(), 100);
        }, delay);
    };

    const addUserMessage = (text: string) => {
        setMessages((prev) => [
            ...prev,
            { id: Date.now().toString(), sender: "user", text, timestamp: Date.now() },
        ]);
    };

    const handleSend = () => {
        if (!inputValue.trim()) return;

        const text = inputValue.trim();
        setInputValue("");
        addUserMessage(text);

        if (step === "GREETING" || step === "TOPIC") {
            if (!validateTopic(text)) {
                addBotMessage(topicError || t("quizGenerator.errors.emptyPrompt"));
                return;
            }
            setTopic(text);
            setStep("COUNT");
            addBotMessage(t("quizGenerator.chat.askCount", { topic: text }));
        }
    };

    const handleOptionSelect = (value: string) => {
        console.log(`[ChatInterface] handleOptionSelect called. step=${step}, value=${value}, topic=${topic}`);
        // Determine context based on step
        if (step === "COUNT") {
            addUserMessage(t("quizGenerator.chat.questionsCount", { count: parseInt(value) }));
            setStep("CONFIRM");
            addBotMessage(t("quizGenerator.chat.confirming"));
            setTimeout(() => {
                onComplete(topic, value, fastMode, difficulty);
            }, 1500);
        } else if (step === "GREETING") {
            // Suggestion chips for topics
            addUserMessage(value);
            setTopic(value);
            setStep("COUNT");
            addBotMessage(t("quizGenerator.chat.askCount", { topic: value }));
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleSend();
        }
    };

    const topicSuggestions = [
        t("categories.history"),
        t("quizGenerator.chat.suggestions.python"),
        t("categories.science"),
        t("quizGenerator.chat.suggestions.marketing")
    ];

    const countOptions = ["10", "15", "20", "25", "30"];

    return (
        <div className="flex flex-col h-full w-full bg-transparent">
            {/* Header */}
            <div className="bg-primary/5 p-4 flex items-center justify-between border-b">
                <div className="flex items-center gap-3">
                    {/* Back Button */}
                    <button 
                        onClick={onCancel}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    </button>
                    <div className="relative">
                        <img src={logo} alt="Bot" className="w-10 h-10 object-contain hover:animate-bounce cursor-pointer" />
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                    </div>
                    <div>
                        <h3 className="font-bold text-sm">{t("quizGenerator.chat.botName")}</h3>
                        <p className="text-xs text-muted-foreground">{t("about.story.online")}</p>
                    </div>
                </div>
                {/* Quota Display */}
                <div className="flex items-center gap-2 px-2 py-1.5 rounded-full bg-gradient-to-r from-purple-50/80 to-indigo-50/80 border border-purple-100">
                    {hasApiKey ? (
                        <div className="flex items-center gap-1 text-xs font-bold text-emerald-600">
                            <Zap className="w-3 h-3" />
                            {t("quizGenerator.quota.unlimited")}
                        </div>
                    ) : (
                        <>
                            <Sparkles className="w-3 h-3 text-purple-500" />
                            <div className="w-12 h-1.5 bg-white/60 rounded-full overflow-hidden border border-purple-100">
                                <div
                                    className={cn(
                                        "h-full rounded-full transition-all",
                                        userRemaining === 0 ? "bg-red-400" : userRemaining === 1 ? "bg-orange-400" : "bg-gradient-to-r from-purple-400 to-indigo-500"
                                    )}
                                    style={{ width: `${Math.min(100, (userRemaining / userLimit) * 100)}%` }}
                                />
                            </div>
                            <span className="text-xs font-bold text-purple-700">{userRemaining}/{userLimit}</span>
                        </>
                    )}
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-secondary/10" ref={scrollRef}>
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={cn(
                            "flex w-full animate-in slide-in-from-bottom-2 fade-in duration-300",
                            msg.sender === "user" ? "justify-end" : "justify-start"
                        )}
                    >
                        <div
                            className={cn(
                                "max-w-[80%] px-4 py-3 rounded-2xl text-sm shadow-sm",
                                msg.sender === "user"
                                    ? "bg-primary text-primary-foreground rounded-tr-sm"
                                    : "bg-white dark:bg-zinc-800 border rounded-tl-sm"
                            )}
                        >
                            {msg.text}
                        </div>
                    </div>
                ))}

                {isTyping && (
                    <div className="flex justify-start animate-in fade-in duration-300">
                        <div className="bg-white dark:bg-zinc-800 border px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-1">
                            <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce delay-0"></span>
                            <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce delay-150"></span>
                            <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce delay-300"></span>
                        </div>
                    </div>
                )}
            </div>


            {/* Input / Interaction Area */}
            <div className="p-4 bg-background border-t space-y-3">
                {/* Suggestion Chips */}
                {!isTyping && step === "GREETING" && (
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none px-1">
                        {topicSuggestions.map((s) => (
                            <Button 
                                key={s} 
                                variant="secondary" 
                                size="sm" 
                                onClick={() => handleOptionSelect(s)} 
                                className={cn(
                                    "rounded-full flex-shrink-0 border bg-secondary/50 hover:bg-primary/10 hover:text-primary transition-all text-xs h-8",
                                    isComic && "border-2 border-black bg-yellow-400 text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-yellow-300 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                                )}
                            >
                                <Sparkles className={cn("w-3 h-3 mr-1", isComic && "text-black")} /> {s}
                            </Button>
                        ))}
                    </div>
                )}

                {/* Question Count Options */}
                {!isTyping && step === "COUNT" && (
                    <div className="flex gap-2 flex-wrap justify-center pb-2">
                        {countOptions.map((n) => (
                            <Button 
                                key={n} 
                                variant="secondary" 
                                size="sm" 
                                onClick={() => handleOptionSelect(n)} 
                                className={cn(
                                    "rounded-full flex-shrink-0 border bg-secondary/50 hover:bg-primary/10 hover:text-primary transition-all",
                                    isComic && "border-2 border-black bg-orange-400 text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-orange-300 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
                                )}
                            >
                                <Sparkles className={cn("w-3 h-3 mr-1", isComic && "text-black")} /> {n} {t("quizGenerator.ui.questions")}
                            </Button>
                        ))}
                    </div>
                )}


                {/* Validation Error Display */}
                {topicError && (step === "GREETING" || step === "TOPIC") && (
                    <div className="flex items-center gap-2 text-destructive text-sm font-medium animate-in slide-in-from-left-2 px-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="m15 9-6 6" /><path d="m9 9 6 6" /></svg>
                        <span>{topicError}</span>
                    </div>
                )}

                {/* Unified Input Bar */}
                <div className={cn(
                    "flex items-center p-1 pl-4 rounded-[2rem] border transition-all relative",
                    isComic 
                        ? "bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus-within:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
                        : "bg-secondary/20 border-primary/10 focus-within:ring-2 focus-within:ring-primary/20 focus-within:bg-background focus-within:shadow-sm",
                    topicError && "border-destructive/50"
                )}>
                    <input
                        ref={inputRef}
                        value={inputValue}
                        onChange={(e) => {
                            setInputValue(e.target.value);
                            if (step === "GREETING" || step === "TOPIC") {
                                validateTopic(e.target.value);
                            }
                        }}
                        onKeyDown={handleKeyDown}
                        placeholder={step === "COUNT" ? t("quizGenerator.chat.inputPlaceholderCount") : t("quizGenerator.chat.inputPlaceholder")}
                        className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-muted-foreground mr-2 h-10 min-w-0"
                        disabled={step === "COUNT" || isTyping || step === "CONFIRM"}
                    />

                    {/* Settings Actions (Only visible in GREETING/TOPIC) */}
                    {(step === "GREETING" || step === "TOPIC") && (
                       <div className="flex items-center gap-1 mr-1 border-r pr-2 border-border/10">
                            {/* Difficulty Selector */}
                            <Popover modal={false}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className={cn(
                                            "h-8 w-8 rounded-full transition-all",
                                            isComic && "hover:bg-yellow-100",
                                            !isComic && "hover:bg-secondary",
                                            isDifficultySelected && (isComic ? "bg-yellow-200" : "bg-primary/10 text-primary")
                                        )}
                                        title={t("quizGenerator.ui.difficulty")}
                                    >
                                        {difficulty === "easy" ? <div className="w-3 h-3 rounded-full bg-green-500 border-2 border-white shadow-sm" /> :
                                         difficulty === "medium" ? <div className="w-3 h-3 rounded-full bg-blue-500 border-2 border-white shadow-sm" /> :
                                         difficulty === "hard" ? <div className="w-3 h-3 rounded-full bg-red-500 border-2 border-white shadow-sm" /> :
                                         <Settings2 className="w-4 h-4 opacity-70" />
                                        }
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-48 p-1 rounded-xl" align="center" side="top" sideOffset={10}>
                                    <div className="grid grid-cols-1 gap-1">
                                        {[
                                            { val: "easy", label: t("quizGenerator.ui.difficultyEasy"), color: "bg-green-500" },
                                            { val: "medium", label: t("quizGenerator.ui.difficultyMedium"), color: "bg-blue-500" },
                                            { val: "hard", label: t("quizGenerator.ui.difficultyHard"), color: "bg-red-500" },
                                            { val: "mixed", label: t("quizGenerator.ui.difficultyMixed"), color: "bg-purple-500" }
                                        ].map((opt) => (
                                            <button
                                                key={opt.val}
                                                onClick={() => {
                                                    setDifficulty(opt.val as any);
                                                    setIsDifficultySelected(true);
                                                }}
                                                className={cn(
                                                    "flex items-center gap-3 p-2 rounded-lg text-xs font-bold transition-all w-full text-left",
                                                    difficulty === opt.val
                                                        ? "bg-secondary text-foreground"
                                                        : "hover:bg-secondary/50 text-muted-foreground"
                                                )}
                                            >
                                                <div className={cn("w-2.5 h-2.5 rounded-full shadow-sm", opt.color)} />
                                                <span>{opt.label}</span>
                                                {difficulty === opt.val && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-foreground/50" />}
                                            </button>
                                        ))}
                                    </div>
                                </PopoverContent>
                            </Popover>

                            {/* Fast Mode Toggle */}
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                    const newMode = !fastMode;
                                    setFastMode(newMode);
                                    toast({
                                        description: newMode ? t("quizGenerator.ui.fastModeEnabled") : t("quizGenerator.ui.fastModeDisabled"),
                                        className: isComic ? "border-2 border-black bg-yellow-100 text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-bold" : "",
                                        duration: 1500,
                                    });
                                }}
                                className={cn(
                                    "h-8 w-8 rounded-full transition-all",
                                    isComic 
                                        ? cn(fastMode ? "bg-yellow-400 text-black hover:bg-yellow-500" : "hover:bg-yellow-100 text-muted-foreground")
                                        : cn(fastMode ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "hover:bg-secondary text-muted-foreground hover:text-foreground")
                                )}
                                title={t("quizGenerator.ui.fastMode")}
                            >
                                <Zap className={cn("w-4 h-4", fastMode && "fill-current")} />
                            </Button>
                       </div>
                    )}

                    <Button
                        onClick={handleSend}
                        disabled={!inputValue.trim() || step === "COUNT" || isTyping || step === "CONFIRM"}
                        className={cn(
                            "rounded-full h-9 w-9 p-0 shrink-0 transition-all",
                            isComic
                                ? "bg-black text-white hover:bg-black/80"
                                : "bg-primary shadow-sm hover:shadow-md hover:scale-105"
                        )}
                        size="icon"
                    >
                        <Send className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
};
