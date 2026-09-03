'use client';

import { useState, useEffect } from 'react';
import { Card } from 'primereact/card';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import type { Sale } from '@/schema/types';
import { salesAPI } from '@/lib/api';
import { formatCurrency, formatInventoryName, formatTime, getTodayDate } from '@/lib/utils';
import { RecordSaleForm } from '@/components/forms/RecordSaleForm';
import { RecordSalesForm } from '@/components/forms/RecordSalesForm';
import { Toast } from 'primereact/toast';
import { useRef } from 'react';
import Swal from 'sweetalert2';

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [todayDate] = useState(getTodayDate());
  const toast = useRef<Toast>(null);

  const fetchSales = async () => {
    try {
      const res = await salesAPI.getByDate(todayDate);
      setSales(res.data);
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'ข้อผิดพลาด',
        detail: 'ไม่สามารถโหลดข้อมูลการขาย',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchSales();
  }, []);

  const totalRevenue = sales.reduce((sum, sale) => sum + sale.total_revenue, 0);
  const totalItems = sales.reduce((sum, sale) => sum + sale.quantity_sold, 0);

  const revenueBodyTemplate = (rowData: Sale) => (
    <span className="font-semibold text-green-600">{formatCurrency(rowData.total_revenue)}</span>
  );

  const timeBodyTemplate = (rowData: Sale) => (
    <span className="text-gray-600">{formatTime(rowData.sale_time)}</span>
  );
  const nameBodyTemplate = (rowData: Sale) => formatInventoryName(rowData.inventory);
  const toppingsBodyTemplate = (rowData: Sale) =>
    rowData.toppings?.length
      ? rowData.toppings.map((topping) => topping.name).join(', ')
      : '-';
  const channelBodyTemplate = (rowData: Sale) =>
    rowData.sales_channel === 'lineman' ? 'Line Man' : 'เมนูปกติ';

  const actionBodyTemplate = (rowData: Sale) => (
    <div className="flex gap-1">
      <Button
        icon="pi pi-pencil"
        label="แก้ไข"
        severity="info"
        text
        onClick={() => {
          setSelectedSale(rowData);
          setShowDialog(true);
        }}
      />
      <Button
        icon="pi pi-trash"
        label="ลบ"
        severity="danger"
        text
        onClick={() => handleDelete(rowData)}
      />
    </div>
  );

  const handleDelete = async (sale: Sale) => {
    const result = await Swal.fire({
      title: 'ลบรายการขายนี้?',
      text: `${formatInventoryName(sale.inventory)} จำนวน ${sale.quantity_sold} ชิ้น สินค้าจะถูกคืนเข้าสต็อก`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'ลบรายการ',
      cancelButtonText: 'ยกเลิก',
      confirmButtonColor: '#d33',
    });
    if (!result.isConfirmed) return;

    try {
      await salesAPI.delete(sale.id);
      await fetchSales();
      toast.current?.show({
        severity: 'success',
        summary: 'ลบสำเร็จ',
        detail: 'ลบรายการขายและคืนสินค้าเข้าสู่สต็อกแล้ว',
      });
    } catch {
      toast.current?.show({
        severity: 'error',
        summary: 'ข้อผิดพลาด',
        detail: 'ไม่สามารถลบรายการขายได้',
      });
    }
  };

  const closeEditDialog = () => {
    setShowDialog(false);
    setSelectedSale(null);
  };

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
        <h1 className="text-3xl font-bold mb-2">บันทึกการขาย</h1>
        <p className="text-gray-600">วันที่ {new Date().toLocaleDateString('th-TH')}</p>
      </div>

      {/* Summary Cards */}
      <div className="sales-stats-grid stats-grid grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-green-50 to-green-100">
          <div className="text-center">
            <i className="pi pi-money-bill text-2xl text-green-600 mb-2"></i>
            <p className="text-gray-600 text-sm mb-1">รายได้วันนี้</p>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(totalRevenue)}</p>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="text-center">
            <i className="pi pi-shopping-cart text-2xl text-blue-600 mb-2"></i>
            <p className="text-gray-600 text-sm mb-1">ขายทั้งหมด</p>
            <p className="text-2xl font-bold text-blue-600">{totalItems} ชิ้น</p>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
          <div className="text-center">
            <i className="pi pi-shopping-bag text-2xl text-purple-600 mb-2"></i>
            <p className="text-gray-600 text-sm mb-1">จำนวนรายการ</p>
            <p className="text-2xl font-bold text-purple-600">{sales.length}</p>
          </div>
        </Card>
      </div>

      {/* Add Sale Form */}
      <Card className="mb-6">
        <h3 className="text-lg font-bold mb-4">เพิ่มการขายใหม่</h3>
        <RecordSalesForm onSuccess={() => fetchSales()} />
      </Card>

      {/* Sales List */}
      <Card>
        <h3 className="text-lg font-bold mb-4">รายการขายทั้งหมด</h3>
        <DataTable
          value={sales}
          paginator
          rows={10}
          stripedRows
          emptyMessage="ยังไม่มีรายการขายในวันนี้"
          tableStyle={{ minWidth: '50rem' }}
        >
          <Column header="ชื่อไอติม" body={nameBodyTemplate} />
          <Column header="ช่องทาง" body={channelBodyTemplate} />
          <Column field="inventory.flavor" header="รสชาติ" />
          <Column header="ท็อปปิ้ง" body={toppingsBodyTemplate} />
          <Column field="quantity_sold" header="จำนวน" />
          <Column field="unit_price" header="ราคาต่อหน่วย" body={(rowData) => formatCurrency(rowData.unit_price)} />
          <Column field="total_revenue" header="รายได้" body={revenueBodyTemplate} />
          <Column field="sale_time" header="เวลา" body={timeBodyTemplate} />
          <Column header="ดำเนินการ" body={actionBodyTemplate} style={{ width: '12rem' }} />
        </DataTable>
      </Card>

      <Dialog
        header="แก้ไขรายการขาย"
        visible={showDialog}
        onHide={closeEditDialog}
        modal
        style={{ width: '90vw', maxWidth: '500px' }}
      >
        {selectedSale && (
          <RecordSaleForm
            key={selectedSale.id}
            initialData={selectedSale}
            onSuccess={async () => {
              closeEditDialog();
              await fetchSales();
            }}
          />
        )}
      </Dialog>
    </div>
  );
}
