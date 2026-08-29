# 🚀 Deploy ไป Vercel - Step by Step Guide

คู่มือนี้จะช่วยให้คุณ deploy ระบบ Deep Fried Ice Cream Shop Management ไป Vercel และเข้าถึงออนไลน์ได้

## 📋 Prerequisites

- GitHub account
- Vercel account (สร้างที่ [vercel.com](https://vercel.com))
- Supabase project ที่เตรียมไว้แล้ว

## 🔧 Step 1: Prepare GitHub Repository

1. ให้แน่ใจว่า code อยู่ใน GitHub repository
2. ตรวจสอบ `.gitignore` มี `.env.local` (ห้ามมี credentials ใน git)

```bash
# ใน terminal
git add .
git commit -m "Initial commit"
git push origin main
```

## 🌐 Step 2: Login to Vercel

1. ไปที่ [vercel.com](https://vercel.com)
2. Click "Sign Up" หรือ "Log In"
3. เลือก "Continue with GitHub"
4. Authorize Vercel เข้า GitHub account

## 📦 Step 3: Import Project

1. เมื่อ login แล้ว จะเห็นหน้า Dashboard
2. Click "Add New..." > "Project"
3. ค้นหา repository ที่ชื่อ "icecream"
4. Click "Import"

## ⚙️ Step 4: Configure Environment Variables

หลังจาก click Import จะเห็นหน้า "Configure Project"

**สำคัญ:** ต้อง add Environment Variables ก่อน deploy

ให้ทำตามนี้:

1. หา section "Environment Variables"
2. Add 3 variables ต่อไปนี้:

**Variable #1:**
- Name: `NEXT_PUBLIC_SUPABASE_URL`
- Value: `https://your-project.supabase.co` (จาก Supabase)
- Click "Add"

**Variable #2:**
- Name: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Value: (copy จาก Supabase Project Settings > API)
- Click "Add"

**Variable #3:**
- Name: `SUPABASE_SERVICE_ROLE_KEY`
- Value: (copy จาก Supabase Project Settings > API)
- Click "Add"

### วิธีได้ Supabase Keys

1. ไปที่ Supabase Dashboard
2. เลือก project ของคุณ
3. ไปที่ Settings (⚙️) > API
4. หา "Project URL" → copy เป็น `NEXT_PUBLIC_SUPABASE_URL`
5. หา "anon public" key → copy เป็น `NEXT_PUBLIC_SUPABASE_ANON_KEY`
6. หา "service_role secret" key → copy เป็น `SUPABASE_SERVICE_ROLE_KEY`

⚠️ **สำคัญ:** ไม่ต้องแพร่พันธุ์ service_role key ให้คนอื่น!

## 🚀 Step 5: Deploy

1. ตรวจสอบว่า Environment Variables ครบแล้ว
2. Click "Deploy" button (ด้านล่าง)
3. รอ deployment ให้เสร็จ (ประมาณ 3-5 นาที)
4. เมื่อเห็น "✓ Deployment Complete" แสดงว่าเสร็จแล้ว

## 🎉 Step 6: Access Your Application

1. Click "Visit" button หรือ URL ที่แสดง
2. ระบบจะเปิดโดยอัตโนมัติ
3. ทดลองใช้งาน ✨

### URL ของคุณจะเป็นแบบนี้:
```
https://icecream-<randomid>.vercel.app
```

## 📊 ทดลองใช้งาน

1. ไปที่ `/inventory` → เพิ่มไอติมใหม่
2. ไปที่ `/sales` → บันทึกการขาย
3. ไปที่ `/costs` → เพิ่มต้นทุน
4. ไปที่ `/` → ดู Dashboard

## 🔄 Update Code

หากคุณแก้ไข code ต่อมา:

```bash
git add .
git commit -m "Update feature"
git push origin main
```

Vercel จะ auto-deploy เมื่อ detect การ push

## 🚨 Troubleshooting

### ❌ Deployment Failed
- ตรวจ Build Logs ใน Vercel Dashboard
- ตรวจสอบ Environment Variables ว่าครบไหม
- ตรวจสอบ Supabase project status

### ❌ "Cannot GET /api/inventory"
- อาจเป็นปัญหา Supabase connection
- ตรวจสอบ Environment Variables ว่าถูกต้อง
- ตรวจสอบ Supabase RLS policies

### ❌ CSS ไม่โหลด
- Clear browser cache (Ctrl+Shift+Delete)
- ลอง incognito mode
- ฟัง network tab ใน DevTools

## 📱 Custom Domain (Optional)

ถ้าต้องการ domain เป็นของคุณเอง:

1. ไปที่ Vercel Project Settings
2. ไปที่ "Domains"
3. Add custom domain
4. Follow instructions สำหรับ DNS setup

## 📞 Need Help?

- Check Vercel Docs: https://vercel.com/docs
- Check Supabase Docs: https://supabase.com/docs
- Check Next.js Docs: https://nextjs.org/docs

---

**🎉 Congratulations!** ระบบของคุณออนไลน์แล้ว! 🍦
