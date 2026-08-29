# 🗄️ วิธีสร้าง Supabase Database - ขั้นตอนละเอียด

## 📝 Overview

ระบบไอติมทอดของคุณใช้ Supabase (PostgreSQL) เป็นฐานข้อมูล
ให้ทำตามขั้นตอนด้านล่างเพื่อสร้าง database พร้อมตารางทั้งหมด

---

## 🚀 ขั้นตอนที่ 1: สร้าง Supabase Account

### 1.1 ไปที่ Supabase
```
https://supabase.com
```

### 1.2 Click "Sign Up"
- หากมี GitHub account ให้ใช้ "Continue with GitHub" (ง่ายกว่า)
- หรือใช้ Email + Password

### 1.3 Verify Email
- ตรวจสอบ email ที่ได้รับ
- Click link เพื่อ confirm

✅ เมื่อสร้าง account เสร็จแล้ว

---

## 🏗️ ขั้นตอนที่ 2: สร้าง Project ใหม่

### 2.1 ใน Dashboard ให้ Click "New Project"

### 2.2 ตั้งค่า Project
| ตัวเลือก | ค่า |
|---------|-----|
| **Project name** | `icecream` หรือชื่ออื่น |
| **Database Password** | สร้างที่มีความปลอดภัย (ยาว 20+ ตัวอักษร) |
| **Region** | เลือก `Singapore` หรือใกล้กับคุณ |

### 2.3 Click "Create new project"
- รอประมาณ 2-3 นาทีให้ Supabase สร้าง database

✅ เมื่อ project สร้างเสร็จแล้ว จะเห็น Dashboard

---

## 🔑 ขั้นตอนที่ 3: ได้รับ API Keys

### 3.1 ไปที่ Settings
ใน Supabase Dashboard ให้:
- Click ⚙️ **Settings** (ด้านล่าง)
- ไปที่ **API** tab

### 3.2 Copy 3 Keys ที่จำเป็น

**Key #1: Project URL**
```
NEXT_PUBLIC_SUPABASE_URL=https://[project-id].supabase.co
```
- หา "Project URL" 
- Copy และ save ไว้

**Key #2: Anon Public Key**
```
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
```
- หา "anon public" ใน "Project API Keys"
- Copy และ save ไว้

**Key #3: Service Role Key** ⚠️ **เก็บความลับ**
```
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
```
- หา "service_role secret" ใน "Project API Keys"
- ⚠️ **ห้ามแพร่พันธุ์ให้คนอื่น!**
- Copy และ save ไว้

✅ บันทึก 3 keys ทั้งหมด

---

## 📊 ขั้นตอนที่ 4: สร้าง Database Schema (ตารางทั้งหมด)

> หากสร้างฐานข้อมูลไว้ก่อนเพิ่มหมวดต้นทุน ให้รันไฟล์
> `docs/MIGRATE_COST_CATEGORIES.sql` ใน SQL Editor หนึ่งครั้งก่อนใช้งานหน้าต้นทุน

### 4.1 ไปที่ SQL Editor

ใน Supabase Dashboard:
- ไปที่ **SQL Editor** (ฝั่งซ้าย)
- Click **New Query**

### 4.2 Copy SQL Script

เปิดไฟล์ `docs/SUPABASE_SETUP.sql` ในโปรเจกต์ของคุณ:
```
d:\DEVCHAMP\icecream\docs\SUPABASE_SETUP.sql
```

**Copy ทั้งหมด** (Ctrl+A แล้ว Ctrl+C)

### 4.3 Paste ใน SQL Editor

- ใน Supabase SQL Editor ให้ Paste (Ctrl+V)
- จะเห็นโค้ด SQL ยาวๆ

### 4.4 รัน SQL

- Click **Run** button (สีน้ำเงิน)
- หรือกด **Cmd+Enter** (Mac) / **Ctrl+Enter** (Windows)
- รอให้ execute สำเร็จ

**ผลลัพธ์ที่คาดหวัง:**
```
✓ Database tables created successfully
✓ Indexes created
✓ Row Level Security (RLS) enabled
✓ Sample data inserted
```

✅ Database schema พร้อมใช้แล้ว

---

## 🔐 ขั้นตอนที่ 5: ตั้งค่า .env.local

### 5.1 เปิดไฟล์ `.env.local`

```
d:\DEVCHAMP\icecream\.env.local
```

### 5.2 แทนค่า Keys

เปลี่ยน placeholder values เป็น keys ที่ copy ไป:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5...
```

### 5.3 บันทึกไฟล์

Save ด้วย **Ctrl+S**

⚠️ **สำคัญ:** ห้าม commit `.env.local` ไปที่ Git!

✅ Environment variables พร้อมใช้

---

## ✅ ขั้นตอนที่ 6: ทดสอบ Connection

### 6.1 เปิด Terminal ใน VS Code

```bash
cd d:\DEVCHAMP\icecream
npm install
```

### 6.2 รัน Dev Server

```bash
npm run dev
```

### 6.3 เปิด Browser

```
http://localhost:3000
```

### 6.4 ทดสอบ Functionality

**ให้ลองทำตามนี้:**

1. ✅ ไปที่ `/inventory` 
   - Click "เพิ่มไอติม"
   - เติม ชื่อ, รสชาติ, ต้นทุน, จำนวน
   - Click "เพิ่มไอติม" → ควรเห็น success toast

2. ✅ ไปที่ `/sales`
   - Click "บันทึกการขาย"
   - เลือกไอติมที่เพิ่มมา
   - เติมจำนวน + ราคา
   - Click บันทึก

3. ✅ ไปที่ `/` (Dashboard)
   - ควรเห็น KPI cards อัปเดต
   - Chart แสดงข้อมูล

หากทั้งหมดทำงานได้ = **Database สำเร็จ!** ✨

---

## 🐛 Troubleshooting

### ❌ "Failed to connect to Supabase"
**วิธีแก้:**
1. ตรวจสอบ `.env.local` ว่าครบ 3 keys
2. ตรวจสอบค่า copy ถูกต้อง (ไม่มี spaces ข้างหน้า/หลัง)
3. ตรวจสอบ Supabase project status (ตรวจสอบ "Status" ใน dashboard)
4. Restart dev server (`npm run dev`)

### ❌ "Error: Please authorize access to continue"
**วิธีแก้:**
1. Copy `SUPABASE_SERVICE_ROLE_KEY` ใหม่ (ตัวที่ยาวสุด)
2. ลบ prefix `Bearer ` ถ้ามี
3. เทพเพิ่มใน `.env.local`

### ❌ SQL Query Error
**วิธีแก้:**
1. ตรวจสอบไฟล์ `docs/SUPABASE_SETUP.sql` ว่านำเข้าถูกต้อง
2. Copy ทั้งหมดใหม่ (บางครั้ง copy ได้ไม่ครบ)
3. รัน SQL queries ทีละรายการ (ถ้าไม่รู้ว่าบรรทัดไหนมีปัญหา)

### ❌ CORS Error ใน Browser Console
**วิธีแก้:**
1. ไปที่ Supabase > Settings > API
2. หา "CORS" section
3. Add URL ของคุณ:
   - สำหรับ localhost: `http://localhost:3000`
   - สำหรับ Vercel: `https://your-app.vercel.app`

---

## 📋 Checklist

- [ ] สร้าง Supabase account
- [ ] สร้าง Supabase project
- [ ] Copy 3 API keys
- [ ] รัน `docs/SUPABASE_SETUP.sql` ใน SQL Editor
- [ ] เติม `.env.local` ด้วย keys
- [ ] `npm install` และ `npm run dev`
- [ ] ทดสอบ inventory/sales/dashboard
- [ ] ✅ เสร็จสิ้น!

---

## 🎉 ต่อไปนี้?

1. **ทดลองใช้งาน** ระบบบน localhost
2. **Deploy ไป Vercel** (ตามคู่มือ `docs/SETUP_VERCEL.md`)
3. **ใช้ระบบออนไลน์** 🌐

---

**หากติดปัญหาไม่ได้ แล้วมาถามได้นะครับ** 😊
