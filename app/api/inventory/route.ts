import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import type { Inventory, AddInventoryForm } from '@/schema/types';

/**
 * GET /api/inventory - Get all inventory items
 */
export async function GET(request: NextRequest) {
  try {
    const { data, error } = await supabaseAdmin
      .from('inventory')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(data as Inventory[]);
  } catch (error) {
    console.error('Error fetching inventory:', error);
    return NextResponse.json(
      { error: 'Failed to fetch inventory' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/inventory - Create new inventory item
 */
export async function POST(request: NextRequest) {
  try {
    const body: AddInventoryForm = await request.json();

    // Validation
    if (!body.name || !body.flavor || body.unit_cost <= 0) {
      return NextResponse.json(
        { error: 'Missing or invalid required fields' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('inventory')
      .insert({
        name: body.name,
        flavor: body.flavor,
        unit_cost: body.unit_cost,
        max_stock: body.max_stock || 100,
        current_stock: body.max_stock || 100,
        status: 'active',
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data as Inventory, { status: 201 });
  } catch (error) {
    console.error('Error creating inventory:', error);
    return NextResponse.json(
      { error: 'Failed to create inventory' },
      { status: 500 }
    );
  }
}
