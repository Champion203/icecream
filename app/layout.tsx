import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';
import 'primeicons/primeicons.css';
import { AppHeader } from '@/components/AppHeader';

export const metadata: Metadata = {
  title: 'ร้านซ้อแก้วไอติมทอด | จัดการร้านไอศกรีมทอด',
  description: 'ระบบจัดการยอดขาย ต้นทุน สินค้าคงเหลือ และรายงานประจำวัน',
};

interface LayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: LayoutProps) {
  return (
    <html lang="th">
      <body>
        <AppHeader />
        <main className="app-main">{children}</main>
      </body>
    </html>
  );
}
