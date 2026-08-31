import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import type { RecordSaleForm, Sale } from '@/schema/types';

type RouteContext = { params: Promise<{ id: string }> };

const TOPPING_PRICES: Record<string, number> = {
  'เม็ดน้ำตาลเรนโบว์': 5,
  เยลลี่แดง: 5,
  'เวเฟอร์สติ๊กแท่ง': 5,
  คอนแฟลก: 5,
  ไมโล: 5,
  โอรีโอ: 5,
  โอวัลตินเฟลค: 5,
  มาร์ชเมลโลว์: 5,
  ช็อกชิพ: 10,
  วิปครีม: 15,
  บิสคอฟ: 15,
};

export async function PUT(request: Request, { params }: RouteContext) {
  try {
    const { id } = await params;
    const body: RecordSaleForm = await request.json();
    const invalidToppings = (body.toppings || []).some(
      (topping) => TOPPING_PRICES[topping.name] !== topping.price
    );
    if (
      !body.inventory_id ||
      body.quantity_sold <= 0 ||
      body.unit_price <= 0 ||
      invalidToppings
    ) {
      return NextResponse.json({ error: 'ข้อมูลรายการขายไม่ถูกต้อง' }, { status: 400 });
    }

    const { data: sale, error: saleError } = await supabaseAdmin
      .from('sales')
      .select('*')
      .eq('id', id)
      .single();
    if (saleError || !sale) {
      return NextResponse.json({ error: 'ไม่พบรายการขาย' }, { status: 404 });
    }

    const inventoryIds = [...new Set([sale.inventory_id, body.inventory_id])];
    const { data: inventories, error: inventoryError } = await supabaseAdmin
      .from('inventory')
      .select('id, current_stock')
      .in('id', inventoryIds);
    if (inventoryError || !inventories || inventories.length !== inventoryIds.length) {
      throw inventoryError || new Error('Inventory not found');
    }

    const originalStocks = new Map(inventories.map((item) => [item.id, item.current_stock]));
    const nextStocks = new Map(originalStocks);
    nextStocks.set(sale.inventory_id, (nextStocks.get(sale.inventory_id) || 0) + sale.quantity_sold);
    const availableStock = nextStocks.get(body.inventory_id) || 0;
    if (availableStock < body.quantity_sold) {
      return NextResponse.json(
        { error: `สินค้าในสต็อกไม่เพียงพอ มีพร้อมขาย ${availableStock} ชิ้น` },
        { status: 400 }
      );
    }
    nextStocks.set(body.inventory_id, availableStock - body.quantity_sold);

    for (const [inventoryId, currentStock] of nextStocks) {
      const { error } = await supabaseAdmin
        .from('inventory')
        .update({ current_stock: currentStock })
        .eq('id', inventoryId);
      if (error) throw error;
    }

    const { data: updatedSale, error: updateError } = await supabaseAdmin
      .from('sales')
      .update({
        inventory_id: body.inventory_id,
        quantity_sold: body.quantity_sold,
        unit_price: body.unit_price,
        total_revenue: body.quantity_sold * body.unit_price,
        toppings: body.toppings || [],
      })
      .eq('id', id)
      .select('*, inventory(*)')
      .single();

    if (updateError) {
      for (const [inventoryId, currentStock] of originalStocks) {
        await supabaseAdmin
          .from('inventory')
          .update({ current_stock: currentStock })
          .eq('id', inventoryId);
      }
      throw updateError;
    }

    return NextResponse.json(updatedSale as Sale);
  } catch (error) {
    console.error('Error updating sale:', error);
    return NextResponse.json({ error: 'ไม่สามารถแก้ไขรายการขายได้' }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  try {
    const { id } = await params;
    const { data: sale, error: saleError } = await supabaseAdmin
      .from('sales')
      .select('*')
      .eq('id', id)
      .single();
    if (saleError || !sale) {
      return NextResponse.json({ error: 'ไม่พบรายการขาย' }, { status: 404 });
    }

    const { data: inventory, error: inventoryError } = await supabaseAdmin
      .from('inventory')
      .select('current_stock')
      .eq('id', sale.inventory_id)
      .single();
    if (inventoryError || !inventory) throw inventoryError;

    const previousStock = inventory.current_stock;
    const { error: stockError } = await supabaseAdmin
      .from('inventory')
      .update({ current_stock: previousStock + sale.quantity_sold })
      .eq('id', sale.inventory_id);
    if (stockError) throw stockError;

    const { error: deleteError } = await supabaseAdmin.from('sales').delete().eq('id', id);
    if (deleteError) {
      await supabaseAdmin
        .from('inventory')
        .update({ current_stock: previousStock })
        .eq('id', sale.inventory_id);
      throw deleteError;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting sale:', error);
    return NextResponse.json({ error: 'ไม่สามารถลบรายการขายได้' }, { status: 500 });
  }
}
