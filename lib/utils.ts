import type { CostCategory, Inventory } from '@/schema/types';

export const getCostCategoryLabel = (category: CostCategory): string =>
  ({
    icecream: 'ไอศกรีม',
    topping: 'ท็อปปิ้ง',
    oil: 'น้ำมัน',
    equipment: 'อุปกรณ์',
    other: 'อื่น ๆ',
  })[category];

/**
 * Format number to Thai currency format
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
  }).format(value);
};

/**
 * Format date to readable string
 */
export const formatDate = (date: string | Date): string => {
  return new Intl.DateTimeFormat('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
};

/**
 * Format time to readable string
 */
export const formatTime = (time: string): string => {
  return new Intl.DateTimeFormat('th-TH', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(new Date(`2000-01-01T${time}`));
};

/**
 * Get today's date in YYYY-MM-DD format
 */
export const getTodayDate = (): string => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

/** Get Monday-Sunday date range for the week containing the given date. */
export const getWeekRange = (date: Date = new Date()): { start: string; end: string } => {
  const current = new Date(date);
  current.setHours(12, 0, 0, 0);
  const day = current.getDay() || 7;
  const monday = new Date(current);
  monday.setDate(current.getDate() - day + 1);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const toDateKey = (value: Date) => {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const dateOfMonth = String(value.getDate()).padStart(2, '0');
    return `${year}-${month}-${dateOfMonth}`;
  };
  return { start: toDateKey(monday), end: toDateKey(sunday) };
};

/** Prefer the Thai flavor stored with an inventory item for customer-facing names. */
export const formatInventoryName = (item?: Pick<Inventory, 'name' | 'flavor'>): string => {
  if (!item) return '-';
  return item.flavor ? `ไอศกรีมทอดรส${item.flavor}` : item.name;
};

/**
 * Check if item is low stock
 */
export const isLowStock = (item: Inventory, threshold: number = 10): boolean => {
  return item.current_stock <= threshold;
};

/**
 * Calculate profit margin percentage
 */
export const calculateProfitMargin = (
  revenue: number,
  cost: number
): number => {
  if (revenue === 0) return 0;
  return ((revenue - cost) / revenue) * 100;
};

/**
 * Get stock status color
 */
export const getStockStatusColor = (
  item: Inventory
): 'success' | 'warning' | 'danger' => {
  if (item.status === 'inactive') return 'danger';
  if (item.current_stock <= 5) return 'danger';
  if (item.current_stock <= 10) return 'warning';
  return 'success';
};

/**
 * Get stock status label
 */
export const getStockStatusLabel = (item: Inventory): string => {
  if (item.status === 'inactive') return 'ไม่ใช้งาน';
  if (item.current_stock <= 5) return 'หมด/น้อย';
  if (item.current_stock <= 10) return 'น้อย';
  return `คงเหลือ ${item.current_stock}`;
};

/**
 * Validate required fields
 */
export const validateRequired = (value: unknown): boolean => {
  if (typeof value === 'string') {
    return value.trim() !== '';
  }
  if (typeof value === 'number') {
    return value > 0;
  }
  return value !== null && value !== undefined;
};

/**
 * Validate positive number
 */
export const validatePositiveNumber = (value: number): boolean => {
  return typeof value === 'number' && value > 0;
};

/**
 * Get week number
 */
export const getWeekNumber = (date: Date): number => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  const weekNumber = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return weekNumber;
};

/**
 * Get date range (start, end)
 */
export const getDateRange = (
  startDate: string,
  endDate: string
): { start: Date; end: Date } => {
  return {
    start: new Date(startDate),
    end: new Date(endDate),
  };
};
