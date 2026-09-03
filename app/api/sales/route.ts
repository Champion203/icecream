import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import type { Sale, RecordSaleForm, RecordSalesForm } from '@/schema/types';
import { getNetRevenue, getToppingOptions } from '@/lib/sales-pricing';

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
    const body: RecordSaleForm | RecordSalesForm = await request.json();
    const isBatch = 'items' in body;
    const items = isBatch ? body.items : [body];

    const hasInvalidItem =
      items.length === 0 ||
      items.length > 50 ||
      items.some((item) => {
        const toppingNames = new Set<string>();
        const invalidToppings = (item.toppings || []).some((topping) => {
          if (toppingNames.has(topping.name)) return true;
          toppingNames.add(topping.name);
          const options = getToppingOptions(item.sales_channel || 'regular');
          return !options.some(
            (option) => option.name === topping.name && option.price === topping.price
          );
        });
        return (
          !item.inventory_id ||
          !Number.isInteger(item.quantity_sold) ||
          item.quantity_sold <= 0 ||
          !Number.isFinite(item.unit_price) ||
          item.unit_price <= 0 ||
          !['regular', 'lineman'].includes(item.sales_channel || 'regular') ||
          invalidToppings
        );
      });
    if (hasInvalidItem) {
      return NextResponse.json(
        { error: 'Missing or invalid required fields' },
        { status: 400 }
      );
    }

    const quantitiesByInventory = new Map<string, number>();
    for (const item of items) {
      quantitiesByInventory.set(
        item.inventory_id,
        (quantitiesByInventory.get(item.inventory_id) || 0) + item.quantity_sold
      );
    }
    const inventoryIds = [...quantitiesByInventory.keys()];
    const { data: inventories, error: inventoryError } = await supabaseAdmin
      .from('inventory')
      .select('id, current_stock')
      .in('id', inventoryIds)
      .eq('status', 'active');
    if (inventoryError) throw inventoryError;
    if (!inventories || inventories.length !== inventoryIds.length) {
      return NextResponse.json({ error: 'Inventory not found' }, { status: 400 });
    }

    for (const inventory of inventories) {
      const requested = quantitiesByInventory.get(inventory.id) || 0;
      if (inventory.current_stock < requested) {
        return NextResponse.json(
          {
            error: `Insufficient stock for inventory ${inventory.id}. Available: ${inventory.current_stock}`,
          },
          { status: 400 }
        );
      }
    }

    const originalStocks = new Map(
      inventories.map((inventory) => [inventory.id, inventory.current_stock])
    );
    const updatedInventoryIds: string[] = [];
    try {
      for (const inventory of inventories) {
        const requested = quantitiesByInventory.get(inventory.id) || 0;
        const { error } = await supabaseAdmin
          .from('inventory')
          .update({ current_stock: inventory.current_stock - requested })
          .eq('id', inventory.id);
        if (error) throw error;
        updatedInventoryIds.push(inventory.id);
      }

      const now = new Date();
      const saleDate = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Bangkok',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(now);
      const saleTime = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Asia/Bangkok',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }).format(now);
      const rows = items.map((item) => ({
        inventory_id: item.inventory_id,
        quantity_sold: item.quantity_sold,
        unit_price: item.unit_price,
        total_revenue: getNetRevenue(
          item.quantity_sold * item.unit_price,
          item.sales_channel || 'regular'
        ),
        toppings: item.toppings || [],
        sales_channel: item.sales_channel || 'regular',
        sale_date: saleDate,
        sale_time: saleTime,
      }));
      const { data, error } = await supabaseAdmin
        .from('sales')
        .insert(rows)
        .select('*, inventory(*)');
      if (error) throw error;

      return NextResponse.json(isBatch ? (data as Sale[]) : (data[0] as Sale), {
        status: 201,
      });
    } catch (error) {
      for (const inventoryId of updatedInventoryIds) {
        await supabaseAdmin
        .from('inventory')
          .update({ current_stock: originalStocks.get(inventoryId) })
          .eq('id', inventoryId);
      }
      throw error;
    }
  } catch (error) {
    console.error('Error creating sale:', error);
    return NextResponse.json(
      { error: 'Failed to record sale' },
      { status: 500 }
    );
  }
}
