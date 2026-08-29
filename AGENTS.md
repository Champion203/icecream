<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# AGENTS.md - Deep Fried Ice Cream Shop Management System

คำแนะนำนี้ใช้กับทุกไฟล์ใน repository นี้

เป้าหมายคือให้ AI Coding Agent ทำงานได้อย่างถูกต้อง สม่ำเสมอ ปลอดภัย
แก้ไขเฉพาะสิ่งที่จำเป็น รักษา architecture เดิมของระบบ
และใช้ context/token เท่าที่จำเป็น

## Project Overview

โปรเจกต์นี้เป็น Deep Fried Ice Cream Shop Management System
ระบบจัดการต้นทุน ยอดขาย คงเหลือสินค้า และรายงานประจำวัน

ระบบใช้ Next.js 16 App Router เป็นโครงสร้างหลัก
ใช้ Supabase (PostgreSQL) เป็นฐานข้อมูลหลัก
ใช้ PrimeReact + PrimeFlex สำหรับ UI components

ให้ยึด architecture, coding pattern, component structure, naming convention
และ utility ที่มีอยู่ใน repository เป็นหลัก

ห้ามเปลี่ยน technology หลัก, architecture หรือรูปแบบการทำงาน
โดยไม่ได้รับ requirement ที่ชัดเจน

## Tech Stack

Language: TypeScript / JavaScript
Frontend Framework: Next.js 16
UI Library: React 18
UI Components: PrimeReact 10
Utility CSS: PrimeFlex 4
Icons: PrimeIcons
Styling: Sass / SCSS + Tailwind CSS
HTTP Client: Axios
Form Management: React Hook Form
Validation: Zod
Form Resolver: @hookform/resolvers
Alerts / Dialogs: SweetAlert2
Charts: Chart.js
Database: Supabase (PostgreSQL)
Database Client: @supabase/supabase-js
Authentication: Supabase Auth + JWT
Bundler: Webpack 5
Formatting: Prettier
Linting: ESLint
Package Manager: npm
Version Control: Git
Deployment: Vercel

## Project Structure

app/ # Next.js App Router pages, layouts และ routes
components/ # Reusable React components
lib/ # Shared libraries, helpers และ utilities
schema/ # Database schema types
public/ # Static assets
.env.local # Environment variables (NOT COMMITTED)
middleware.ts # Next.js middleware
next.config.js # Next.js configuration

ก่อนสร้างไฟล์หรือ directory ใหม่ ให้ตรวจสอบโครงสร้างจริงของ repository
และใช้ตำแหน่ง/pattern ที่มีอยู่แล้วเป็นหลัก

## Project Commands

Development: npm run dev
Build: npm run build
Production Start: npm run start
Lint: npm run lint
Lint Fix: npm run lint --fix

## Database (Supabase PostgreSQL)

ตรวจ Supabase schema จริงก่อนแก้ไข
ห้ามสมมติชื่อ table หรือ column
ใช้ parameterized query สำหรับ user input
ห้ามนำ user input ไปต่อ SQL string โดยตรง

## Environment Variables

ต้องตั้งค่าใน .env.local:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY

ห้าม commit .env.local
ห้าม hardcode credential

## Security

ห้ามลดระดับ security เพื่อแก้ปัญหา
ใช้ Supabase RLS (Row Level Security)
Validate user input
ตรวจ authentication
ตรวจ authorization

## TypeScript

รักษา type safety
ใช้ interface/type ที่มีอยู่ก่อนสร้างใหม่
หลีกเลี่ยง any หากสามารถระบุ type ได้

## React / Next.js

รักษา Next.js App Router architecture
ตรวจ component ที่มีอยู่ก่อนสร้างใหม่
ใช้ React hooks ตามกฎของ React

## Existing Libraries

ก่อนเพิ่ม dependency ใหม่ ให้ตรวจ package ที่มีอยู่
ใช้ library เดิมเป็นหลัก:
- HTTP: axios
- Form: react-hook-form
- Validation: zod
- Dialog: sweetalert2
- UI: primereact
- Icons: primeicons
- Database: @supabase/supabase-js
- Charts: chart.js

## Definition of Done

งานเสร็จเมื่อ:
- Requirement ทั้งหมดสำเร็จ
- ไม่มี error จาก TypeScript
- ไฟล์ผ่าน Prettier
- Build ผ่าน
- ตรวจ git diff ไม่มี secret/debug code
