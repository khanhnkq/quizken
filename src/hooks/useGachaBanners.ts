import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface GachaBanner {
  id: string;
  name: string;
  description: string;
  image_url: string;
  cost: number;
  is_active: boolean;
}

export function useGachaBanners() {
  return useQuery({
    queryKey: ['gacha-banners'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gacha_banners')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching banners:', error);
        throw error;
      }

      return data as GachaBanner[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
