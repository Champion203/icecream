'use client';

import { Card } from 'primereact/card';
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';
import type { Inventory } from '@/schema/types';
import {
  formatCurrency,
  formatInventoryName,
  getStockStatusColor,
  getStockStatusLabel,
} from '@/lib/utils';

interface InventoryCardProps {
  item: Inventory;
  onEdit?: (item: Inventory) => void;
  onDelete?: (item: Inventory) => void;
}

export function InventoryCard({ item, onEdit, onDelete }: InventoryCardProps) {
  const stockStatus = getStockStatusColor(item);
  const stockLabel = getStockStatusLabel(item);

  return (
    <Card className="inventory-item-card">
      <div className="inventory-item-card__heading mb-3">
        <div>
          <h3 className="text-lg font-bold">{formatInventoryName(item)}</h3>
          <p className="text-gray-600 text-sm">รสชาติ {item.flavor}</p>
        </div>
        <div className="inventory-item-card__stock">
          <span>สถานะสต็อก</span>
          <Tag value={stockLabel} severity={stockStatus} className="text-sm" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div>
          <p className="text-gray-600 text-sm">ต้นทุน</p>
          <p className="font-semibold">{formatCurrency(item.unit_cost)}</p>
        </div>
        <div>
          <p className="text-gray-600 text-sm">คงเหลือ</p>
          <p className="font-semibold text-lg">{item.current_stock}</p>
        </div>
        <div>
          <p className="text-gray-600 text-sm">สูงสุด</p>
          <p className="font-semibold">{item.max_stock}</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full ${
              getStockStatusColor(item) === 'danger'
                ? 'bg-red-500'
                : getStockStatusColor(item) === 'warning'
                ? 'bg-yellow-500'
                : 'bg-green-500'
            }`}
            style={{
              width: `${(item.current_stock / item.max_stock) * 100}%`,
            }}
          />
        </div>
      </div>

      <div className="flex gap-2">
        {onEdit && (
          <Button
            icon="pi pi-pencil"
            label="แก้ไข"
            severity="info"
            text
            onClick={() => onEdit(item)}
            className="flex-1"
          />
        )}
        {onDelete && (
          <Button
            icon="pi pi-trash"
            label="ลบ"
            severity="danger"
            text
            onClick={() => onDelete(item)}
            className="flex-1"
          />
        )}
      </div>
    </Card>
  );
}
