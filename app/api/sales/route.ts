import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import type { Sale, RecordSaleForm } from '@/schema/types';

/**
 * GET /api/sales - Get all sales or filter by date
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    let query = supabaseAdmin
      .from('sales')
      .select('*, inventory(*)');

    if (date) {
      query = query.eq('sale_date', date);
    }

    const { data, error } = await query.order('created_at', {
      ascending: false,
    });

    if (error) throw error;

    return NextResponse.json(data as Sale[]);
  } catch (error) {
    console.error('Error fetching sales:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sales' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/sales - Record new sale
 */
export async function POST(request: NextRequest) {
  try {
    const body: RecordSaleForm = await request.json();

    // Validation
    if (!body.inventory_id || body.quantity_sold <= 0 || body.unit_price <= 0) {
      return NextResponse.json(
        { error: 'Missing or invalid required fields' },
        { status: 400 }
      );
    }

    const totalRevenue = body.quantity_sold * body.unit_price;
    const now = new Date();
    const saleDate = now.toISOString().split('T')[0];
    const saleTime = now.toTimeString().split(' ')[0];

    // Insert sale record
    const { data, error } = await supabaseAdmin
      .from('sales')
      .insert({
        inventory_id: body.inventory_id,
        quantity_sold: body.quantity_sold,
        unit_price: body.unit_price,
        total_revenue: totalRevenue,
        sale_date: saleDate,
        sale_time: saleTime,
      })
      .select('*, inventory(*)')
      .single();

    if (error) throw error;

    // Update inventory stock
    const { data: inventoryData } = await supabaseAdmin
      .from('inventory')
      .select('current_stock')
      .eq('id', body.inventory_id)
      .single();

    if (inventoryData) {
      const newStock = Math.max(0, inventoryData.current_stock - body.quantity_sold);
      await supabaseAdmin
        .from('inventory')
        .update({
          current_stock: newStock,
        })
        .eq('id', body.inventory_id);
    }

    return NextResponse.json(data as Sale, { status: 201 });
  } catch (error) {
    console.error('Error creating sale:', error);
    return NextResponse.json(
      { error: 'Failed to record sale' },
      { status: 500 }
    );
  }
}
