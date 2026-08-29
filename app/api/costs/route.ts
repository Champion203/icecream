import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import type { Cost, AddCostForm } from '@/schema/types';

/**
 * GET /api/costs - Get all costs or filter by date
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let query = supabaseAdmin
      .from('costs')
      .select('*, inventory(*)');

    if (date) {
      query = query.eq('purchase_date', date);
    } else if (startDate && endDate) {
      query = query.gte('purchase_date', startDate).lte('purchase_date', endDate);
    }

    const { data, error } = await query.order('created_at', {
      ascending: false,
    });

    if (error) throw error;

    return NextResponse.json(data as Cost[]);
  } catch (error) {
    console.error('Error fetching costs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch costs' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/costs - Record new cost
 */
export async function POST(request: NextRequest) {
  try {
    const body: AddCostForm = await request.json();

    const isInventoryCost = body.category === 'icecream';
    if (
      !body.category ||
      (isInventoryCost && !body.inventory_id) ||
      (!isInventoryCost && !body.description?.trim()) ||
      body.quantity <= 0 ||
      body.unit_price <= 0
    ) {
      return NextResponse.json(
        { error: 'Missing or invalid required fields' },
        { status: 400 }
      );
    }

    const totalCost = body.quantity * body.unit_price;

    // Insert cost record
    const { data, error } = await supabaseAdmin
      .from('costs')
      .insert({
        inventory_id: isInventoryCost ? body.inventory_id : null,
        category: body.category,
        description: isInventoryCost ? 'ต้นทุนไอศกรีม' : body.description.trim(),
        quantity: body.quantity,
        unit_price: body.unit_price,
        total_cost: totalCost,
        purchase_date: body.purchase_date || new Date().toISOString().split('T')[0],
      })
      .select('*, inventory(*)')
      .single();

    if (error) throw error;

    // Only ice cream purchases affect inventory stock.
    if (isInventoryCost && body.inventory_id) {
      const { data: inventoryData, error: inventoryError } = await supabaseAdmin
        .from('inventory')
        .select('current_stock')
        .eq('id', body.inventory_id)
        .single();
      if (inventoryError || !inventoryData) throw inventoryError;
      const { error: stockError } = await supabaseAdmin
        .from('inventory')
        .update({ current_stock: inventoryData.current_stock + body.quantity })
        .eq('id', body.inventory_id);
      if (stockError) throw stockError;
    }

    return NextResponse.json(data as Cost, { status: 201 });
  } catch (error) {
    console.error('Error creating cost:', error);
    return NextResponse.json(
      { error: 'Failed to create cost record' },
      { status: 500 }
    );
  }
}
