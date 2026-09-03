'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { MultiSelect } from 'primereact/multiselect';
import { Toast } from 'primereact/toast';
import { useRef, useEffect, useState } from 'react';
import type { RecordSaleForm as IRecordSaleForm, Inventory, Sale } from '@/schema/types';
import { inventoryAPI, salesAPI } from '@/lib/api';
import { formatInventoryName } from '@/lib/utils';
import { getToppingOptions, type SalesChannel } from '@/lib/sales-pricing';

export const saleFormSchema = z.object({
  inventory_id: z.string().min(1, 'เลือกไอติมจำเป็น'),
  quantity_sold: z.number().positive('จำนวนต้องมากกว่า 0'),
  unit_price: z.number().positive('ราคาต้องมากกว่า 0'),
  toppings: z.array(z.object({ name: z.string(), price: z.number().nonnegative() })),
  sales_channel: z.enum(['regular', 'lineman']),
});

export const TOPPING_OPTIONS = getToppingOptions('regular');

interface RecordSaleFormProps {
  onSuccess?: () => void;
  initialData?: Sale;
}

export function RecordSaleForm({ onSuccess, initialData }: RecordSaleFormProps) {
  const toast = useRef<Toast>(null);
  const [inventory, setInventory] = useState<Inventory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [salesChannel, setSalesChannel] = useState<SalesChannel>(
    initialData?.sales_channel || 'regular'
  );

  const {
    control,
    handleSubmit,
    reset,
    getValues,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<IRecordSaleForm>({
    resolver: zodResolver(saleFormSchema),
    defaultValues: {
      inventory_id: initialData?.inventory_id || '',
      quantity_sold: initialData?.quantity_sold,
      unit_price: initialData?.unit_price,
      toppings: initialData?.toppings || [],
      sales_channel: initialData?.sales_channel || 'regular',
    },
  });

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

  useEffect(() => {
    reset({
      inventory_id: initialData?.inventory_id || '',
      quantity_sold: initialData?.quantity_sold,
      unit_price: initialData?.unit_price,
      toppings: initialData?.toppings || [],
      sales_channel: initialData?.sales_channel || 'regular',
    });
    // Reset the local selector when the edit target changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSalesChannel(initialData?.sales_channel || 'regular');
  }, [initialData, reset]);

  const onSubmit = async (data: IRecordSaleForm) => {
    try {
      if (initialData) {
        await salesAPI.update(initialData.id, data);
      } else {
        await salesAPI.create(data);
      }
      toast.current?.show({
        severity: 'success',
        summary: 'สำเร็จ',
        detail: initialData ? 'แก้ไขรายการขายสำเร็จแล้ว' : 'บันทึกการขายสำเร็จแล้ว',
      });
      if (!initialData) reset();
      onSuccess?.();
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'ข้อผิดพลาด',
        detail: initialData ? 'ไม่สามารถแก้ไขรายการขาย' : 'ไม่สามารถบันทึกการขาย',
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
          <label className="block mb-2 font-medium">ช่องทางการขาย</label>
          <div className="flex gap-2">
            {([
              ['regular', 'เมนูปกติ'],
              ['lineman', 'เมนู Line Man'],
            ] as const).map(([value, label]) => (
              <Button
                key={value}
                type="button"
                label={label}
                severity={salesChannel === value ? 'info' : 'secondary'}
                outlined={salesChannel !== value}
                onClick={() => {
                  setSalesChannel(value);
                  setValue('sales_channel', value, { shouldDirty: true });
                  const currentToppings = getValues('toppings');
                  const options = getToppingOptions(value);
                  const toppings = options.filter((topping) =>
                    currentToppings.some((selected) => selected.name === topping.name)
                  );
                  const previousTotal = currentToppings.reduce((sum, topping) => sum + topping.price, 0);
                  const nextTotal = toppings.reduce((sum, topping) => sum + topping.price, 0);
                  setValue('toppings', toppings, { shouldDirty: true });
                  setValue('unit_price', Math.max(0, (getValues('unit_price') || 0) - previousTotal + nextTotal), {
                    shouldValidate: true,
                    shouldDirty: true,
                  });
                }}
              />
            ))}
          </div>
          {salesChannel === 'lineman' && (
            <small className="block mt-2 text-orange-600">Line Man หักค่าธรรมเนียม 32.1% จากยอดรวม</small>
          )}
        </div>

        <div>
          <label className="block mb-2 font-medium">เลือกไอติม</label>
          <Controller
            name="inventory_id"
            control={control}
            render={({ field }) => (
              <Dropdown
                inputId={field.name}
                name={field.name}
                value={field.value || null}
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
          {errors.quantity_sold && (
            <span className="text-red-500 text-sm">
              {errors.quantity_sold.message}
            </span>
          )}
        </div>

        <div>
          <label className="block mb-2 font-medium">เพิ่มท็อปปิ้ง (เลือกได้หลายอย่าง)</label>
          <Controller
            name="toppings"
            control={control}
            render={({ field }) => (
              <MultiSelect
                inputId={field.name}
                value={field.value.map((topping) => topping.name)}
                options={getToppingOptions(salesChannel).map((topping) => ({
                  label: `${topping.name} ${topping.price} บาท`,
                  value: topping.name,
                }))}
                onChange={(event) => {
                  const previousTotal = field.value.reduce(
                    (sum, topping) => sum + topping.price,
                    0
                  );
                  const selected = getToppingOptions(salesChannel).filter((topping) =>
                    (event.value as string[]).includes(topping.name)
                  );
                  const nextTotal = selected.reduce(
                    (sum, topping) => sum + topping.price,
                    0
                  );
                  field.onChange(selected);
                  setValue(
                    'unit_price',
                    Math.max(0, (getValues('unit_price') || 0) - previousTotal + nextTotal),
                    { shouldValidate: true, shouldDirty: true }
                  );
                }}
                placeholder="เลือกท็อปปิ้ง"
                display="chip"
                className="w-full"
              />
            )}
          />
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
            <span className="text-red-500 text-sm">
              {errors.unit_price.message}
            </span>
          )}
        </div>

        <Button
          type="submit"
          label={initialData ? 'บันทึกการแก้ไข' : 'บันทึกการขาย'}
          icon={initialData ? 'pi pi-save' : 'pi pi-check'}
          loading={isSubmitting}
          className="w-full"
        />
      </form>
    </>
  );
}
