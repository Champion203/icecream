import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import type { DashboardStats, Sale } from '@/schema/types';

/**
 * GET /api/dashboard - Get dashboard statistics for the current week
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const statType = searchParams.get('type');

    if (statType === 'all') {
      return getAllTimeStats();
    }

    return getCurrentWeekStats();
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}

async function getCurrentWeekStats() {
  const bangkokDate = new Date(
    new Date().toLocaleString('en-US', { timeZone: 'Asia/Bangkok' })
  );
  const day = bangkokDate.getDay() || 7;
  const monday = new Date(bangkokDate);
  monday.setDate(bangkokDate.getDate() - day + 1);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const toDateKey = (value: Date) => {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const date = String(value.getDate()).padStart(2, '0');
    return `${year}-${month}-${date}`;
  };
  const startDate = toDateKey(monday);
  const endDate = toDateKey(sunday);

  const { data: weekSales } = await supabaseAdmin
    .from('sales')
    .select('*')
    .gte('sale_date', startDate)
    .lte('sale_date', endDate);

  const { data: weekCosts } = await supabaseAdmin
    .from('costs')
    .select('*')
    .gte('purchase_date', startDate)
    .lte('purchase_date', endDate);

  // Get inventory
  const { data: inventory } = await supabaseAdmin
    .from('inventory')
    .select('*')
    .eq('status', 'active');

  const totalRevenue = (weekSales || []).reduce(
    (sum, sale) => sum + sale.total_revenue,
    0
  );
  const totalCost = (weekCosts || []).reduce(
    (sum, cost) => sum + cost.total_cost,
    0
  );
  const totalProfit = totalRevenue - totalCost;
  const totalItemsSold = (weekSales || []).reduce(
    (sum, sale) => sum + sale.quantity_sold,
    0
  );

  // Get low stock items
  const lowStockItems = (inventory || []).filter(
    (item) => item.current_stock <= 10
  );

  // Get top selling flavors
  const topSellingFlavors = await getTopSellingFlavors(weekSales || []);

  const stats: DashboardStats = {
    totalRevenue,
    totalCost,
    totalProfit,
    totalItemsSold,
    lowStockItems,
    topSellingFlavors,
  };

  return NextResponse.json(stats);
}

async function getAllTimeStats() {
  // Get all sales
  const { data: allSales } = await supabaseAdmin
    .from('sales')
    .select('*');

  // Get all costs
  const { data: allCosts } = await supabaseAdmin
    .from('costs')
    .select('*');

  // Get inventory
  const { data: inventory } = await supabaseAdmin
    .from('inventory')
    .select('*')
    .eq('status', 'active');

  const totalRevenue = (allSales || []).reduce(
    (sum, sale) => sum + sale.total_revenue,
    0
  );
  const totalCost = (allCosts || []).reduce(
    (sum, cost) => sum + cost.total_cost,
    0
  );
  const totalProfit = totalRevenue - totalCost;
  const totalItemsSold = (allSales || []).reduce(
    (sum, sale) => sum + sale.quantity_sold,
    0
  );

  // Get low stock items
  const lowStockItems = (inventory || []).filter(
    (item) => item.current_stock <= 10
  );

  // Get top selling flavors
  const topSellingFlavors = await getTopSellingFlavors(allSales || []);

  const stats: DashboardStats = {
    totalRevenue,
    totalCost,
    totalProfit,
    totalItemsSold,
    lowStockItems,
    topSellingFlavors,
  };

  return NextResponse.json(stats);
}

async function getTopSellingFlavors(
  sales: Sale[]
): Promise<Array<{ flavor: string; quantity: number; revenue: number }>> {
  if (sales.length === 0) return [];

  // Get all inventory
  const { data: inventory } = await supabaseAdmin
    .from('inventory')
    .select('*');

  const flavorMap = new Map<string, { quantity: number; revenue: number }>();

  sales.forEach((sale) => {
    const item = (inventory || []).find((i) => i.id === sale.inventory_id);
    if (item) {
      const existing = flavorMap.get(item.flavor) || { quantity: 0, revenue: 0 };
      flavorMap.set(item.flavor, {
        quantity: existing.quantity + sale.quantity_sold,
        revenue: existing.revenue + sale.total_revenue,
      });
    }
  });

  return Array.from(flavorMap.entries())
    .map(([flavor, data]) => ({
      flavor,
      quantity: data.quantity,
      revenue: data.revenue,
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);
}
