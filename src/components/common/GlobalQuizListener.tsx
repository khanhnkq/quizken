import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useGenerationPersistence } from "@/hooks/useGenerationPersistence";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useQuizStore } from "@/hooks/useQuizStore";

export const GlobalQuizListener: React.FC = () => {
    const { read } = useGenerationPersistence();
    const { toast } = useToast();
    const navigate = useNavigate();
    const location = useLocation();
    const queryClient = useQueryClient();
    const { t } = useTranslation();
    const setQuiz = useQuizStore((state) => state.setQuiz);

    const [isProcessing, setIsProcessing] = React.useState(false);

    useEffect(() => {
        // Shared logic to handle quiz completion
        const handleQuizCompletion = async (currentQuizId: string, status: string) => {
            setIsProcessing(false); // Stop loading UI
            if (status === "completed") {
                // Fetch the full quiz to save to store
                const { data: quizData } = await supabase
                    .from('quizzes')
                    .select('*')
                    .eq('id', currentQuizId)
                    .single();

                if (quizData) {
                    // Update global store
                    setQuiz(quizData as any);

                    // Clear persistence
                    localStorage.removeItem("currentQuizGeneration");
                    localStorage.removeItem("currentQuizId");

                    // Invalidate lists
                    queryClient.invalidateQueries({ queryKey: ["created-quizzes"] });
                    queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });

                    // Broadcast notification
                    const channel = new BroadcastChannel("quiz-notifications");
                    channel.postMessage({
                        type: "quiz-complete",
                        title: t('quizGenerator.success.title') || "Quiz Ready!",
                        description: t('quizGenerator.success.description', {
                            title: quizData.title,
                            count: quizData.questions?.length || 0
                        }) || "Your quiz is ready.",
                        variant: "success",
                    });
                    channel.close();

                    // Auto-redirect
                    console.log("🚀 [GlobalQuizListener] Auto-redirecting to Play Page");
                    navigate(`/quiz/play/${currentQuizId}`);

                    // Unsubscribe
                    cleanupChannel(currentQuizId);
                }
            } else if (status === "failed") {
                setIsProcessing(false);
                localStorage.removeItem("currentQuizGeneration");
                localStorage.removeItem("currentQuizId");

                toast({
                    title: t('quizGenerator.toasts.failedTitle') || "Generation Failed",
                    description: t('quizGenerator.toasts.genericError') || "Something went wrong.",
                    variant: "destructive",
                });

                // Unsubscribe
                cleanupChannel(currentQuizId);
            }
        };

        const cleanupChannel = (id: string) => {
            const channels = supabase.getChannels();
            const ch = channels.find(c => c.topic === `realtime:global-quiz-listener-${id}`);
            if (ch) supabase.removeChannel(ch);
        };

        // Function to check for active generation
        const checkActiveGeneration = async () => {
            // Skip check if on generator page (let local UI handle it)
            if (location.pathname === "/" || location.pathname === "/quiz/create") {
                console.log("[GlobalQuizListener] Skipping - on generator page");
                setIsProcessing(false);
                return;
            }

            const state = read();
            console.log("[GlobalQuizListener] checkActiveGeneration - state:", state);
            const quizId = state?.quizId;
            // Check if active: either loading is true OR status is processing/pending
            const active = !!(quizId && (state?.loading === true || state?.generationStatus === "processing" || state?.generationStatus === "pending"));

            console.log(`[GlobalQuizListener] quizId=${quizId}, active=${active}, loading=${state?.loading}, status=${state?.generationStatus}`);
            setIsProcessing(active);

            if (quizId && active) {
                // Rely solely on Realtime subscription as requested
                // Note: If the quiz finished BEFORE we subscribe, we might miss the event.
                // But we trust the Realtime connection is fast enough or the generation is long enough.
                const channelName = `global-quiz-listener-${quizId}`;
                const channels = supabase.getChannels();
                const isSubscribed = channels.find(ch => ch.topic === `realtime:${channelName}`);

                if (!isSubscribed) {
                    console.log(`📡 [GlobalQuizListener] Subscribing to ${quizId} (Pure Realtime)`);
                    subscribeToQuiz(quizId);
                }
            }
        };

        const subscribeToQuiz = (quizId: string) => {
            const channel = supabase
                .channel(`global-quiz-listener-${quizId}`)
                .on(
                    "postgres_changes",
                    {
                        event: "*", // Listen for DELETE too
                        schema: "public",
                        table: "quizzes",
                        filter: `id=eq.${quizId}`,
                    },
                    (payload) => {
                        console.log(`📡 [GlobalQuizListener] Realtime event: ${payload.eventType}`);

                        if (payload.eventType === 'DELETE') {
                            console.log("🛑 [GlobalQuizListener] Quiz deleted remotely - stopping UI");
                            setIsProcessing(false);
                            localStorage.removeItem("currentQuizGeneration");
                            localStorage.removeItem("currentQuizId");
                            // Don't show toast for delete, just stop silently or info
                            toast({
                                title: t('quizGenerator.toasts.cancelledTitle'),
                                description: t('quizGenerator.toasts.cancelledDesc'),
                                variant: "info",
                            });
                            cleanupChannel(quizId);
                            return;
                        }

                        const status = payload.new.status;
                        console.log(`📡 [GlobalQuizListener] Status update from Realtime: ${status}`);
                        handleQuizCompletion(quizId, status);
                    }
                )
                .subscribe();
        };

        // Initial check
        checkActiveGeneration();

        // Listen for local updates (from same tab)
        window.addEventListener("generation-storage-update", checkActiveGeneration);

        // Listen for cross-tab updates
        window.addEventListener("storage", checkActiveGeneration);

        // Backup Polling Interval (5s)
        // If Realtime misses the 'completed' event, we check manually
        const intervalId = setInterval(async () => {
            const state = read();
            const quizId = state?.quizId;
            const active = !!(quizId && (state?.loading === true || state?.generationStatus === "processing" || state?.generationStatus === "pending"));

            if (active && quizId) {
                console.log(`[GlobalQuizListener] Backup polling for ${quizId}...`);
                const { data, error } = await supabase
                    .from('quizzes')
                    .select('status')
                    .eq('id', quizId)
                    .maybeSingle(); // Use maybeSingle to avoid 406 errors on race conditions

                if (data && !error) {
                    // If completed/failed, handle it
                    if (data.status === 'completed' || data.status === 'failed') {
                        console.log(`✅ [GlobalQuizListener] Backup polling detected status: ${data.status}`);
                        handleQuizCompletion(quizId, data.status);
                    }
                }
                // If deleted/not found
                if (!data && !error) {
                    // Likely deleted
                    handleQuizCompletion(quizId, 'failed'); // Stop UI
                }
            }
        }, 5000); // Check every 5s

        return () => {
            clearInterval(intervalId); // Cleanup interval
            window.removeEventListener("generation-storage-update", checkActiveGeneration);
            window.removeEventListener("storage", checkActiveGeneration);

            // Cleanup Supabase channels
            // We can actively cleanup here to avoid stale listeners on route change if dependencies change
            // But usually we want them to persist?
            // If dependencies change (e.g. location), we probably should cleanup and re-sub if needed.
            const channels = supabase.getChannels();
            channels.forEach(ch => {
                if (ch.topic.startsWith('realtime:global-quiz-listener-')) {
                    supabase.removeChannel(ch);
                }
            });
        };
    }, [location.pathname, read, toast, navigate, queryClient, t, setQuiz]);

    return null;
};
