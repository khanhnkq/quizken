import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth'; // Assuming useAuth exists and provides user info
import { toast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

export interface UserVocabularyItem {
    id: string;
    word: string;
    metadata?: any;
    created_at: string;
}

export const useVocabulary = () => {
    const { user } = useAuth();
    const { t } = useTranslation();
    const [vocabulary, setVocabulary] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch vocabulary on mount or user change
    useEffect(() => {
        const fetchVocabulary = async () => {
            if (!user) {
                setVocabulary([]);
                setIsLoading(false);
                return;
            }

            try {
                const { data, error } = await supabase
                    .from('user_vocabulary')
                    .select('word')
                    .eq('user_id', user.id);

                if (error) {
                    console.error('Error fetching vocabulary:', error);
                    return;
                }

                if (data) {
                    setVocabulary(data.map(item => item.word));
                }
            } catch (error) {
                console.error('Unexpected error fetching vocabulary:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchVocabulary();
    }, [user]);

    const toggleWord = async (word: string) => {
        if (!user) {
            toast({
                title: t('auth.loginRequired', 'Login Required'),
                description: t('auth.loginToSave', 'Please login to save words to your notebook.'),
                variant: 'destructive',
            });
            return false;
        }

        const isSaved = vocabulary.includes(word);

        // Optimistic update
        const newVocabulary = isSaved
            ? vocabulary.filter(w => w !== word)
            : [...vocabulary, word];

        setVocabulary(newVocabulary);

        try {
            if (isSaved) {
                // Remove
                const { error } = await supabase
                    .from('user_vocabulary')
                    .delete()
                    .eq('user_id', user.id)
                    .eq('word', word);

                if (error) throw error;
            } else {
                // Add
                const { error } = await supabase
                    .from('user_vocabulary')
                    .insert({ user_id: user.id, word });

                if (error) throw error;
            }
            return true;
        } catch (error) {
            console.error('Error toggling word:', error);
            // Revert on error
            setVocabulary(vocabulary);
            toast({
                title: "Error",
                description: "Failed to update notebook. Please try again.",
                variant: "destructive"
            });
            return false;
        }
    };

    const removeWord = async (word: string) => {
        if (!user) return; // Should be guarded by UI, but safety first

        // Optimistic update
        const newVocabulary = vocabulary.filter(w => w !== word);
        setVocabulary(newVocabulary);

        try {
            const { error } = await supabase
                .from('user_vocabulary')
                .delete()
                .eq('user_id', user.id)
                .eq('word', word);

            if (error) throw error;
        } catch (error) {
            console.error('Error removing word:', error);
            setVocabulary(vocabulary); // Revert
            toast({
                title: "Error",
                description: "Failed to remove word. Please try again.",
                variant: "destructive"
            });
        }
    };

    const addWords = async (newWords: string[]) => {
        if (!user) {
            toast({
                title: t('auth.loginRequired', 'Login Required'),
                description: t('auth.loginToSave', 'Please login to save words to your notebook.'),
                variant: 'destructive',
            });
            return false;
        }

        const uniqueNewWords = newWords.filter(w => !vocabulary.includes(w));
        if (uniqueNewWords.length === 0) return true;

        const updatedVocabulary = [...vocabulary, ...uniqueNewWords];
        setVocabulary(updatedVocabulary);

        try {
            const { error } = await supabase
                .from('user_vocabulary')
                .insert(uniqueNewWords.map(word => ({ user_id: user.id, word })));

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error adding words:', error);
            setVocabulary(vocabulary);
            toast({
                title: "Error",
                description: "Failed to add words. Please try again.",
                variant: "destructive"
            });
            return false;
        }
    };

    return {
        vocabulary, // List of word strings
        isLoading,
        toggleWord,
        addWords,
        removeWord,
        isGuest: !user
    };
};
