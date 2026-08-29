'use client';

import { useState, useEffect, useRef } from 'react';
import { Card } from 'primereact/card';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { Toast } from 'primereact/toast';
import Swal from 'sweetalert2';
import type { Cost } from '@/schema/types';
import { costsAPI } from '@/lib/api';
import {
  formatCurrency,
  formatDate,
  formatInventoryName,
  getCostCategoryLabel,
  getWeekRange,
} from '@/lib/utils';
import { AddCostForm } from '@/components/forms/AddCostForm';

export default function CostsPage() {
  const [costs, setCosts] = useState<Cost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const toast = useRef<Toast>(null);

  const fetchCosts = async (weekDate: Date = selectedDate || new Date()) => {
    try {
      const { start, end } = getWeekRange(weekDate);
      const res = await costsAPI.getByRange(start, end);
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
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCosts();
  }, []);

  const totalCost = costs.reduce((sum, cost) => sum + cost.total_cost, 0);

  const costBodyTemplate = (rowData: Cost) => (
    <span className="font-semibold text-red-600">{formatCurrency(rowData.total_cost)}</span>
  );

  const dateBodyTemplate = (rowData: Cost) => (
    <span className="text-gray-600">{formatDate(rowData.purchase_date)}</span>
  );

  const handleDelete = async (cost: Cost) => {
    const costName =
      cost.category === 'icecream' ? formatInventoryName(cost.inventory) : cost.description || 'ค่าใช้จ่าย';
    const result = await Swal.fire({
      title: 'ลบรายการต้นทุนนี้?',
      text:
        cost.category === 'icecream'
          ? `${costName} จำนวน ${cost.quantity} ชิ้น สต็อกจะถูกปรับลดตามรายการนี้`
          : `${costName} จำนวน ${cost.quantity} หน่วย`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'ลบรายการ',
      cancelButtonText: 'ยกเลิก',
      confirmButtonColor: '#d33',
    });
    if (!result.isConfirmed) return;

    try {
      await costsAPI.delete(cost.id);
      await fetchCosts();
      toast.current?.show({
        severity: 'success',
        summary: 'ลบสำเร็จ',
        detail:
          cost.category === 'icecream'
            ? 'ลบต้นทุนและปรับสต็อกเรียบร้อยแล้ว'
            : 'ลบรายการต้นทุนเรียบร้อยแล้ว',
      });
    } catch {
      toast.current?.show({
        severity: 'error',
        summary: 'ข้อผิดพลาด',
        detail: 'ไม่สามารถลบรายการต้นทุนได้',
      });
    }
  };

  const nameBodyTemplate = (rowData: Cost) =>
    rowData.category === 'icecream'
      ? formatInventoryName(rowData.inventory)
      : rowData.description || '-';
  const categoryBodyTemplate = (rowData: Cost) => getCostCategoryLabel(rowData.category);
  const actionBodyTemplate = (rowData: Cost) => (
    <Button
      icon="pi pi-trash"
      label="ลบ"
      severity="danger"
      text
      aria-label={`ลบต้นทุน ${nameBodyTemplate(rowData)}`}
      onClick={() => handleDelete(rowData)}
    />
  );

  const weekRange = getWeekRange(selectedDate || new Date());

  if (isLoading) {
    return (
      <div className="p-4 flex justify-center items-center h-screen">
        <i className="pi pi-spin pi-spinner text-4xl"></i>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <Toast ref={toast} />
      
      <div className="page-hero">
        <h1 className="text-3xl font-bold mb-2">บันทึกต้นทุน</h1>
        <p className="text-gray-600">
          สัปดาห์วันที่ {formatDate(weekRange.start)} – {formatDate(weekRange.end)}
        </p>
      </div>

      {/* Summary Card */}
      <div className="stats-grid grid grid-cols-1 mb-6">
      <Card className="bg-gradient-to-br from-red-50 to-red-100">
        <div className="text-center">
          <i className="pi pi-exclamation-circle text-3xl text-red-600 mb-2"></i>
          <p className="text-gray-600 text-sm mb-1">ต้นทุนรวมประจำสัปดาห์</p>
          <p className="text-3xl font-bold text-red-600">{formatCurrency(totalCost)}</p>
        </div>
      </Card>
      </div>

      {/* Add Cost Form */}
      <Card className="mb-6">
        <h3 className="text-lg font-bold mb-4">เพิ่มต้นทุนใหม่</h3>
        <AddCostForm onSuccess={() => fetchCosts()} />
      </Card>

      {/* Costs List */}
      <Card>
        <div className="mb-4 flex gap-2 items-center">
          <h3 className="text-lg font-bold flex-1">รายการต้นทุนประจำสัปดาห์</h3>
          <Calendar
            value={selectedDate}
            onChange={(e) => {
              setSelectedDate((e.value as Date) || null);
              if (e.value) {
                fetchCosts(e.value as Date);
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
          emptyMessage="ยังไม่มีรายการต้นทุนในสัปดาห์นี้"
          tableStyle={{ minWidth: '50rem' }}
        >
          <Column field="category" header="หมวด" body={categoryBodyTemplate} />
          <Column header="รายการ" body={nameBodyTemplate} />
          <Column field="quantity" header="จำนวน" />
          <Column field="unit_price" header="ราคาต่อหน่วย" body={(rowData) => formatCurrency(rowData.unit_price)} />
          <Column field="total_cost" header="ต้นทุนรวม" body={costBodyTemplate} />
          <Column field="purchase_date" header="วันซื้อ" body={dateBodyTemplate} />
          <Column header="ดำเนินการ" body={actionBodyTemplate} style={{ width: '8rem' }} />
        </DataTable>
      </Card>
    </div>
  );
}
