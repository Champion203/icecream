// Inventory Types
export interface Inventory {
  id: string;
  name: string;
  flavor: string;
  unit_cost: number;
  current_stock: number;
  max_stock: number;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

// Costs Types
export type CostCategory = 'icecream' | 'topping' | 'oil' | 'equipment' | 'other';

export interface Cost {
  id: string;
  inventory_id: string | null;
  category: CostCategory;
  description: string | null;
  quantity: number;
  unit_price: number;
  total_cost: number;
  purchase_date: string;
  created_at: string;
  inventory?: Inventory;
}

// Sales Types
export interface Sale {
  id: string;
  inventory_id: string;
  quantity_sold: number;
  unit_price: number;
  total_revenue: number;
  toppings: SaleTopping[];
  sale_date: string;
  sale_time: string;
  created_at: string;
  inventory?: Inventory;
}

// Daily Report Types
export interface DailyReport {
  id: string;
  report_date: string;
  total_revenue: number;
  total_cost: number;
  profit: number;
  created_at: string;
}

// Dashboard Stats
export interface DashboardStats {
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  totalItemsSold: number;
  lowStockItems: Inventory[];
  topSellingFlavors: Array<{
    flavor: string;
    quantity: number;
    revenue: number;
  }>;
}

// Form Types
export interface AddInventoryForm {
  name: string;
  flavor: string;
  unit_cost: number;
  max_stock: number;
}

export interface AddCostForm {
  inventory_id: string | null;
  category: CostCategory;
  description: string;
  quantity: number;
  unit_price: number;
  purchase_date: string;
}

export interface RecordSaleForm {
  inventory_id: string;
  quantity_sold: number;
  unit_price: number;
  toppings: SaleTopping[];
}

export interface RecordSalesForm {
  items: RecordSaleForm[];
}

export interface SaleTopping {
  name: string;
  price: number;
}
