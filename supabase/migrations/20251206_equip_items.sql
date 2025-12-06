-- Add is_equipped column to user_items
ALTER TABLE user_items 
ADD COLUMN IF NOT EXISTS is_equipped BOOLEAN DEFAULT FALSE;

-- Function to equip an item (ensures only one item of a specific type is equipped per user)
CREATE OR REPLACE FUNCTION equip_item(p_item_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_item_type TEXT;
  v_item_name TEXT;
BEGIN
  v_user_id := auth.uid();
  
  -- Get item type and name, verifying ownership
  SELECT i.type, i.name INTO v_item_type, v_item_name
  FROM items i
  JOIN user_items ui ON ui.item_id = i.id
  WHERE ui.id = p_item_id AND ui.user_id = v_user_id;

  IF v_item_type IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Item not found or not owned');
  END IF;

  -- 1. Unequip all items of this type for this user
  UPDATE user_items ui
  SET is_equipped = false
  FROM items i
  WHERE ui.item_id = i.id
  AND ui.user_id = v_user_id
  AND i.type = v_item_type;

  -- 2. Equip the specific item
  UPDATE user_items
  SET is_equipped = true
  WHERE id = p_item_id;

  RETURN jsonb_build_object('success', true, 'message', 'Equipped ' || v_item_name);
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'message', SQLERRM);
END;
$$;
