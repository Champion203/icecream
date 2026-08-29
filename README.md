# 🍦 Deep Fried Ice Cream Shop Management System

ระบบจัดการต้นทุน ยอดขาย สินค้าคงเหลือ และรายงานประจำวันสำหรับร้านขายไอติมทอด

## ✨ Features

- 📊 **Dashboard** - แสดงสรุปรายได้ ต้นทุน กำไร และสถิติประจำวัน
- 🛒 **บันทึกการขาย** - บันทึกการขายสิ้นค้าแบบเรียลไทม์
- 💰 **จัดการต้นทุน** - บันทึกการซื้อไอติมใหม่และต้นทุน
- 📦 **จัดการสินค้า** - แสดงคงเหลือสินค้าแต่ละรสชาติ
- ⚠️ **ระบบเตือน** - แจ้งเตือนเมื่อไอติมเหลือน้อยหรือหมด
- 📈 **รายงานประจำวัน** - สรุปรายได้-ต้นทุน-กำไรแต่ละวัน
- 📱 **Responsive Design** - ใช้ได้ทั้ง Desktop และ Mobile

## 🚀 Quick Start

### 1. Clone Repository
```bash
git clone <repository-url>
cd icecream
```

### 2. Setup Supabase Database

1. สร้าง account ที่ [Supabase](https://supabase.com)
2. สร้าง project ใหม่
3. ไปที่ SQL Editor และ run SQL script:
   - เปิดไฟล์ `docs/SUPABASE_SETUP.sql`
   - Copy ทั้งหมด แล้ว paste ใน Supabase SQL Editor
   - Run (⌘+Enter หรือ Ctrl+Enter)

### 3. Setup Environment Variables

1. เปิด `.env.local` และเติม Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

ได้ keys เหล่านี้จาก Supabase > Project Settings > API

### 4. Install Dependencies
```bash
npm install
```

### 5. Run Development Server
```bash
npm run dev
```

เปิด browser ไปที่ `http://localhost:3000`

## 📋 Project Structure

```
icecream/
├── app/                    # Next.js App Router
│   ├── api/                # API routes
│   ├── costs/              # Cost management page
│   ├── inventory/          # Inventory page
│   ├── reports/            # Reports page
│   ├── sales/              # Sales recording page
│   └── page.tsx            # Dashboard
├── components/             # React components
├── lib/                    # Utilities & helpers
├── schema/                 # TypeScript types
├── docs/                   # Documentation
└── .env.local              # Environment variables
```

## 🛠️ Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## 🌐 Deployment to Vercel

1. Push code ไป GitHub
2. ไป [Vercel.com](https://vercel.com) และ login
3. Click "Import GitHub repo"
4. เลือก repository นี้
5. Add Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
6. Click Deploy

หลังจากนั้น Vercel จะสร้าง production URL ให้คุณอัตโนมัติ

## 📱 Pages

- **/** - Dashboard
- **/sales** - บันทึกการขาย
- **/costs** - จัดการต้นทุน
- **/inventory** - จัดการสินค้า
- **/reports** - รายงานประจำวัน

## 🔌 API Routes

- `GET /api/inventory` - ดึงรายการไอติมทั้งหมด
- `POST /api/inventory` - เพิ่มไอติมใหม่
- `GET /api/costs` - ดึงบันทึกต้นทุน
- `POST /api/costs` - เพิ่มต้นทุนใหม่
- `GET /api/sales` - ดึงบันทึกการขาย
- `POST /api/sales` - เพิ่มการขายใหม่
- `GET /api/dashboard` - ดึงสถิติ Dashboard

## 📦 Tech Stack

- Next.js 16
- React 18
- TypeScript
- Supabase (PostgreSQL)
- PrimeReact
- Tailwind CSS
- Chart.js
- React Hook Form + Zod

## 🛡️ Security

- ✅ Environment variables สำหรับ credentials
- ✅ Supabase RLS (Row Level Security)
- ✅ Input validation ด้วย Zod
- ✅ Parameterized queries
- ✅ ห้าม commit `.env.local`

## 🐛 Troubleshooting

**Supabase connection error**
- ตรวจสอบ `.env.local` ว่าครบทั้ง 3 keys
- ตรวจสอบ Supabase project status

**Build errors**
- ลบ `.next` folder แล้วรัน `npm run build` อีกครั้ง
- ตรวจสอบ Node.js version >= 18

---

Made with ❤️ for Ice Cream Lovers 🍦
