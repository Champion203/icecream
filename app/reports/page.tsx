'use client';

import { useState, useEffect, useRef } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Calendar } from 'primereact/calendar';
import { Toast } from 'primereact/toast';
import type { DailyReport } from '@/schema/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { reportsAPI } from '@/lib/api';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function ReportsPage() {
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [startDate, setStartDate] = useState<Date | null>(
    new Date(new Date().setDate(new Date().getDate() - 30))
  );
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const toast = useRef<Toast>(null);

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const toDateKey = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };
      const res = await reportsAPI.getAll(
        startDate ? toDateKey(startDate) : undefined,
        endDate ? toDateKey(endDate) : undefined
      );
      setReports(res.data);
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'ข้อผิดพลาด',
        detail: 'ไม่สามารถโหลดรายงาน',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchReports();
  }, []);

  const totalRevenue = reports.reduce((sum, report) => sum + report.total_revenue, 0);
  const totalCost = reports.reduce((sum, report) => sum + report.total_cost, 0);
  const totalProfit = reports.reduce((sum, report) => sum + report.profit, 0);
  const avgProfit = reports.length > 0 ? totalProfit / reports.length : 0;

  const revenueBodyTemplate = (rowData: DailyReport) => (
    <span className="font-semibold text-green-600">{formatCurrency(rowData.total_revenue)}</span>
  );

  const costBodyTemplate = (rowData: DailyReport) => (
    <span className="font-semibold text-red-600">{formatCurrency(rowData.total_cost)}</span>
  );

  const profitBodyTemplate = (rowData: DailyReport) => (
    <span className={`font-semibold ${rowData.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
      {formatCurrency(rowData.profit)}
    </span>
  );

  const dateBodyTemplate = (rowData: DailyReport) => (
    <span>{formatDate(rowData.report_date)}</span>
  );

  const chartData = {
    labels: reports.map((r) => formatDate(r.report_date)),
    datasets: [
      {
        label: 'รายได้',
        data: reports.map((r) => r.total_revenue),
        borderColor: 'rgb(75, 192, 75)',
        backgroundColor: 'rgba(75, 192, 75, 0.1)',
        tension: 0.1,
      },
      {
        label: 'ต้นทุน',
        data: reports.map((r) => r.total_cost),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.1)',
        tension: 0.1,
      },
      {
        label: 'กำไร',
        data: reports.map((r) => r.profit),
        borderColor: 'rgb(54, 162, 235)',
        backgroundColor: 'rgba(54, 162, 235, 0.1)',
        tension: 0.1,
      },
    ],
  };

  if (isLoading) {
    return (
      <div className="p-4 flex justify-center items-center h-screen">
        <i className="pi pi-spin pi-spinner text-4xl"></i>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <Toast ref={toast} />
      
      <div className="page-hero">
        <h1 className="text-3xl font-bold mb-2">รายงานประจำวัน</h1>
        <p className="text-gray-600">สรุปรายได้ ต้นทุน และกำไร</p>
      </div>

      {/* Summary Cards */}
      <div className="stats-grid grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-green-50 to-green-100">
          <div className="text-center">
            <i className="pi pi-money-bill text-2xl text-green-600 mb-2"></i>
            <p className="text-gray-600 text-sm mb-1">รายได้รวม</p>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(totalRevenue)}</p>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100">
          <div className="text-center">
            <i className="pi pi-exclamation-circle text-2xl text-red-600 mb-2"></i>
            <p className="text-gray-600 text-sm mb-1">ต้นทุนรวม</p>
            <p className="text-2xl font-bold text-red-600">{formatCurrency(totalCost)}</p>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="text-center">
            <i className="pi pi-chart-pie text-2xl text-blue-600 mb-2"></i>
            <p className="text-gray-600 text-sm mb-1">กำไรรวม</p>
            <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalProfit)}</p>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
          <div className="text-center">
            <i className="pi pi-chart-bar text-2xl text-purple-600 mb-2"></i>
            <p className="text-gray-600 text-sm mb-1">กำไรเฉลี่ย/วัน</p>
            <p className="text-2xl font-bold text-purple-600">{formatCurrency(avgProfit)}</p>
          </div>
        </Card>
      </div>

      {/* Chart */}
      {reports.length > 0 && (
        <Card className="mb-6">
          <h3 className="text-lg font-bold mb-4">แนวโน้มรายได้-ต้นทุน-กำไร</h3>
          <Line data={chartData} options={{ responsive: true }} />
        </Card>
      )}

      {/* Filters */}
      <Card className="mb-6">
        <div className="report-filters">
          <div>
            <label className="block mb-2 font-medium">วันเริ่มต้น</label>
            <Calendar
              value={startDate}
              onChange={(e) => setStartDate(e.value as Date)}
              showIcon
              dateFormat="yy/mm/dd"
            />
          </div>
          <div>
            <label className="block mb-2 font-medium">วันสิ้นสุด</label>
            <Calendar
              value={endDate}
              onChange={(e) => setEndDate(e.value as Date)}
              showIcon
              dateFormat="yy/mm/dd"
            />
          </div>
          <Button
            label="ค้นหา"
            icon="pi pi-search"
            onClick={fetchReports}
          />
          <Button
            label="ส่งออก Excel"
            icon="pi pi-download"
            severity="success"
            text
          />
        </div>
      </Card>

      {/* Reports Table */}
      <Card>
        <h3 className="text-lg font-bold mb-4">รายงานรายวัน</h3>
        <DataTable
          value={reports}
          paginator
          rows={10}
          stripedRows
          emptyMessage="ยังไม่มีข้อมูลรายงานในช่วงเวลานี้"
          tableStyle={{ minWidth: '50rem' }}
        >
          <Column field="report_date" header="วันที่" body={dateBodyTemplate} />
          <Column field="total_revenue" header="รายได้" body={revenueBodyTemplate} />
          <Column field="total_cost" header="ต้นทุน" body={costBodyTemplate} />
          <Column field="profit" header="กำไร" body={profitBodyTemplate} />
        </DataTable>
      </Card>
    </div>
  );
}
