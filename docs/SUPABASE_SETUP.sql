-- Create tables for Deep Fried Ice Cream Shop Management System

-- 1. Inventory table
CREATE TABLE IF NOT EXISTS inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  flavor VARCHAR(255) NOT NULL,
  unit_cost DECIMAL(10, 2) NOT NULL,
  current_stock INTEGER NOT NULL DEFAULT 0,
  max_stock INTEGER NOT NULL DEFAULT 100,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 2. Costs table
CREATE TABLE IF NOT EXISTS costs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inventory_id UUID NOT NULL REFERENCES inventory(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  total_cost DECIMAL(10, 2) NOT NULL,
  purchase_date DATE NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 3. Sales table
CREATE TABLE IF NOT EXISTS sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inventory_id UUID NOT NULL REFERENCES inventory(id) ON DELETE CASCADE,
  quantity_sold INTEGER NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  total_revenue DECIMAL(10, 2) NOT NULL,
  sale_date DATE NOT NULL,
  sale_time TIME NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 4. Daily reports table
CREATE TABLE IF NOT EXISTS daily_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_date DATE NOT NULL UNIQUE,
  total_revenue DECIMAL(10, 2) NOT NULL DEFAULT 0,
  total_cost DECIMAL(10, 2) NOT NULL DEFAULT 0,
  profit DECIMAL(10, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_inventory_status ON inventory(status);
CREATE INDEX idx_inventory_current_stock ON inventory(current_stock);
CREATE INDEX idx_costs_inventory_id ON costs(inventory_id);
CREATE INDEX idx_costs_purchase_date ON costs(purchase_date);
CREATE INDEX idx_sales_inventory_id ON sales(inventory_id);
CREATE INDEX idx_sales_sale_date ON sales(sale_date);
CREATE INDEX idx_daily_reports_date ON daily_reports(report_date);

-- Enable RLS (Row Level Security) if needed
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_reports ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies (allow all for now, add auth policies later)
CREATE POLICY "Enable read access for all users" ON inventory
  FOR SELECT
  USING (true);

CREATE POLICY "Enable insert access for all users" ON inventory
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON inventory
  FOR UPDATE
  USING (true);

CREATE POLICY "Enable delete access for all users" ON inventory
  FOR DELETE
  USING (true);

CREATE POLICY "Enable read access for all users" ON costs
  FOR SELECT
  USING (true);

CREATE POLICY "Enable insert access for all users" ON costs
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Enable read access for all users" ON sales
  FOR SELECT
  USING (true);

CREATE POLICY "Enable insert access for all users" ON sales
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Enable read access for all users" ON daily_reports
  FOR SELECT
  USING (true);

CREATE POLICY "Enable insert access for all users" ON daily_reports
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON daily_reports
  FOR UPDATE
  USING (true);

-- Insert sample data (optional)
INSERT INTO inventory (name, flavor, unit_cost, max_stock, current_stock, status) VALUES
  ('Deep Fried Vanilla', 'วนิลา', 15.00, 50, 30, 'active'),
  ('Deep Fried Strawberry', 'สตรอเบอร์รี่', 18.00, 40, 25, 'active'),
  ('Deep Fried Chocolate', 'ช็อกโกแลต', 17.00, 45, 20, 'active'),
  ('Deep Fried Blueberry', 'บลูเบอร์รี่', 19.00, 35, 15, 'active'),
  ('Deep Fried Lemon', 'มะนาว', 16.00, 40, 22, 'active'),
  ('Deep Fried Coconut', 'มะพร้าว', 18.00, 35, 18, 'active'),
  ('Deep Fried Rainbow', 'เรนโบว์', 20.00, 30, 12, 'active'),
  ('Deep Fried Milk', 'นมสด', 16.00, 50, 28, 'active'),
  ('Deep Fried Chocolate Chip', 'ช็อกโกแลตชิพ', 19.00, 40, 16, 'active'),
  ('Deep Fried Choc Malt', 'ช็อกโกแลต มอลต์', 18.00, 35, 14, 'active'),
  ('Deep Fried Green Tea', 'ชาเขียว', 17.00, 40, 20, 'active'),
  ('Deep Fried Taro', 'เผือก', 18.00, 35, 17, 'active'),
  ('Deep Fried Cookies & Cream', 'คุกกี้แอนด์ครีม', 20.00, 30, 10, 'active');
