import axios from 'axios';
import type {
  Inventory,
  Cost,
  Sale,
  DailyReport,
  AddInventoryForm,
  AddCostForm,
  RecordSaleForm,
  DashboardStats,
} from '@/schema/types';

const api = axios.create({
  baseURL: '/api',
});

// Inventory APIs
export const inventoryAPI = {
  getAll: () => api.get<Inventory[]>('/inventory'),
  getById: (id: string) => api.get<Inventory>(`/inventory/${id}`),
  create: (data: AddInventoryForm) => api.post<Inventory>('/inventory', data),
  update: (id: string, data: Partial<Inventory>) =>
    api.put<Inventory>(`/inventory/${id}`, data),
  delete: (id: string) => api.delete(`/inventory/${id}`),
  getWithLowStock: () => api.get<Inventory[]>('/inventory/low-stock'),
};

// Costs APIs
export const costsAPI = {
  getAll: () => api.get<Cost[]>('/costs'),
  getByDate: (date: string) => api.get<Cost[]>(`/costs?date=${date}`),
  getByRange: (startDate: string, endDate: string) =>
    api.get<Cost[]>(`/costs?startDate=${startDate}&endDate=${endDate}`),
  create: (data: AddCostForm) => api.post<Cost>('/costs', data),
  delete: (id: string) => api.delete(`/costs/${id}`),
  getTotalByDate: (date: string) =>
    api.get<{ total: number }>(`/costs/total?date=${date}`),
};

// Sales APIs
export const salesAPI = {
  getAll: () => api.get<Sale[]>('/sales'),
  getByDate: (date: string) => api.get<Sale[]>(`/sales?date=${date}`),
  create: (data: RecordSaleForm) => api.post<Sale>('/sales', data),
  update: (id: string, data: RecordSaleForm) => api.put<Sale>(`/sales/${id}`, data),
  delete: (id: string) => api.delete(`/sales/${id}`),
  getTotalByDate: (date: string) =>
    api.get<{ total: number }>(`/sales/total?date=${date}`),
  getTopSellingFlavors: () => api.get('/sales/top-flavors'),
};

// Daily Reports APIs
export const reportsAPI = {
  getAll: () => api.get<DailyReport[]>('/reports'),
  getByDate: (date: string) => api.get<DailyReport>(`/reports/${date}`),
  generate: () => api.post('/reports/generate'),
};

// Dashboard APIs
export const dashboardAPI = {
  getStats: () => api.get<DashboardStats>('/dashboard'),
  getRevenueTrend: (days?: number) =>
    api.get(`/dashboard/revenue-trend?days=${days || 30}`),
  getProfitTrend: (days?: number) =>
    api.get(`/dashboard/profit-trend?days=${days || 30}`),
};

export default api;
