-- Create user_items table to track purchased items
CREATE TABLE IF NOT EXISTS public.user_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    item_id TEXT NOT NULL,
    item_type TEXT NOT NULL, -- 'theme', 'avatar', 'powerup'
    purchased_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS
ALTER TABLE public.user_items ENABLE ROW LEVEL SECURITY;

-- Policies
-- Policies
DROP POLICY IF EXISTS "Users can view their own items" ON public.user_items;
CREATE POLICY "Users can view their own items"
    ON public.user_items FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own items" ON public.user_items;
CREATE POLICY "Users can insert their own items"
    ON public.user_items FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Create items table to store available items and their prices
CREATE TABLE IF NOT EXISTS public.items (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price INTEGER NOT NULL CHECK (price >= 0),
    type TEXT NOT NULL, -- 'theme', 'avatar', 'powerup'
    icon TEXT,
    color TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for items (Public read-only)
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view items" ON public.items;
CREATE POLICY "Public can view items"
    ON public.items FOR SELECT
    USING (true);

-- Seed Initial Items (Upsert to allow updates)
INSERT INTO public.items (id, name, description, price, type, icon, color)
VALUES
    ('theme_neon_night', 'Neon Night', 'Biến giao diện thành phong cách Cyberpunk cực ngầu!', 500, 'theme', '🌃', 'bg-slate-900 border-purple-500'),
    ('theme_pastel_dream', 'Pastel Dream', 'Thế giới mộng mơ với màu sắc dịu nhẹ.', 500, 'theme', '🦄', 'bg-pink-50 border-pink-300'),
    ('avatar_cool_cat', 'Cool Cat', 'Avatar Mèo đeo kính râm.', 200, 'avatar', '😎', 'bg-orange-100 border-orange-300'),
    ('avatar_quiz_king', 'Quiz King', 'Vương miện cho người chiến thắng.', 1000, 'avatar', '👑', 'bg-yellow-100 border-yellow-300'),
    ('powerup_double_xp_1h', 'X2 XP (1h)', 'Nhân đôi XP trong vòng 1 giờ!', 300, 'powerup', '⚡', 'bg-blue-100 border-blue-300')
ON CONFLICT (id) DO UPDATE
SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    type = EXCLUDED.type,
    icon = EXCLUDED.icon,
    color = EXCLUDED.color;


-- Function to handle item purchase (deduct ZCoin + add item)
-- SECURE VERSION: Looks up price from items table
CREATE OR REPLACE FUNCTION public.purchase_item(
    p_item_id TEXT,
    p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id UUID;
    v_current_balance INTEGER;
    v_item_cost INTEGER;
    v_item_type TEXT;
    v_new_item_id UUID;
BEGIN
    v_user_id := auth.uid();
    
    -- Check if user exists
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- 1. Get Item Details (Validate Item Exists)
    SELECT price, type INTO v_item_cost, v_item_type
    FROM public.items
    WHERE id = p_item_id;

    IF v_item_cost IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', 'Item not found');
    END IF;

    -- 2. Get current user balance
    SELECT zcoin INTO v_current_balance
    FROM public.profiles
    WHERE id = v_user_id;

    IF v_current_balance IS NULL THEN
        RAISE EXCEPTION 'Profile not found';
    END IF;

    -- 3. Check insufficient funds
    IF v_current_balance < v_item_cost THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', 'Insufficient ZCoins'
        );
    END IF;

    -- 4. Deduct ZCoins
    UPDATE public.profiles
    SET zcoin = zcoin - v_item_cost
    WHERE id = v_user_id;

    -- 5. Add item to user inventory
    INSERT INTO public.user_items (user_id, item_id, item_type, metadata)
    VALUES (v_user_id, p_item_id, v_item_type, p_metadata)
    RETURNING id INTO v_new_item_id;

    RETURN jsonb_build_object(
        'success', true,
        'message', 'Purchase successful',
        'new_balance', v_current_balance - v_item_cost,
        'item_entry_id', v_new_item_id
    );
END;
$$;
