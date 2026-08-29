-- Run once in Supabase SQL Editor for projects created with the old costs schema.
BEGIN;

ALTER TABLE costs
  ALTER COLUMN inventory_id DROP NOT NULL;

ALTER TABLE costs
  DROP CONSTRAINT IF EXISTS costs_inventory_id_fkey,
  ADD CONSTRAINT costs_inventory_id_fkey
    FOREIGN KEY (inventory_id) REFERENCES inventory(id) ON DELETE SET NULL;

ALTER TABLE costs
  ADD COLUMN IF NOT EXISTS category VARCHAR(20) NOT NULL DEFAULT 'icecream',
  ADD COLUMN IF NOT EXISTS description VARCHAR(255);

ALTER TABLE costs
  DROP CONSTRAINT IF EXISTS costs_category_check,
  ADD CONSTRAINT costs_category_check
    CHECK (category IN ('icecream', 'topping', 'oil', 'equipment', 'other'));

UPDATE costs
SET category = 'icecream',
    description = COALESCE(description, 'ต้นทุนไอศกรีม')
WHERE category IS NULL OR category = 'icecream';

COMMIT;
