'use client';

import type { ReactNode } from 'react';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import 'primeicons/primeicons.css';
import { Menubar } from 'primereact/menubar';
import type { MenuItem } from 'primereact/menuitem';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

interface LayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: LayoutProps) {
  const menuItems: MenuItem[] = [
    {
      label: '🍦 Ice Cream Shop',
      icon: 'pi pi-home',
      command: () => (window.location.href = '/'),
    },
    {
      label: 'ขาย',
      icon: 'pi pi-shopping-bag',
      command: () => (window.location.href = '/sales'),
    },
    {
      label: 'ต้นทุน',
      icon: 'pi pi-inbox',
      command: () => (window.location.href = '/costs'),
    },
    {
      label: 'สินค้า',
      icon: 'pi pi-list',
      command: () => (window.location.href = '/inventory'),
    },
    {
      label: 'รายงาน',
      icon: 'pi pi-chart-bar',
      command: () => (window.location.href = '/reports'),
    },
  ];

  return (
    <html
      lang="th"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Menubar
          model={menuItems}
          className="mb-4 rounded-none border-b-2 border-blue-200"
        />
        <main className="flex-1 overflow-auto">{children}</main>
      </body>
    </html>
  );
}
