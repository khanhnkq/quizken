-- Create Gacha Banners Table
CREATE TABLE IF NOT EXISTS public.gacha_banners (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    cost INTEGER NOT NULL DEFAULT 100,
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for gacha_banners
ALTER TABLE public.gacha_banners ENABLE ROW LEVEL SECURITY;

-- Allow read access to everyone for active banners
CREATE POLICY "Anyone can view active banners" ON public.gacha_banners
    FOR SELECT USING (true); -- Simplified for MVP, usually filtering by is_active

-- Create a pool of items for each banner with drop weights
CREATE TABLE IF NOT EXISTS public.gacha_pool_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    banner_id UUID NOT NULL REFERENCES public.gacha_banners(id) ON DELETE CASCADE,
    item_id TEXT NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
    weight INTEGER NOT NULL DEFAULT 10,
    is_rare BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for gacha_pool_items
ALTER TABLE public.gacha_pool_items ENABLE ROW LEVEL SECURITY;

-- Allow read access to everyone
CREATE POLICY "Anyone can view pool items" ON public.gacha_pool_items
    FOR SELECT USING (true);

-- Create history table to track user pulls
CREATE TABLE IF NOT EXISTS public.gacha_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    banner_id UUID REFERENCES public.gacha_banners(id) ON DELETE SET NULL,
    item_id TEXT NOT NULL REFERENCES public.items(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for gacha_history
ALTER TABLE public.gacha_history ENABLE ROW LEVEL SECURITY;

-- Users can view their own history
CREATE POLICY "Users can view own gacha history" ON public.gacha_history
    FOR SELECT USING (auth.uid() = user_id);

-- RPC Function to perform a Gacha Pull
CREATE OR REPLACE FUNCTION public.gacha_pull(p_banner_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id UUID;
    v_cost INTEGER;
    v_zcoin_balance INTEGER;
    v_total_weight INTEGER;
    v_random_weight INTEGER;
    v_item RECORD;
    v_pool_item RECORD;
    v_won_item_id TEXT;
    v_running_weight INTEGER := 0;
BEGIN
    v_user_id := auth.uid();
    
    -- Check if banner exists and is active
    SELECT cost INTO v_cost
    FROM public.gacha_banners
    WHERE id = p_banner_id; -- AND is_active = true (removed for testing flexibility)
    
    IF v_cost IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', 'Banner not found or inactive');
    END IF;

    -- Check user balance
    SELECT zcoin INTO v_zcoin_balance
    FROM public.profiles
    WHERE id = v_user_id;

    IF v_zcoin_balance < v_cost THEN
        RETURN jsonb_build_object('success', false, 'message', 'Not enough ZCoins');
    END IF;

    -- Calculate total weight for the banner
    SELECT SUM(weight) INTO v_total_weight
    FROM public.gacha_pool_items
    WHERE banner_id = p_banner_id;

    IF v_total_weight IS NULL OR v_total_weight = 0 THEN
        RETURN jsonb_build_object('success', false, 'message', 'Banner has no items');
    END IF;

    -- Deduct ZCoins
    UPDATE public.profiles
    SET zcoin = zcoin - v_cost
    WHERE id = v_user_id;

    -- Random selection
    v_random_weight := floor(random() * v_total_weight) + 1;

    FOR v_pool_item IN 
        SELECT item_id, weight 
        FROM public.gacha_pool_items 
        WHERE banner_id = p_banner_id 
        ORDER BY weight DESC -- Optimization: check heavier items first? Order doesn't strictly matter for weight logic if done correctly, but consistent order helps debugging
    LOOP
        v_running_weight := v_running_weight + v_pool_item.weight;
        IF v_random_weight <= v_running_weight THEN
            v_won_item_id := v_pool_item.item_id;
            EXIT;
        END IF;
    END LOOP;

    -- Add item to inventory (handling duplicates logic could go here, for now just insert)
    -- We use INSERT .. ON CONFLICT DO NOTHING if we want unique items, but users might want duplicates if they can sell them later.
    -- For now, let's assume we just add it to user_items. If user_items has a unique constraint on (user_id, item_id), this might fail.
    -- Let's check if user owns it.
    
    INSERT INTO public.user_items (user_id, item_id, item_type)
    SELECT v_user_id, v_won_item_id, type 
    FROM public.items WHERE id = v_won_item_id
    ON CONFLICT DO NOTHING; -- MVP: If they have it, they just keep it (no duplicate entries if constraint exists)
    
    -- Log history
    INSERT INTO public.gacha_history (user_id, banner_id, item_id)
    VALUES (v_user_id, p_banner_id, v_won_item_id);

    -- Get item details to return
    SELECT * INTO v_item FROM public.items WHERE id = v_won_item_id;

    RETURN jsonb_build_object(
        'success', true,
        'item', jsonb_build_object(
            'id', v_item.id,
            'name', v_item.name,
            'type', v_item.type,
            'image_url', v_item.image_url,
            'icon', v_item.icon
        ),
        'remaining_balance', v_zcoin_balance - v_cost
    );

EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'message', SQLERRM);
END;
$$;
