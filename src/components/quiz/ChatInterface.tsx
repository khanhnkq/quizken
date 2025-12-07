import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTranslation } from "react-i18next";
import logo from "@/assets/logo/logo.png";
import { Send, Sparkles, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { containsVietnameseBadwords } from "@/lib/vnBadwordsFilter";

interface ChatInterfaceProps {
    onComplete: (topic: string, count: string) => void;
    onCancel: () => void;
    userRemaining?: number;
    userLimit?: number;
    hasApiKey?: boolean;
}

type Step = "GREETING" | "TOPIC" | "COUNT" | "CONFIRM";

interface Message {
    id: string;
    sender: "bot" | "user";
    text: string;
    timestamp: number;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ onComplete, onCancel, userRemaining = 0, userLimit = 5, hasApiKey = false }) => {
    const { t } = useTranslation();
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [step, setStep] = useState<Step>("GREETING");
    const [isTyping, setIsTyping] = useState(false);
    const [topic, setTopic] = useState("");
    const [topicError, setTopicError] = useState("");
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
        // Determine context based on step
        if (step === "COUNT") {
            addUserMessage(t("quizGenerator.chat.questionsCount", { count: parseInt(value) }));
            setStep("CONFIRM");
            addBotMessage(t("quizGenerator.chat.confirming"));
            setTimeout(() => {
                onComplete(topic, value);
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
        <div className="flex flex-col h-[500px] w-full max-w-2xl mx-auto rounded-2xl overflow-hidden border bg-background/95 backdrop-blur-sm shadow-xl">
            {/* Header */}
            <div className="bg-primary/5 p-4 flex items-center justify-between border-b">
                <div className="flex items-center gap-3">
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
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                        {topicSuggestions.map((s) => (
                            <Button key={s} variant="secondary" size="sm" onClick={() => handleOptionSelect(s)} className="rounded-full flex-shrink-0 border bg-secondary/50 hover:bg-primary/10 hover:text-primary transition-all">
                                <Sparkles className="w-3 h-3 mr-1" /> {s}
                            </Button>
                        ))}
                    </div>
                )}

                {/* Question Count Options */}
                {!isTyping && step === "COUNT" && (
                    <div className="flex gap-2 flex-wrap justify-center pb-2">
                        {countOptions.map((n) => (
                            <Button key={n} variant="secondary" size="sm" onClick={() => handleOptionSelect(n)} className="rounded-full flex-shrink-0 border bg-secondary/50 hover:bg-primary/10 hover:text-primary transition-all">
                                <Sparkles className="w-3 h-3 mr-1" /> {n} {t("quizGenerator.ui.questions")}
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

                {/* Text Input */}
                <div className="flex items-center gap-2">
                    <Input
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
                        className={cn(
                            "rounded-full px-4 h-11 focus-visible:ring-primary/20 bg-secondary/20",
                            topicError ? "border-destructive/50 focus-visible:border-destructive" : "border-primary/20"
                        )}
                        disabled={step === "COUNT" || isTyping || step === "CONFIRM"}
                    />
                    <Button
                        onClick={handleSend}
                        disabled={!inputValue.trim() || step === "COUNT" || isTyping || step === "CONFIRM"}
                        className="rounded-full h-11 w-11 p-0 shrink-0 bg-primary shadow-lg hover:shadow-primary/25 hover:scale-105 transition-all"
                    >
                        <Send className="w-5 h-5" />
                    </Button>
                </div>
            </div>
        </div>
    );
};
