import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { data: cost, error: costError } = await supabaseAdmin
      .from('costs')
      .select('id, inventory_id, quantity, category')
      .eq('id', id)
      .single();

    if (costError || !cost) {
      return NextResponse.json({ error: 'ไม่พบรายการต้นทุน' }, { status: 404 });
    }

    let previousStock: number | null = null;
    if (cost.category === 'icecream' && cost.inventory_id) {
      const { data: inventory, error: inventoryError } = await supabaseAdmin
        .from('inventory')
        .select('current_stock')
        .eq('id', cost.inventory_id)
        .single();
      if (inventoryError || !inventory) throw inventoryError;
      const currentStock = inventory.current_stock;
      previousStock = currentStock;
      const { error: stockError } = await supabaseAdmin
        .from('inventory')
        .update({ current_stock: Math.max(0, currentStock - cost.quantity) })
        .eq('id', cost.inventory_id);
      if (stockError) throw stockError;
    }

    const { error: deleteError } = await supabaseAdmin.from('costs').delete().eq('id', id);
    if (deleteError) {
      if (previousStock !== null && cost.inventory_id) {
        await supabaseAdmin
          .from('inventory')
          .update({ current_stock: previousStock })
          .eq('id', cost.inventory_id);
      }
      throw deleteError;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting cost:', error);
    return NextResponse.json({ error: 'ไม่สามารถลบรายการต้นทุนได้' }, { status: 500 });
  }
}
