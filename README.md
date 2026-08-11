# BONDOK ERP/POS

نظام ERP/POS متكامل للمطاعم متعدد الفروع.

## 🏗️ Architecture

- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS + Zustand + React Query + Recharts
- **Backend**: Node.js + Express + TypeScript + Prisma + PostgreSQL + Redis + Socket.io
- **Auth**: JWT (Access + Refresh) + 2FA + Argon2id
- **Real-time**: Socket.io with branch-level room isolation

## 🚀 Quick Start

```bash
# Clone the repo
git clone https://github.com/mhmdsonice-del/bondok-pos-erp.git
cd bondok-pos-erp

# Start with Docker
cp .env.example .env
docker-compose up -d

# Or manual start
cd backend && npm install && npx prisma migrate dev && npm run dev
cd frontend && npm install && npm run dev
```

## 📋 Features

- Multi-branch security with dynamic branch selection
- POS cashier screen with product grid and cart
- Server-side pricing (never trusts client prices)
- Atomic order numbering (Database-safe counter)
- Inventory management with stock movements
- Cash register management with variance tracking
- HR module (Leaves, Advances, Penalties, Rewards, Shifts)
- Payroll engine with salary calculations
- Recipe/Food cost management
- Waste management
- Expense management
- Purchasing and supplier management
- Customer management with loyalty points
- 10+ report types with Excel exports
- Real-time notifications via Socket.io
- Audit logging
- CI/CD pipeline (GitHub Actions)

## 📊 Database Schema

31 database tables including:
- Multi-tenant (Company, Branch)
- Users & RBAC (8 roles)
- Products with variants, modifiers, combos, recipes
- Inventory with warehouses and stock levels
- Orders with items, payments, split/merge
- Cash register with movements
- HR: Leaves, Advances, Penalties, Rewards, Shifts
- Payroll items
- Purchasing with supplier payments
- Waste, Expenses, Notifications
- Audit logs

## 🧪 Testing

```bash
cd backend && npm test
# 52 tests across 7 test files
```

## 🔒 Security

- Helmet.js headers
- Rate limiting
- CORS configuration
- JWT with refresh tokens
- 2FA support
- Argon2id password hashing
- Branch-level data isolation
- Company/tenant scoping
- Server-side price verification
- Input validation (Zod)
- Audit logging

## 📦 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS |
| State | Zustand, React Query (TanStack) |
| Charts | Recharts |
| Backend | Express, TypeScript, Prisma ORM |
| Database | PostgreSQL 16 |
| Cache | Redis 7 |
| Auth | JWT, Argon2id, OTPLib (2FA) |
| Real-time | Socket.io |
| Validation | Zod |
| Testing | Vitest |
| Reports | ExcelJS |
| CI/CD | GitHub Actions |
| Containers | Docker, docker-compose |