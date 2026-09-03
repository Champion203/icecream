ALTER TABLE sales
  ADD COLUMN IF NOT EXISTS sales_channel VARCHAR(20) NOT NULL DEFAULT 'regular';

ALTER TABLE sales
  DROP CONSTRAINT IF EXISTS sales_sales_channel_check;

ALTER TABLE sales
  ADD CONSTRAINT sales_sales_channel_check
  CHECK (sales_channel IN ('regular', 'lineman'));