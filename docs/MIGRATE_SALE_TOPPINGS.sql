-- Run once in the Supabase SQL editor before deploying this version.
ALTER TABLE sales
ADD COLUMN IF NOT EXISTS toppings JSONB NOT NULL DEFAULT '[]'::jsonb;

COMMENT ON COLUMN sales.toppings IS
  'Selected paid toppings as [{"name": string, "price": number}]';
