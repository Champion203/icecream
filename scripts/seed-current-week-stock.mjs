import nextEnv from '@next/env';
import { createClient } from '@supabase/supabase-js';

const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd());

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceRoleKey) throw new Error('ไม่พบ Supabase environment variables');

const supabase = createClient(url, serviceRoleKey);
const products = [
  { code: 'i01', name: 'ช็อกโกแลต ไอศกรีมทอดขนาด 3.5 นิ้ว', flavor: 'ช็อกโกแลต', quantity: 50 },
  { code: 'i02', name: 'ชิพ (ช็อกชิพ) ไอศกรีมทอดขนาด 3.5 นิ้ว', flavor: 'ช็อกโกแลตชิพ', quantity: 50 },
  { code: 'i03', name: 'วนิลา ไอศกรีมทอดขนาด 3.5 นิ้ว', flavor: 'วนิลา', quantity: 50 },
  { code: 'i04', name: 'มะนาว ไอศกรีมทอดขนาด 3.5 นิ้ว', flavor: 'มะนาว', quantity: 20 },
  { code: 'i05', name: 'สตรอเบอร์รี่ ไอศกรีมทอดขนาด 3.5 นิ้ว', flavor: 'สตรอเบอร์รี่', quantity: 20 },
  { code: 'i06', name: 'คุกกี้ & ครีม ไอศกรีมทอดขนาด 3.5 นิ้ว', flavor: 'คุกกี้แอนด์ครีม', quantity: 20 },
  { code: 'i09', name: 'ชาเขียว ไอศกรีมทอดขนาด 3.5 นิ้ว', flavor: 'ชาเขียว', quantity: 20 },
  { code: 'i13', name: 'เรนโบว์ ไอศกรีมทอดขนาด 3.5 นิ้ว', flavor: 'เรนโบว์', quantity: 20 },
];

const expectedQuantity = products.reduce((sum, item) => sum + item.quantity, 0);
const expectedCost = expectedQuantity * 13;
if (expectedQuantity !== 250 || expectedCost !== 3250) {
  throw new Error('ยอดรวมจากข้อมูลตั้งต้นไม่ตรงกับเอกสาร');
}

const today = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Bangkok' }));
const day = today.getDay() || 7;
const monday = new Date(today);
monday.setDate(today.getDate() - day + 1);
const sunday = new Date(monday);
sunday.setDate(monday.getDate() + 6);
const toDateKey = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
const startDate = toDateKey(monday);
const endDate = toDateKey(sunday);
const purchaseDate = toDateKey(today);

// Clear dependent tables first so the database contains only this document.
for (const table of ['daily_reports', 'sales', 'costs', 'inventory']) {
  const { error } = await supabase.from(table).delete().not('id', 'is', null);
  if (error) throw new Error(`ล้างตาราง ${table} ไม่สำเร็จ: ${error.message}`);
}

const seededProducts = [];
for (const product of products) {
  const values = {
    name: product.name,
    flavor: product.flavor,
    unit_cost: 13,
    current_stock: product.quantity,
    max_stock: product.quantity,
    status: 'active',
    updated_at: new Date().toISOString(),
  };

  const response = await supabase.from('inventory').insert(values).select().single();
  if (response.error) throw response.error;
  seededProducts.push({ ...product, inventoryId: response.data.id });
}

const { error: insertCostError } = await supabase.from('costs').insert(
  seededProducts.map((product) => ({
    inventory_id: product.inventoryId,
    category: 'icecream',
    description: 'ต้นทุนไอศกรีม',
    quantity: product.quantity,
    unit_price: 13,
    total_cost: product.quantity * 13,
    purchase_date: purchaseDate,
  }))
);
if (insertCostError) throw insertCostError;

const { data: verificationCosts, error: verifyError } = await supabase
  .from('costs')
  .select('quantity,total_cost')
  .gte('purchase_date', startDate)
  .lte('purchase_date', endDate);
if (verifyError) throw verifyError;
const { data: verificationInventory, error: verifyInventoryError } = await supabase
  .from('inventory')
  .select('name,current_stock,status');
if (verifyInventoryError) throw verifyInventoryError;
const { count: salesCount, error: salesCountError } = await supabase
  .from('sales')
  .select('*', { count: 'exact', head: true });
const { count: reportsCount, error: reportsCountError } = await supabase
  .from('daily_reports')
  .select('*', { count: 'exact', head: true });
const { count: allCostsCount, error: costsCountError } = await supabase
  .from('costs')
  .select('*', { count: 'exact', head: true });
if (salesCountError || reportsCountError || costsCountError) {
  throw salesCountError || reportsCountError || costsCountError;
}

const verifiedStock = verificationInventory.reduce(
  (sum, item) => sum + Number(item.current_stock),
  0
);
const verifiedCost = verificationCosts.reduce(
  (sum, item) => sum + Number(item.total_cost),
  0
);
if (
  verificationInventory.length !== 8 ||
  verifiedStock !== expectedQuantity ||
  verificationCosts.length !== 8 ||
  verifiedCost !== expectedCost ||
  allCostsCount !== 8 ||
  salesCount !== 0 ||
  reportsCount !== 0
) {
  throw new Error('ตรวจสอบข้อมูลหลังบันทึกไม่ผ่าน');
}

console.log(
  JSON.stringify(
    {
      week: `${startDate} ถึง ${endDate}`,
      activeProducts: verificationInventory.length,
      stock: verifiedStock,
      costRows: verificationCosts.length,
      totalCost: verifiedCost,
      sales: salesCount,
      dailyReports: reportsCount,
      products: verificationInventory.map((item) => item.name),
    },
    null,
    2
  )
);
