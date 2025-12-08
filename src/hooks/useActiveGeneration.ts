import { useState, useEffect } from "react";
import { useGenerationPersistence } from "./useGenerationPersistence";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export function useActiveGeneration() {
    const { read, clear } = useGenerationPersistence();
    const location = useLocation();
    const [isProcessing, setIsProcessing] = useState(false);
    const [quizId, setQuizId] = useState<string | null>(null);

    useEffect(() => {
        const checkState = () => {
            // Hide if on generator page
            if (location.pathname === "/" || location.pathname === "/quiz/create") {
                setIsProcessing(false);
                setQuizId(null);
                return;
            }

            const state = read();
            const active = !!(state?.generationStatus === "processing" || state?.generationStatus === "pending");

            setIsProcessing(active);
            setQuizId(state?.quizId || null);
        };

        checkState();

        window.addEventListener("generation-storage-update", checkState);
        window.addEventListener("storage", checkState);

        // Optional polling for extra robustness
        const interval = setInterval(checkState, 2000);

        return () => {
            window.removeEventListener("generation-storage-update", checkState);
            window.removeEventListener("storage", checkState);
            clearInterval(interval);
        };
    }, [location.pathname, read]);

    const cancelGeneration = async () => {
        if (!quizId) return;

        console.log("🛑 [Global] Cancelling active generation:", quizId);

        // 1. Call backend to cancel
        try {
            await supabase.functions.invoke('generate-quiz/cancel-quiz', {
                body: { quiz_id: quizId }
            });

            // 2. Delete the record entirely
            const { error: deleteError } = await supabase
                .from('quizzes')
                .delete()
                .eq('id', quizId);

            if (deleteError) {
                console.warn("⚠️ Failed to delete cancelled quiz record:", deleteError);
            } else {
                console.log("🗑️ Cancelled quiz record deleted");
            }
        } catch (err) {
            console.error("Failed to cancel on backend:", err);
        }

        // 2. Clear local state
        clear();

        // 3. Force UI update
        setIsProcessing(false);
        setQuizId(null);
        window.dispatchEvent(new Event("generation-storage-update"));
    };

    return { isProcessing, quizId, cancelGeneration };
}
