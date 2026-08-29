'use client';

import { useState, useEffect, useRef } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import type { Inventory } from '@/schema/types';
import { inventoryAPI } from '@/lib/api';
import { InventoryCard } from '@/components/InventoryCard';
import { AddInventoryForm } from '@/components/forms/AddInventoryForm';

export default function InventoryPage() {
  const [inventory, setInventory] = useState<Inventory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const toast = useRef<Toast>(null);

  const fetchInventory = async () => {
    try {
      const res = await inventoryAPI.getAll();
      setInventory(res.data);
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'ข้อผิดพลาด',
        detail: 'ไม่สามารถโหลดข้อมูลสินค้า',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchInventory();
  }, []);

  const handleDelete = async (item: Inventory) => {
    try {
      await inventoryAPI.delete(item.id);
      toast.current?.show({
        severity: 'success',
        summary: 'สำเร็จ',
        detail: 'ลบสินค้าสำเร็จแล้ว',
      });
      fetchInventory();
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'ข้อผิดพลาด',
        detail: 'ไม่สามารถลบสินค้า',
      });
    }
  };

  const activeItems = inventory.filter((item) => item.status === 'active');
  const outOfStockItems = inventory.filter(
    (item) => item.status === 'active' && item.current_stock === 0
  );
  const lowStockItems = inventory.filter(
    (item) => item.status === 'active' && item.current_stock > 0 && item.current_stock <= 10
  );
  const readyItems = inventory.filter(
    (item) => item.status === 'active' && item.current_stock > 10
  );

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
      
      <div className="page-hero flex justify-between items-center gap-3">
        <div>
          <h1 className="text-3xl font-bold mb-2">จัดการสินค้า</h1>
          <p className="text-gray-600">รายการไอติมทั้งหมด</p>
        </div>
        <Button
          label="เพิ่มไอติมใหม่"
          icon="pi pi-plus"
          className="p-button-lg p-button-success"
          onClick={() => setShowDialog(true)}
        />
      </div>

      {/* Summary Cards */}
      <div className="inventory-stats-grid stats-grid grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="text-center">
            <i className="pi pi-list text-2xl text-blue-600 mb-2"></i>
            <p className="text-gray-600 text-sm mb-1">รายการทั้งหมด</p>
            <p className="text-2xl font-bold text-blue-600">{activeItems.length}</p>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100">
          <div className="text-center">
            <i className="pi pi-exclamation-triangle text-2xl text-yellow-600 mb-2"></i>
            <p className="text-gray-600 text-sm mb-1">เหลือน้อย</p>
            <p className="text-2xl font-bold text-yellow-600">{lowStockItems.length}</p>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100">
          <div className="text-center">
            <i className="pi pi-check-circle text-2xl text-red-600 mb-2"></i>
            <p className="text-gray-600 text-sm mb-1">หมดแล้ว</p>
            <p className="text-2xl font-bold text-red-600">{outOfStockItems.length}</p>
          </div>
        </Card>
      </div>

      {/* Out of Stock */}
      {outOfStockItems.length > 0 && (
        <Card className="mb-6 border-2 border-red-500">
          <h3 className="text-lg font-bold mb-4 text-red-600">🔴 ไอติมที่หมดแล้ว</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {outOfStockItems.map((item) => (
              <InventoryCard
                key={item.id}
                item={item}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </Card>
      )}

      {/* Low Stock */}
      {lowStockItems.length > 0 && (
        <Card className="mb-6 border-2 border-yellow-500">
          <h3 className="text-lg font-bold mb-4 text-yellow-600">⚠️ ไอติมที่เหลือน้อย</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lowStockItems.map((item) => (
              <InventoryCard
                key={item.id}
                item={item}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </Card>
      )}

      {/* Ready to sell */}
      <Card>
        <h3 className="text-lg font-bold mb-4">พร้อมจำหน่าย</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {readyItems.map((item) => (
            <InventoryCard
              key={item.id}
              item={item}
              onDelete={handleDelete}
            />
          ))}
          {readyItems.length === 0 && (
            <div className="py-8 text-center text-gray-500 col-span-full">
              <i className="pi pi-box text-3xl block mb-3" />
              ยังไม่มีสินค้าที่พร้อมจำหน่าย
            </div>
          )}
        </div>
      </Card>

      {/* Add Inventory Dialog */}
      <Dialog
        header="เพิ่มไอติมใหม่"
        visible={showDialog}
        onHide={() => setShowDialog(false)}
        modal
        style={{ width: '90vw', maxWidth: '500px' }}
      >
        <AddInventoryForm onSuccess={() => {
          setShowDialog(false);
          fetchInventory();
        }} />
      </Dialog>
    </div>
  );
}
