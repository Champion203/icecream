import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import type { DailyReport } from '@/schema/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let salesQuery = supabaseAdmin
      .from('sales')
      .select('sale_date, total_revenue');
    let costsQuery = supabaseAdmin
      .from('costs')
      .select('purchase_date, total_cost');

    if (startDate) {
      salesQuery = salesQuery.gte('sale_date', startDate);
      costsQuery = costsQuery.gte('purchase_date', startDate);
    }
    if (endDate) {
      salesQuery = salesQuery.lte('sale_date', endDate);
      costsQuery = costsQuery.lte('purchase_date', endDate);
    }

    const [salesResult, costsResult] = await Promise.all([salesQuery, costsQuery]);
    if (salesResult.error) throw salesResult.error;
    if (costsResult.error) throw costsResult.error;

    const totals = new Map<string, { revenue: number; cost: number }>();
    for (const sale of salesResult.data || []) {
      const current = totals.get(sale.sale_date) || { revenue: 0, cost: 0 };
      current.revenue += Number(sale.total_revenue) || 0;
      totals.set(sale.sale_date, current);
    }
    for (const cost of costsResult.data || []) {
      const current = totals.get(cost.purchase_date) || { revenue: 0, cost: 0 };
      current.cost += Number(cost.total_cost) || 0;
      totals.set(cost.purchase_date, current);
    }

    const reports: DailyReport[] = [...totals.entries()]
      .map(([date, total]) => ({
        id: date,
        report_date: date,
        total_revenue: total.revenue,
        total_cost: total.cost,
        profit: total.revenue - total.cost,
        created_at: `${date}T00:00:00+07:00`,
      }))
      .sort((a, b) => a.report_date.localeCompare(b.report_date));

    return NextResponse.json(reports);
  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 });
  }
}
