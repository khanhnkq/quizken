-- Migration: Fix Duplicate User Items & Enforce Uniqueness

-- 1. Clean up existing duplicates
-- Keep the oldest entry (min id or min purchased_at) for each (user_id, item_id) pair
DELETE FROM public.user_items
WHERE id NOT IN (
    SELECT id FROM (
        SELECT DISTINCT ON (user_id, item_id) id 
        FROM public.user_items 
        ORDER BY user_id, item_id, purchased_at ASC
    ) as t
);

-- 2. Add Unique Constraint
-- efficient way to ensure (user_id, item_id) is unique
ALTER TABLE public.user_items
    ADD CONSTRAINT user_items_user_id_item_id_key UNIQUE (user_id, item_id);

-- 3. Update Gacha Pull Function to Handle Duplicates (Refunds)
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
    v_refund_amount INTEGER;
BEGIN
    v_user_id := auth.uid();
    
    -- Check if banner exists and is active
    SELECT cost INTO v_cost
    FROM public.gacha_banners
    WHERE id = p_banner_id; 
    
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
        ORDER BY weight DESC
    LOOP
        v_running_weight := v_running_weight + v_pool_item.weight;
        IF v_random_weight <= v_running_weight THEN
            v_won_item_id := v_pool_item.item_id;
            EXIT;
        END IF;
    END LOOP;

    -- Get item details
    SELECT * INTO v_item FROM public.items WHERE id = v_won_item_id;

    -- CHECK DUPLICATE LOGIC
    BEGIN
        INSERT INTO public.user_items (user_id, item_id, item_type)
        VALUES (v_user_id, v_won_item_id, v_item.type);
        
        -- Log history
        INSERT INTO public.gacha_history (user_id, banner_id, item_id)
        VALUES (v_user_id, p_banner_id, v_won_item_id);

        -- Return Success (New Item)
        RETURN jsonb_build_object(
            'success', true,
            'is_new', true,
            'item', jsonb_build_object(
                'id', v_item.id,
                'name', v_item.name,
                'type', v_item.type,
                'image_url', v_item.image_url,
                'icon', v_item.icon
            ),
            'remaining_balance', v_zcoin_balance - v_cost
        );

    EXCEPTION WHEN unique_violation THEN
        -- DUPLICATE CAUGHT! REFUND TIME!
        v_refund_amount := floor(v_cost * 0.3); -- 30% Refund
        
        UPDATE public.profiles
        SET zcoin = zcoin + v_refund_amount
        WHERE id = v_user_id;

        -- Still log history? Yes, pull happened.
        INSERT INTO public.gacha_history (user_id, banner_id, item_id)
        VALUES (v_user_id, p_banner_id, v_won_item_id);

        RETURN jsonb_build_object(
            'success', true,
            'is_new', false, -- Flag for frontend
            'refund_amount', v_refund_amount,
            'message', 'Duplicate item! Refunded ' || v_refund_amount || ' ZCoins.',
            'item', jsonb_build_object(
                'id', v_item.id,
                'name', v_item.name,
                'type', v_item.type,
                'image_url', v_item.image_url,
                'icon', v_item.icon
            ),
            'remaining_balance', (v_zcoin_balance - v_cost) + v_refund_amount
        );
    END;
END;
$$;
