import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";

const STORAGE_KEY = "quizken_quiz_progress";
const SYNC_DEBOUNCE_MS = 2000;

export interface QuizProgress {
    quizId: string;
    quizTitle: string;
    userAnswers: number[];
    currentQuestion: number;
    startTime: number;
    totalQuestions: number;
}

/**
 * Hook to manage in-progress quiz state persistence.
 * Allows users to navigate away and resume quizzes later.
 * Synced with Supabase for authenticated users.
 */
export function useQuizProgress() {
    const { user } = useAuth();
    const [progress, setProgress] = useState<QuizProgress | null>(null);
    const saveTimeoutRef = useRef<NodeJS.Timeout>();

    // Load progress on mount (check DB first if logged in, else LocalStorage)
    useEffect(() => {
        const loadProgress = async () => {
            try {
                // If user is logged in, try fetching from DB first
                if (user) {
                    // Anti-resurrection guard: If we just cleared, don't fetch from DB immediately
                    const lastCleared = sessionStorage.getItem("quizken_cleared_time");
                    if (lastCleared && Date.now() - parseInt(lastCleared) < 2000) {
                        return;
                    }

                    const { data, error } = await supabase
                        .from('quiz_progress')
                        .select('*')
                        .eq('user_id', user.id)
                        .order('updated_at', { ascending: false })
                        .limit(1)
                        .maybeSingle();

                    if (data && !error) {
                        const dbProgress: QuizProgress = {
                            quizId: data.quiz_id,
                            quizTitle: data.quiz_title || "Unknown Quiz",
                            userAnswers: Array.isArray(data.user_answers) ? data.user_answers as number[] : [],
                            currentQuestion: data.current_question || 0,
                            startTime: data.start_time || Date.now(),
                            totalQuestions: data.total_questions
                        };
                        setProgress(dbProgress);
                        // Also update local storage for continuity
                        localStorage.setItem(STORAGE_KEY, JSON.stringify(dbProgress));
                        return; // Found in DB, don't check local
                    }
                }

                // Fallback to Local Storage (guest or no DB data)
                const saved = localStorage.getItem(STORAGE_KEY);
                if (saved) {
                    const parsed = JSON.parse(saved) as QuizProgress;
                    const maxAge = 24 * 60 * 60 * 1000;
                    if (Date.now() - parsed.startTime < maxAge) {
                        setProgress(parsed);
                    } else {
                        localStorage.removeItem(STORAGE_KEY);
                        setProgress(null);
                    }
                } else {
                    setProgress(null);
                }
            } catch (e) {
                console.error("Error loading quiz progress:", e);
                localStorage.removeItem(STORAGE_KEY);
                setProgress(null);
            }
        };

        loadProgress();

        // Listen for custom event to sync across components
        const handleStorageChange = () => {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) setProgress(JSON.parse(saved));
            else setProgress(null);
        };

        window.addEventListener("quiz-progress-updated", handleStorageChange);
        window.addEventListener("storage", handleStorageChange);

        return () => {
            window.removeEventListener("quiz-progress-updated", handleStorageChange);
            window.removeEventListener("storage", handleStorageChange);
            // Clear pending save on unmount
            if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        };
    }, [user]);

    // Helper to dispatch update event
    const notifyUpdate = useCallback(() => {
        window.dispatchEvent(new Event("quiz-progress-updated"));
    }, []);

    // Save progress (Local + Cloud Debounced)
    const save = useCallback((data: QuizProgress) => {
        try {
            // 1. Immediate Local Save
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
            setProgress(data);
            notifyUpdate();

            // 2. Debounced Cloud Save
            if (user) {
                if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

                saveTimeoutRef.current = setTimeout(async () => {
                    const cleanAnswers = data.userAnswers;

                    const { error } = await supabase.from('quiz_progress').upsert({
                        user_id: user.id,
                        quiz_id: data.quizId,
                        quiz_title: data.quizTitle,
                        current_question: data.currentQuestion,
                        user_answers: cleanAnswers,
                        total_questions: data.totalQuestions,
                        start_time: data.startTime,
                        updated_at: new Date().toISOString()
                    }, { onConflict: 'user_id, quiz_id' });

                    if (error) console.error("Cloud sync error:", error);
                }, SYNC_DEBOUNCE_MS);
            }

        } catch (e) {
            console.error("Error saving quiz progress:", e);
        }
    }, [notifyUpdate, user]);

    // Clear progress
    const clear = useCallback(async () => {
        try {
            // Cancel any pending save to prevent resurrecting the record
            if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

            // Set anti-resurrection guard
            sessionStorage.setItem("quizken_cleared_time", Date.now().toString());

            localStorage.removeItem(STORAGE_KEY);
            setProgress(null);
            notifyUpdate();

            // If user is clearing (e.g. canceling quiz), remove from DB too
            if (user && progress?.quizId) {
                await supabase.from('quiz_progress').delete()
                    .eq('user_id', user.id)
                    .eq('quiz_id', progress.quizId);
            }

        } catch (e) {
            console.error("Error clearing quiz progress:", e);
        }
    }, [notifyUpdate, user, progress?.quizId]);

    // Update specific fields
    const update = useCallback((updates: Partial<QuizProgress>) => {
        setProgress((prev) => {
            if (!prev) return prev;
            const updated = { ...prev, ...updates };
            save(updated);
            return updated;
        });
    }, [save]);

    // Get answered count
    const getAnsweredCount = useCallback(() => {
        if (!progress) return 0;
        return progress.userAnswers.filter((a) => a !== -1).length;
    }, [progress]);

    return {
        progress,
        save,
        clear,
        update,
        getAnsweredCount,
        hasProgress: progress !== null,
    };
}

// Static functions for use outside React components
export function getQuizProgress(): QuizProgress | null {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (!saved) return null;
        const parsed = JSON.parse(saved) as QuizProgress;
        const maxAge = 24 * 60 * 60 * 1000;
        if (Date.now() - parsed.startTime < maxAge) {
            return parsed;
        }
        localStorage.removeItem(STORAGE_KEY);
        return null;
    } catch {
        return null;
    }
}

export function clearQuizProgress(): void {
    try {
        localStorage.removeItem(STORAGE_KEY);
        window.dispatchEvent(new Event("quiz-progress-updated"));
    } catch {
        // Ignore
    }
}
