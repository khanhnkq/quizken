import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';

export interface UserItem {
    id: string;
    item_id: string;
    item_type: string;
    purchased_at: string;
}

export function useUserItems() {
    const { user } = useAuth();

    const queryClient = useQueryClient();
    const queryKey = ['userItems', user?.id];

    // Subscribe to realtime updates for the user's inventory
    useEffect(() => {
        if (!user?.id) return;

        const channel = supabase
            .channel(`user-items-${user.id}`)
            .on(
                "postgres_changes",
                {
                    event: "INSERT", // Listen for new item purchases
                    schema: "public",
                    table: "user_items",
                    filter: `user_id=eq.${user.id}`,
                },
                (payload) => {
                    console.log("⚡ [useUserItems] Inventory updated:", payload.new);
                    queryClient.invalidateQueries({ queryKey });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user?.id, queryClient]); // Removed queryKey

    return useQuery({
        queryKey,
        queryFn: async () => {
            if (!user) return [];

            const { data, error } = await supabase
                .from('user_items')
                .select('*');

            if (error) {
                console.error('Error fetching user items:', error);
                throw error;
            }

            return data as UserItem[];
        },
        enabled: !!user,
    });
}
