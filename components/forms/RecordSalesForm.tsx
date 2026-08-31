'use client';

import { useEffect, useRef, useState } from 'react';
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { MultiSelect } from 'primereact/multiselect';
import { Toast } from 'primereact/toast';
import type { Inventory, RecordSalesForm as IRecordSalesForm } from '@/schema/types';
import { inventoryAPI, salesAPI } from '@/lib/api';
import { formatCurrency, formatInventoryName } from '@/lib/utils';
import { saleFormSchema, TOPPING_OPTIONS } from './RecordSaleForm';

const schema = z.object({
  items: z.array(saleFormSchema).min(1, 'ต้องมีรายการขายอย่างน้อย 1 รายการ'),
});

const emptyItem = () => ({
  inventory_id: '',
  quantity_sold: 1,
  unit_price: Number.NaN,
  toppings: [],
});

interface RecordSalesFormProps {
  onSuccess?: () => void;
}

export function RecordSalesForm({ onSuccess }: RecordSalesFormProps) {
  const toast = useRef<Toast>(null);
  const [inventory, setInventory] = useState<Inventory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const {
    control,
    handleSubmit,
    reset,
    getValues,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<IRecordSalesForm>({
    resolver: zodResolver(schema),
    defaultValues: { items: [emptyItem()] },
  });
  const { fields, append, remove } = useFieldArray({ control, name: 'items' });
  const items = useWatch({ control, name: 'items' });

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const response = await inventoryAPI.getAll();
        setInventory(
          response.data
            .filter((item) => item.status === 'active')
            .map((item) => ({ ...item, name: formatInventoryName(item) }))
        );
      } catch {
        toast.current?.show({
          severity: 'error',
          summary: 'ข้อผิดพลาด',
          detail: 'ไม่สามารถโหลดรายการไอติมได้',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchInventory();
  }, []);

  const total = (items || []).reduce(
    (sum, item) => sum + (item?.quantity_sold || 0) * (item?.unit_price || 0),
    0
  );

  const onSubmit = async (data: IRecordSalesForm) => {
    try {
      await salesAPI.createMany(data);
      toast.current?.show({
        severity: 'success',
        summary: 'สำเร็จ',
        detail: `บันทึกการขาย ${data.items.length} รายการเรียบร้อยแล้ว`,
      });
      reset({ items: [emptyItem()] });
      onSuccess?.();
    } catch {
      toast.current?.show({
        severity: 'error',
        summary: 'ข้อผิดพลาด',
        detail: 'ไม่สามารถบันทึกรายการขายได้ กรุณาตรวจสอบจำนวนคงเหลือ',
      });
    }
  };

  return (
    <>
      <Toast ref={toast} />
      {/* eslint-disable-next-line react-hooks/refs */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {fields.map((fieldItem, index) => {
          const itemErrors = errors.items?.[index];
          return (
            <div key={fieldItem.id} className="border-1 border-gray-200 border-round p-3">
              <div className="flex justify-between align-items-center mb-3">
                <h4 className="font-semibold m-0">ไอติมรายการที่ {index + 1}</h4>
                {fields.length > 1 && (
                  <Button
                    type="button"
                    icon="pi pi-trash"
                    label="ลบรายการ"
                    severity="danger"
                    text
                    onClick={() => remove(index)}
                  />
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                <div>
                  <label className="block mb-2 font-medium">เลือกรสชาติไอติม</label>
                  <Controller
                    name={`items.${index}.inventory_id`}
                    control={control}
                    render={({ field }) => (
                      <Dropdown
                        inputId={field.name}
                        value={field.value || null}
                        onChange={(event) => field.onChange(event.value)}
                        onBlur={field.onBlur}
                        options={inventory}
                        optionLabel="name"
                        optionValue="id"
                        placeholder="เลือกรสชาติ"
                        className="w-full"
                        disabled={isLoading}
                      />
                    )}
                  />
                  {itemErrors?.inventory_id && (
                    <span className="text-red-500 text-sm">
                      {itemErrors.inventory_id.message}
                    </span>
                  )}
                </div>

                <div>
                  <label className="block mb-2 font-medium">จำนวน</label>
                  <Controller
                    name={`items.${index}.quantity_sold`}
                    control={control}
                    render={({ field }) => (
                      <input
                        id={field.name}
                        name={field.name}
                        type="number"
                        value={Number.isNaN(field.value) ? '' : (field.value ?? '')}
                        onChange={(event) =>
                          field.onChange(
                            event.target.value === '' ? null : event.target.valueAsNumber
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
                  {itemErrors?.quantity_sold && (
                    <span className="text-red-500 text-sm">
                      {itemErrors.quantity_sold.message}
                    </span>
                  )}
                </div>

                <div>
                  <label className="block mb-2 font-medium">ราคาต่อหน่วย (บาท)</label>
                  <Controller
                    name={`items.${index}.unit_price`}
                    control={control}
                    render={({ field }) => (
                      <input
                        id={field.name}
                        name={field.name}
                        type="number"
                        value={Number.isNaN(field.value) ? '' : (field.value ?? '')}
                        onChange={(event) =>
                          field.onChange(
                            event.target.value === '' ? null : event.target.valueAsNumber
                          )
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
                  {itemErrors?.unit_price && (
                    <span className="text-red-500 text-sm">
                      {itemErrors.unit_price.message}
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label className="block mb-2 font-medium">
                  เพิ่มท็อปปิ้ง (ราคาจะบวกในราคาต่อหน่วย)
                </label>
                <Controller
                  name={`items.${index}.toppings`}
                  control={control}
                  render={({ field }) => (
                    <MultiSelect
                      inputId={field.name}
                      value={field.value.map((topping) => topping.name)}
                      options={TOPPING_OPTIONS.map((topping) => ({
                        label: `${topping.name} ${topping.price} บาท`,
                        value: topping.name,
                      }))}
                      onChange={(event) => {
                        const previousTotal = field.value.reduce(
                          (sum, topping) => sum + topping.price,
                          0
                        );
                        const selected = TOPPING_OPTIONS.filter((topping) =>
                          (event.value as string[]).includes(topping.name)
                        );
                        const nextTotal = selected.reduce(
                          (sum, topping) => sum + topping.price,
                          0
                        );
                        field.onChange(selected);
                        setValue(
                          `items.${index}.unit_price`,
                          Math.max(
                            0,
                            (getValues(`items.${index}.unit_price`) || 0) -
                              previousTotal +
                              nextTotal
                          ),
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
            </div>
          );
        })}

        <Button
          type="button"
          label="เพิ่มรสชาติ"
          icon="pi pi-plus"
          severity="secondary"
          outlined
          onClick={() => append(emptyItem())}
        />

        <div className="flex justify-between align-items-center border-top-1 border-gray-200 pt-3">
          <span className="text-lg font-semibold">ยอดรวม {formatCurrency(total)}</span>
          <Button
            type="submit"
            label={`บันทึก ${fields.length} รายการ`}
            icon="pi pi-check"
            loading={isSubmitting}
          />
        </div>
      </form>
    </>
  );
}
