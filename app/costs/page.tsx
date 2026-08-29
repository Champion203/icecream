'use client';

import { useState, useEffect, useRef } from 'react';
import { Card } from 'primereact/card';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { Toast } from 'primereact/toast';
import type { Cost } from '@/schema/types';
import { costsAPI } from '@/lib/api';
import { formatCurrency, formatDate, getTodayDate } from '@/lib/utils';
import { AddCostForm } from '@/components/forms/AddCostForm';

export default function CostsPage() {
  const [costs, setCosts] = useState<Cost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const toast = useRef<Toast>(null);

  const fetchCosts = async (date?: string) => {
    try {
      const queryDate = date || (selectedDate ? selectedDate.toISOString().split('T')[0] : getTodayDate());
      const res = await costsAPI.getByDate(queryDate);
      setCosts(res.data);
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'ข้อผิดพลาด',
        detail: 'ไม่สามารถโหลดข้อมูลต้นทุน',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCosts();
  }, []);

  const totalCost = costs.reduce((sum, cost) => sum + cost.total_cost, 0);

  const costBodyTemplate = (rowData: Cost) => (
    <span className="font-semibold text-red-600">{formatCurrency(rowData.total_cost)}</span>
  );

  const dateBodyTemplate = (rowData: Cost) => (
    <span className="text-gray-600">{formatDate(rowData.purchase_date)}</span>
  );

  if (isLoading) {
    return (
      <div className="p-4 flex justify-center items-center h-screen">
        <i className="pi pi-spin pi-spinner text-4xl"></i>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <Toast ref={toast} />
      
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">บันทึกต้นทุน</h1>
        <p className="text-gray-600">วันที่ {new Date().toLocaleDateString('th-TH')}</p>
      </div>

      {/* Summary Card */}
      <Card className="mb-6 bg-gradient-to-br from-red-50 to-red-100">
        <div className="text-center">
          <i className="pi pi-exclamation-circle text-3xl text-red-600 mb-2"></i>
          <p className="text-gray-600 text-sm mb-1">ต้นทุนรวมวันนี้</p>
          <p className="text-3xl font-bold text-red-600">{formatCurrency(totalCost)}</p>
        </div>
      </Card>

      {/* Add Cost Form */}
      <Card className="mb-6">
        <h3 className="text-lg font-bold mb-4">เพิ่มต้นทุนใหม่</h3>
        <AddCostForm onSuccess={() => fetchCosts()} />
      </Card>

      {/* Costs List */}
      <Card>
        <div className="mb-4 flex gap-2 items-center">
          <h3 className="text-lg font-bold flex-1">รายการต้นทุนทั้งหมด</h3>
          <Calendar
            value={selectedDate}
            onChange={(e) => {
              setSelectedDate(e.value as Date);
              if (e.value) {
                fetchCosts((e.value as Date).toISOString().split('T')[0]);
              }
            }}
            showIcon
            dateFormat="yy/mm/dd"
          />
        </div>
        <DataTable
          value={costs}
          paginator
          rows={10}
          stripedRows
          tableStyle={{ minWidth: '50rem' }}
        >
          <Column field="inventory.name" header="ชื่อไอติม" />
          <Column field="quantity" header="จำนวน" />
          <Column field="unit_price" header="ราคาต่อหน่วย" body={(rowData) => formatCurrency(rowData.unit_price)} />
          <Column field="total_cost" header="ต้นทุนรวม" body={costBodyTemplate} />
          <Column field="purchase_date" header="วันซื้อ" body={dateBodyTemplate} />
        </DataTable>
      </Card>
    </div>
  );
}
