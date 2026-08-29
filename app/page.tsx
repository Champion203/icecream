'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import type { DashboardStats } from '@/schema/types';
import { dashboardAPI } from '@/lib/api';
import { formatCurrency, formatDate, getWeekRange } from '@/lib/utils';
import { InventoryCard } from '@/components/InventoryCard';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

export default function Dashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const weekRange = getWeekRange();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await dashboardAPI.getStats();
        setStats(res.data);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="flex justify-center items-center h-screen">
          <i className="pi pi-spin pi-spinner text-4xl"></i>
        </div>
      </div>
    );
  }

  const chartData = {
    labels: ['ต้นทุน', 'รายได้', 'กำไร'],
    datasets: [
      {
        label: 'จำนวนเงิน (บาท)',
        data: [stats?.totalCost || 0, stats?.totalRevenue || 0, stats?.totalProfit || 0],
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(75, 192, 75, 0.5)',
          'rgba(54, 162, 235, 0.5)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(75, 192, 75, 1)',
          'rgba(54, 162, 235, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const topFlavorsData = {
    labels: stats?.topSellingFlavors.map((f) => f.flavor) || [],
    datasets: [
      {
        label: 'รายได้ (บาท)',
        data: stats?.topSellingFlavors.map((f) => f.revenue) || [],
        backgroundColor: 'rgba(153, 102, 255, 0.5)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="page-shell">
      <div className="page-hero">
        <h1 className="text-3xl font-bold mb-2">แดชบอร์ด</h1>
        <p className="text-gray-600">
          สรุปประจำสัปดาห์ {formatDate(weekRange.start)} – {formatDate(weekRange.end)}
        </p>
      </div>

      <div className="dashboard-stats-grid stats-grid grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="text-center">
            <i className="pi pi-shopping-cart text-2xl text-blue-600 mb-2"></i>
            <p className="text-gray-600 text-sm mb-1">ยอดขายสัปดาห์นี้</p>
            <p className="text-2xl font-bold text-blue-600">{stats?.totalItemsSold || 0}</p>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100">
          <div className="text-center">
            <i className="pi pi-money-bill text-2xl text-green-600 mb-2"></i>
            <p className="text-gray-600 text-sm mb-1">รายได้สัปดาห์นี้</p>
            <p className="text-xl font-bold text-green-600">{formatCurrency(stats?.totalRevenue || 0)}</p>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100">
          <div className="text-center">
            <i className="pi pi-exclamation-circle text-2xl text-red-600 mb-2"></i>
            <p className="text-gray-600 text-sm mb-1">ต้นทุนสัปดาห์นี้</p>
            <p className="text-xl font-bold text-red-600">{formatCurrency(stats?.totalCost || 0)}</p>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
          <div className="text-center">
            <i className="pi pi-chart-pie text-2xl text-purple-600 mb-2"></i>
            <p className="text-gray-600 text-sm mb-1">กำไรสัปดาห์นี้</p>
            <p className="text-xl font-bold text-purple-600">{formatCurrency(stats?.totalProfit || 0)}</p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card className="dashboard-chart-card">
          <h3 className="text-lg font-bold mb-4">สรุปต้นทุน-รายได้-กำไรประจำสัปดาห์</h3>
          <Bar data={chartData} options={{ responsive: true }} />
        </Card>

        <Card className="dashboard-chart-card">
          <h3 className="text-lg font-bold mb-4">รสชาติที่ขายได้มากที่สุด</h3>
          <Bar data={topFlavorsData} options={{ responsive: true }} />
        </Card>
      </div>

      {stats?.lowStockItems && stats.lowStockItems.length > 0 && (
        <Card className="mb-6">
          <h3 className="text-lg font-bold mb-4">⚠️ ไอติมที่เหลือน้อย</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.lowStockItems.map((item) => (
              <InventoryCard key={item.id} item={item} />
            ))}
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button
          label="บันทึกการขาย"
          icon="pi pi-shopping-bag"
          className="p-button-lg p-button-success"
          onClick={() => router.push('/sales')}
        />
        <Button
          label="เพิ่มต้นทุน"
          icon="pi pi-inbox"
          className="p-button-lg p-button-warning"
          onClick={() => router.push('/costs')}
        />
        <Button
          label="จัดการสินค้า"
          icon="pi pi-list"
          className="p-button-lg p-button-info"
          onClick={() => router.push('/inventory')}
        />
      </div>
    </div>
  );
}
