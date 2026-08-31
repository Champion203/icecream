'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { useRef } from 'react';
import type { AddInventoryForm as IAddInventoryForm } from '@/schema/types';
import { inventoryAPI } from '@/lib/api';

const schema = z.object({
  name: z.string().min(1, 'ชื่อไอติมจำเป็น'),
  flavor: z.string().min(1, 'รสชาติจำเป็น'),
  unit_cost: z.number().positive('ต้นทุนต้องมากกว่า 0'),
  max_stock: z.number().positive('จำนวนสูงสุดต้องมากกว่า 0'),
});

interface AddInventoryFormProps {
  onSuccess?: () => void;
}

export function AddInventoryForm({ onSuccess }: AddInventoryFormProps) {
  const toast = useRef<Toast>(null);
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<IAddInventoryForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      flavor: '',
      unit_cost: undefined,
      max_stock: 100,
    },
  });

  const onSubmit = async (data: IAddInventoryForm) => {
    try {
      await inventoryAPI.create(data);
      toast.current?.show({
        severity: 'success',
        summary: 'สำเร็จ',
        detail: 'เพิ่มไอติมใหม่สำเร็จแล้ว',
      });
      reset();
      onSuccess?.();
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'ข้อผิดพลาด',
        detail: 'ไม่สามารถเพิ่มไอติมใหม่ได้',
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
          <label className="block mb-2 font-medium">ชื่อไอติม</label>
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <InputText
                name={field.name}
                value={field.value ?? ''}
                onChange={(event) => field.onChange(event.target.value)}
                onBlur={field.onBlur}
                ref={field.ref}
                placeholder="เช่น Deep Fried Vanilla"
                className="w-full"
              />
            )}
          />
          {errors.name && (
            <span className="text-red-500 text-sm">{errors.name.message}</span>
          )}
        </div>

        <div>
          <label className="block mb-2 font-medium">รสชาติ</label>
          <Controller
            name="flavor"
            control={control}
            render={({ field }) => (
              <InputText
                name={field.name}
                value={field.value ?? ''}
                onChange={(event) => field.onChange(event.target.value)}
                onBlur={field.onBlur}
                ref={field.ref}
                placeholder="เช่น วนิลา"
                className="w-full"
              />
            )}
          />
          {errors.flavor && (
            <span className="text-red-500 text-sm">{errors.flavor.message}</span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-2 font-medium">ต้นทุนต่อหน่วย (บาท)</label>
            <Controller
              name="unit_cost"
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
            {errors.unit_cost && (
              <span className="text-red-500 text-sm">
                {errors.unit_cost.message}
              </span>
            )}
          </div>

          <div>
            <label className="block mb-2 font-medium">จำนวนสูงสุด</label>
            <Controller
              name="max_stock"
              control={control}
              render={({ field }) => (
                <input
                  id={field.name}
                  name={field.name}
                  type="number"
                  value={field.value ?? ''}
                  onChange={(event) =>
                    field.onChange(
                      event.target.value === ''
                        ? null
                        : event.target.valueAsNumber
                    )
                  }
                  onBlur={field.onBlur}
                  ref={field.ref}
                  min={1}
                  step={1}
                  inputMode="numeric"
                  className="p-inputtext p-component w-full"
                />
              )}
            />
            {errors.max_stock && (
              <span className="text-red-500 text-sm">
                {errors.max_stock.message}
              </span>
            )}
          </div>
        </div>

        <Button
          type="submit"
          label="เพิ่มไอติม"
          icon="pi pi-plus"
          loading={isSubmitting}
          className="w-full"
        />
      </form>
    </>
  );
}
