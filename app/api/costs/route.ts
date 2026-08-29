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

    let query = supabaseAdmin
      .from('costs')
      .select('*, inventory(*)');

    if (date) {
      query = query.eq('purchase_date', date);
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

    // Validation
    if (!body.inventory_id || body.quantity <= 0 || body.unit_price <= 0) {
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
        inventory_id: body.inventory_id,
        quantity: body.quantity,
        unit_price: body.unit_price,
        total_cost: totalCost,
        purchase_date: body.purchase_date || new Date().toISOString().split('T')[0],
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
      await supabaseAdmin
        .from('inventory')
        .update({
          current_stock: inventoryData.current_stock + body.quantity,
        })
        .eq('id', body.inventory_id);
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
