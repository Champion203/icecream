import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import type { DashboardStats, Inventory, Sale, Cost } from '@/schema/types';

/**
 * GET /api/dashboard/stats - Get dashboard statistics for today
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const statType = searchParams.get('type');

    if (statType === 'today') {
      return getTodayStats();
    } else if (statType === 'all') {
      return getAllTimeStats();
    }

    // Default: today stats
    return getTodayStats();
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}

async function getTodayStats() {
  const today = new Date().toISOString().split('T')[0];

  // Get today's sales
  const { data: todaySales } = await supabaseAdmin
    .from('sales')
    .select('*')
    .eq('sale_date', today);

  // Get today's costs
  const { data: todayCosts } = await supabaseAdmin
    .from('costs')
    .select('*')
    .eq('purchase_date', today);

  // Get inventory
  const { data: inventory } = await supabaseAdmin
    .from('inventory')
    .select('*')
    .eq('status', 'active');

  const totalRevenue = (todaySales || []).reduce(
    (sum, sale) => sum + sale.total_revenue,
    0
  );
  const totalCost = (todayCosts || []).reduce(
    (sum, cost) => sum + cost.total_cost,
    0
  );
  const totalProfit = totalRevenue - totalCost;
  const totalItemsSold = (todaySales || []).reduce(
    (sum, sale) => sum + sale.quantity_sold,
    0
  );

  // Get low stock items
  const lowStockItems = (inventory || []).filter(
    (item) => item.current_stock <= 10
  );

  // Get top selling flavors
  const topSellingFlavors = await getTopSellingFlavors(todaySales || []);

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
