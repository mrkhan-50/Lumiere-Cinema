# LUMIÈRE — Experience Cinema Beyond the Screen

> **Immersive 3D Cinema & High-Concurrency Movie Ticket Booking Platform**

---

## 1. Overview

**LUMIÈRE** is a luxury movie ticketing and cinema discovery platform inspired by the visual grandeur of cinematic auditoriums and the transaction integrity of modern booking engines.

### Key Architectural Pillars:
- **Cinematic Dark Luxury Design:** Deep obsidian backgrounds (`#080808`, `#141414`), champagne gold accents (`#D4AF37`), cinematic crimson (`#B91C1C`), Cinzel typography, and glassmorphism.
- **Relational Data Integrity:** Normalized Prisma schema for PostgreSQL with zero-drift minor currency units (paise) to eliminate floating-point rounding errors.
- **Concurrency-Safe Seat Reservation:** 5-minute atomic seat holds with in-memory mutex and database lease expiration to prevent double-booking.
- **Role-Based Authentication:** Bcrypt password hashing, signed JWT HTTP-only cookies, and RBAC (`ADMIN`, `CINEMA_STAFF`, `USER`).

---

## 2. Tech Stack

- **Framework:** Next.js 15 (App Router), React 19, TypeScript
- **Styling:** Tailwind CSS, PostCSS, Lucide Icons
- **Database & ORM:** PostgreSQL / SQLite, Prisma ORM
- **State & Concurrency:** Zustand, Custom Mutex Lock Engine, Redis Support
- **Security & Auth:** Bcrypt.js, JsonWebToken, HTTP-only secure cookies
- **Payments:** Razorpay Test Mode integration (HMAC-SHA256 signature verification)
- **3D Visualization:** Three.js, React Three Fiber (`@react-three/fiber`), Drei (`@react-three/drei`)

---

## 3. Seed Accounts & Demo Credentials

| Role | Email | Password | Access Level |
|---|---|---|---|
| **Admin** | `admin@lumiere.com` | `Admin@123` | Full cinema management, analytics, showtime CRUD |
| **Staff** | `staff@lumiere.com` | `Staff@123` | Ticket QR scanning & gate check-in |
| **Patron** | `alex@example.com` | `Patron@123` | Seat booking, order history, VIP privileges |

---

## 4. Quick Start & Verification

### Prerequisites
- Node.js `v20+` or `v24+`
- npm `v10+`

### 1. Installation
```bash
cd C:\Users\Dell\.gemini\antigravity\scratch\lumiere-cinema
npm install --legacy-peer-deps
```

### 2. Database Setup & Seeding
```bash
# Push Prisma schema to local database
npx prisma db push

# Seed movies, screens, seats, showtimes, and demo accounts
npm run db:seed
```

### 3. Run Automated Verification Suite
```bash
npx tsx scripts/verify-phase1.ts
```

### 4. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to enter LUMIÈRE.

---

## 5. Docker Compose (PostgreSQL & Redis)
To spin up dedicated PostgreSQL and Redis instances:
```bash
docker compose up -d
npm run db:push:pg
```

---

## 6. Implementation Roadmap
- [x] **Phase 1:** Project setup, design system, database schema, seed data, authentication, seat lock engine.
- [ ] **Phase 2:** Movie discovery, multi-city filtering, cinema schedules, patron dashboard.
- [ ] **Phase 3:** Concurrency-safe seat reservation, 2D seat map, checkout with promo codes.
- [ ] **Phase 4:** Razorpay payment gateway integration, QR ticket issuance, email confirmations.
- [ ] **Phase 5:** Interactive 3D auditorium scene, camera seat-view preview, cinematic lighting.
- [ ] **Phase 6:** Executive admin dashboard, cancellation workflows, refunds, ticket scanner.
- [ ] **Phase 7:** End-to-end automated testing, performance optimizations, production hardening.
