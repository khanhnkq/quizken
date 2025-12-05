import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ExchangeItem } from '@/lib/exchangeItems';

export function useItems() {
    return useQuery({
        queryKey: ['items'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('items')
                .select('*')
                .order('price', { ascending: true });

            if (error) {
                console.error('Error fetching items:', error);
                throw error;
            }

            // Cast database response to ExchangeItem interface
            // Ensure the type matches what the UI expects
            return data as unknown as ExchangeItem[];
        },
        staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    });
}
