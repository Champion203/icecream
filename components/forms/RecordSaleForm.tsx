'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from 'primereact/button';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import { Toast } from 'primereact/toast';
import { useRef, useEffect, useState } from 'react';
import type { RecordSaleForm as IRecordSaleForm, Inventory } from '@/schema/types';
import { inventoryAPI, salesAPI } from '@/lib/api';

const schema = z.object({
  inventory_id: z.string().min(1, 'เลือกไอติมจำเป็น'),
  quantity_sold: z.number().positive('จำนวนต้องมากกว่า 0'),
  unit_price: z.number().positive('ราคาต้องมากกว่า 0'),
});

interface RecordSaleFormProps {
  onSuccess?: () => void;
}

export function RecordSaleForm({ onSuccess }: RecordSaleFormProps) {
  const toast = useRef<Toast>(null);
  const [inventory, setInventory] = useState<Inventory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<IRecordSaleForm>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const res = await inventoryAPI.getAll();
        setInventory(res.data.filter((item) => item.status === 'active'));
      } catch (error) {
        toast.current?.show({
          severity: 'error',
          summary: 'ข้อผิดพลาด',
          detail: 'ไม่สามารถโหลดรายการไอติม',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchInventory();
  }, []);

  const onSubmit = async (data: IRecordSaleForm) => {
    try {
      await salesAPI.create(data);
      toast.current?.show({
        severity: 'success',
        summary: 'สำเร็จ',
        detail: 'บันทึกการขายสำเร็จแล้ว',
      });
      reset();
      onSuccess?.();
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'ข้อผิดพลาด',
        detail: 'ไม่สามารถบันทึกการขาย',
      });
    }
  };

  return (
    <>
      <Toast ref={toast} />
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block mb-2 font-medium">เลือกไอติม</label>
          <Controller
            name="inventory_id"
            control={control}
            render={({ field }) => (
              <Dropdown
                {...field}
                options={inventory}
                optionLabel="name"
                optionValue="id"
                placeholder="เลือกรายการไอติม"
                className="w-full"
                disabled={isLoading}
              />
            )}
          />
          {errors.inventory_id && (
            <span className="text-red-500 text-sm">
              {errors.inventory_id.message}
            </span>
          )}
        </div>

        <div>
          <label className="block mb-2 font-medium">จำนวน</label>
          <Controller
            name="quantity_sold"
            control={control}
            render={({ field }) => (
              <InputNumber
                {...field}
                value={field.value || undefined}
                onValueChange={(e) => field.onChange(e.value)}
                className="w-full"
              />
            )}
          />
          {errors.quantity_sold && (
            <span className="text-red-500 text-sm">
              {errors.quantity_sold.message}
            </span>
          )}
        </div>

        <div>
          <label className="block mb-2 font-medium">ราคาต่อหน่วย (บาท)</label>
          <Controller
            name="unit_price"
            control={control}
            render={({ field }) => (
              <InputNumber
                {...field}
                value={field.value || undefined}
                onValueChange={(e) => field.onChange(e.value)}
                mode="currency"
                currency="THB"
                locale="th-TH"
                className="w-full"
              />
            )}
          />
          {errors.unit_price && (
            <span className="text-red-500 text-sm">
              {errors.unit_price.message}
            </span>
          )}
        </div>

        <Button
          type="submit"
          label="บันทึกการขาย"
          icon="pi pi-check"
          loading={isSubmitting}
          className="w-full"
        />
      </form>
    </>
  );
}
