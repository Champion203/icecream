'use client';

import { useEffect, useState, useRef } from 'react';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { Calendar } from 'primereact/calendar';
import { Toast } from 'primereact/toast';
import type { AddCostForm as IAddCostForm, Inventory } from '@/schema/types';
import { inventoryAPI, costsAPI } from '@/lib/api';
import { formatInventoryName, getTodayDate } from '@/lib/utils';

const schema = z
  .object({
    category: z.enum(['icecream', 'topping', 'oil', 'equipment', 'other']),
    inventory_id: z.string().nullable(),
    description: z.string(),
    quantity: z.number().positive('จำนวนต้องมากกว่า 0'),
    unit_price: z.number().positive('ราคาต้องมากกว่า 0'),
    purchase_date: z.string(),
  })
  .superRefine((data, context) => {
    if (data.category === 'icecream' && !data.inventory_id) {
      context.addIssue({ code: 'custom', path: ['inventory_id'], message: 'กรุณาเลือกไอศกรีม' });
    }
    if (data.category !== 'icecream' && !data.description.trim()) {
      context.addIssue({ code: 'custom', path: ['description'], message: 'กรุณาระบุรายละเอียด' });
    }
  });

const categoryOptions = [
  { label: 'ไอศกรีม', value: 'icecream' },
  { label: 'ท็อปปิ้ง', value: 'topping' },
  { label: 'น้ำมัน', value: 'oil' },
  { label: 'อุปกรณ์', value: 'equipment' },
  { label: 'อื่น ๆ', value: 'other' },
];

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
      category: 'icecream',
      inventory_id: null,
      description: '',
      quantity: undefined,
      unit_price: undefined,
      purchase_date: getTodayDate(),
    },
  });
  const selectedCategory = useWatch({ control, name: 'category' });

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const res = await inventoryAPI.getAll();
        setInventory(
          res.data
            .filter((item) => item.status === 'active')
            .map((item) => ({ ...item, name: formatInventoryName(item) }))
        );
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
      {/* React Hook Form creates a stable submit handler; this is not a ref read. */}
      {/* eslint-disable-next-line react-hooks/refs */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block mb-2 font-medium">หมวดต้นทุน</label>
          <Controller
            name="category"
            control={control}
            render={({ field }) => (
              <Dropdown
                inputId={field.name}
                value={field.value}
                onChange={(event) => field.onChange(event.value)}
                options={categoryOptions}
                className="w-full"
              />
            )}
          />
        </div>

        {selectedCategory === 'icecream' ? (
        <div>
          <label className="block mb-2 font-medium">เลือกไอศกรีม</label>
          <Controller
            name="inventory_id"
            control={control}
            render={({ field }) => (
              <Dropdown
                inputId={field.name}
                name={field.name}
                value={field.value}
                onChange={(event) => field.onChange(event.value)}
                onBlur={field.onBlur}
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
        ) : (
          <div>
            <label className="block mb-2 font-medium">รายละเอียดค่าใช้จ่าย</label>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <InputText
                  {...field}
                  placeholder="เช่น ซอสช็อกโกแลต, น้ำมันปาล์ม, กล่องบรรจุภัณฑ์"
                  className="w-full"
                />
              )}
            />
            {errors.description && (
              <span className="text-red-500 text-sm">{errors.description.message}</span>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-2 font-medium">จำนวน</label>
            <Controller
              name="quantity"
              control={control}
              render={({ field }) => (
                <input
                  id={field.name}
                  name={field.name}
                  type="number"
                  value={field.value ?? ''}
                  onChange={(event) =>
                    field.onChange(event.target.value === '' ? undefined : event.target.valueAsNumber)
                  }
                  onBlur={field.onBlur}
                  ref={field.ref}
                  min={1}
                  step={1}
                  inputMode="numeric"
                  className="p-inputtext p-component w-full"
                  placeholder="0"
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
                <input
                  id={field.name}
                  name={field.name}
                  type="number"
                  value={field.value ?? ''}
                  onChange={(event) =>
                    field.onChange(event.target.value === '' ? undefined : event.target.valueAsNumber)
                  }
                  onBlur={field.onBlur}
                  ref={field.ref}
                  min={0.01}
                  step="0.01"
                  inputMode="decimal"
                  className="p-inputtext p-component w-full"
                  placeholder="0.00"
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
                inputId={field.name}
                name={field.name}
                value={field.value ? new Date(field.value) : null}
                onChange={(e) => {
                  if (e.value) {
                    field.onChange((e.value as Date).toISOString().split('T')[0]);
                  }
                }}
                onBlur={field.onBlur}
                inputRef={field.ref}
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
