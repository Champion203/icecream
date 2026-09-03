import type { SaleTopping, SalesChannel } from '@/schema/types';
export type { SalesChannel } from '@/schema/types';

export const LINE_MAN_FEE_RATE = 0.321;

export const REGULAR_TOPPING_OPTIONS: SaleTopping[] = [
  { name: 'เม็ดน้ำตาลเรนโบว์', price: 5 },
  { name: 'เยลลี่แดง', price: 5 },
  { name: 'เวเฟอร์สติ๊กแท่ง', price: 5 },
  { name: 'คอนแฟลก', price: 5 },
  { name: 'ไมโล', price: 5 },
  { name: 'โอรีโอ', price: 5 },
  { name: 'โอวัลตินเฟลค', price: 5 },
  { name: 'มาร์ชเมลโลว์', price: 5 },
  { name: 'ช็อกชิพ', price: 10 },
  { name: 'วิปครีม', price: 10 },
  { name: 'บิสคอฟ', price: 15 },
];

export const LINE_MAN_TOPPING_OPTIONS: SaleTopping[] = REGULAR_TOPPING_OPTIONS.map(
  (topping, index) => ({
    ...topping,
    price: index < 8 ? 10 : index === 8 ? 20 : 25,
  })
);

export const getToppingOptions = (channel: SalesChannel) =>
  channel === 'lineman' ? LINE_MAN_TOPPING_OPTIONS : REGULAR_TOPPING_OPTIONS;

export const getNetRevenue = (grossRevenue: number, channel: SalesChannel) =>
  channel === 'lineman' ? grossRevenue * (1 - LINE_MAN_FEE_RATE) : grossRevenue;