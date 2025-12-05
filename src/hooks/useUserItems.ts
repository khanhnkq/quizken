import { useQuery } from '@tanstack/react-query';
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

    return useQuery({
        queryKey: ['userItems', user?.id],
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
