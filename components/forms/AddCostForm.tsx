'use client';

import { useEffect, useState, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from 'primereact/button';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { Toast } from 'primereact/toast';
import type { AddCostForm as IAddCostForm, Inventory } from '@/schema/types';
import { inventoryAPI, costsAPI } from '@/lib/api';
import { getTodayDate } from '@/lib/utils';

const schema = z.object({
  inventory_id: z.string().min(1, 'เลือกไอติมจำเป็น'),
  quantity: z.number().positive('จำนวนต้องมากกว่า 0'),
  unit_price: z.number().positive('ราคาต้องมากกว่า 0'),
  purchase_date: z.string(),
});

interface AddCostFormProps {
  onSuccess?: () => void;
}

export function AddCostForm({ onSuccess }: AddCostFormProps) {
  const toast = useRef<Toast>(null);
  const [inventory, setInventory] = useState<Inventory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<IAddCostForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      purchase_date: getTodayDate(),
    },
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

  const onSubmit = async (data: IAddCostForm) => {
    try {
      await costsAPI.create(data);
      toast.current?.show({
        severity: 'success',
        summary: 'สำเร็จ',
        detail: 'บันทึกต้นทุนสำเร็จแล้ว',
      });
      reset();
      onSuccess?.();
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'ข้อผิดพลาด',
        detail: 'ไม่สามารถบันทึกต้นทุน',
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
            <span className="text-red-500 text-sm">{errors.inventory_id.message}</span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-2 font-medium">จำนวน</label>
            <Controller
              name="quantity"
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
            {errors.quantity && (
              <span className="text-red-500 text-sm">{errors.quantity.message}</span>
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
              <span className="text-red-500 text-sm">{errors.unit_price.message}</span>
            )}
          </div>
        </div>

        <div>
          <label className="block mb-2 font-medium">วันที่ซื้อ</label>
          <Controller
            name="purchase_date"
            control={control}
            render={({ field }) => (
              <Calendar
                {...field}
                value={field.value ? new Date(field.value) : null}
                onChange={(e) => {
                  if (e.value) {
                    field.onChange((e.value as Date).toISOString().split('T')[0]);
                  }
                }}
                showIcon
                dateFormat="yy/mm/dd"
              />
            )}
          />
        </div>

        <Button
          type="submit"
          label="บันทึกต้นทุน"
          icon="pi pi-check"
          loading={isSubmitting}
          className="w-full"
        />
      </form>
    </>
  );
}
