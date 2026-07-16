<div align="center">

<br/>

<img src="public/assets/images/logo.png" alt="GearSync Logo" width="180"/>

<br/>

# GearSync

### Premium Auto Maintenance & Booking Platform

A **production-grade**, full-stack car service booking and management system built with the **MERN stack** and **Next.js App Router**. Customers can browse services, book appointments, and leave verified reviews. Administrators get a full command dashboard for managing bookings, mechanics, services, users, and live revenue analytics.

<br/>

[![Next.js](https://img.shields.io/badge/Next.js-16.2.10-black?logo=next.js&logoColor=white)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![MongoDB](https://img.shields.io/badge/MongoDB_Atlas-7.x-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)
[![Mongoose](https://img.shields.io/badge/Mongoose-9.x-880000)](https://mongoosejs.com)
[![React](https://img.shields.io/badge/React-19.x-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![Zod](https://img.shields.io/badge/Zod-4.x-3068B7)](https://zod.dev)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

</div>

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [API Reference](#api-reference)
- [Pages & Screens](#pages--screens)
- [Security](#security)
- [SEO & Performance](#seo--performance)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)

---

## Overview

**GearSync** is a complete, real-world automotive service platform transformed from a static HTML template into a fully functional MERN stack application using **Next.js App Router**, **TypeScript**, and **MongoDB Atlas**. It is architected to industry standards and is deployment-ready for production.

Key product pillars:
- **Secure Authentication** — JWT sessions inside HttpOnly cookies with role-based access control (RBAC)
- **Smart Booking Engine** — Real-time slot availability with conflict prevention and same-day time-buffer logic
- **Verified Reviews** — Customers can only submit feedback on services they have had completed
- **Admin Analytics** — Live revenue aggregation, status distributions, and mechanic dispatch tools
- **Production SEO** — Dynamic sitemap, robots.txt, Schema.org JSON-LD, and Open Graph metadata
- **PWA Installable** — Fully configured web manifest for mobile and desktop installations

---

## Features

### Authentication & Authorization
- [x] User registration with Bcrypt password hashing (salt rounds: 10)
- [x] JWT-based session authentication (7-day expiry)
- [x] Secure HttpOnly, SameSite=Strict, Secure-flagged session cookies
- [x] Three distinct roles: `customer`, `mechanic`, `admin`
- [x] First registered user is automatically elevated to `admin`
- [x] Role-based API route guards enforced server-side on every protected endpoint

### Services Catalog
- [x] Browse the full services grid with category badges, pricing, and duration
- [x] Search and filter services by name or category
- [x] Service detail pages with description, pricing, and integrated review section
- [x] Admin CRUD interface to create, update, and delete services
- [x] Automatic database seeding of 5 default services on first catalog request (if empty)

### Appointment Booking Engine
- [x] Multi-step booking funnel: Select service → Choose date → Pick time slot → Add notes
- [x] Date picker with `min` constraint preventing selection of past dates
- [x] Real-time slot availability check via `/api/appointments/slots`
- [x] Four available daily time slots: `09:00 AM`, `11:00 AM`, `02:00 PM`, `04:00 PM`
- [x] 1-hour same-day buffer: past or imminent slots are automatically disabled
- [x] Pre-selection from the services catalog page via `?serviceId=` URL parameter
- [x] `canvas-confetti` celebration animation on successful booking

### Customer Dashboard
- [x] Personal appointments table with full booking details (service, date, time, status)
- [x] Colour-coded status badges: `pending`, `confirmed`, `in-progress`, `completed`, `cancelled`
- [x] One-click cancellation for `pending` appointments
- [x] Inline review submission form for `completed` appointments
- [x] 1-5 star rating input with text comment field

### Admin Control Panel
- [x] **Overview Dashboard** — KPI cards: total bookings, revenue, customers, mechanics
- [x] **Appointment Status Distribution** — Counts per status
- [x] **Popular Services** — Top 3 most-booked services with booking counts
- [x] **Recent Bookings** — Last 5 appointments with customer name, service, and status
- [x] **Appointments Manager** — Full appointment table with inline status updates and mechanic assignment
- [x] **Services Manager** — Create, edit, and delete service catalog entries
- [x] **Users Manager** — View all users, change roles, delete accounts
- [x] Self-lockout prevention: admins cannot change their own role or delete their own account

### Reviews System
- [x] Public review listings on each service detail page
- [x] Verified buyer gate: only customers with a `completed` appointment for that service can leave a review
- [x] 1-5 star rating + freeform comment (min 5 characters, max 1,000)
- [x] Duplicate review prevention per customer per service

### Admin Analytics (via `/api/stats`)
- [x] Total appointment count
- [x] Total revenue from completed appointments (MongoDB populate + reduce)
- [x] Customer and mechanic user counts
- [x] Status distribution via MongoDB `$group` aggregation pipeline
- [x] Top 3 popular services via `$group -> $sort -> $limit` aggregation pipeline
- [x] Last 5 recent bookings with populated customer and service references

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16.2.10 (App Router, Turbopack) |
| **Language** | TypeScript 5.x (strict mode) |
| **Database** | MongoDB Atlas via Mongoose 9.x |
| **Authentication** | `jsonwebtoken` (JWT) + `bcryptjs` |
| **Validation** | Zod 4.x |
| **UI Icons** | `lucide-react` |
| **Animations** | `canvas-confetti` |
| **Styling** | Vanilla CSS (CSS variables, custom design tokens) |
| **Typography** | Google Fonts: Chakra Petch + Mulish |
| **SEO** | Next.js Metadata API, Schema.org JSON-LD |
| **PWA** | Next.js `manifest.ts` Web App Manifest |

---

## Architecture

```
Browser
  |
  +-- Next.js App Router (React Server & Client Components)
  |     +-- Page Components (Client-side: 'use client')
  |     +-- Layout Components (Navbar, Footer, Sidebar)
  |     +-- Route Handlers (/api/...)
  |           +-- Authentication Middleware (getAuthenticatedUser)
  |           +-- Zod Request Validation
  |           +-- Mongoose ORM Queries
  |
  +-- MongoDB Atlas
        +-- users
        +-- services
        +-- appointments
        +-- reviews
```

**Design Decisions:**
- **No separate Express server.** All backend logic is handled by Next.js Route Handlers in a single repository.
- **Cached Mongoose connections** using `global.mongooseCached` to prevent connection leaks during serverless hot-reloads.
- **Server-side RBAC** on every protected route — roles are verified from the JWT inside the HttpOnly cookie only.
- **Zod validation as the first gate** — all incoming bodies are parsed and validated before any database query.

---

## Project Structure

```
Gear-Sync/
+-- public/
|   +-- assets/images/         # Static image assets (logo, services, backgrounds)
|   +-- favicon.ico            # GearSync browser favicon
|   +-- icon-192.png           # PWA icon 192x192
|   +-- icon-512.png           # PWA icon 512x512
|
+-- src/
|   +-- app/
|   |   +-- api/
|   |   |   +-- auth/          # register, login, logout, me
|   |   |   +-- appointments/  # CRUD + slots availability
|   |   |   +-- reviews/       # GET + POST (verified buyer)
|   |   |   +-- services/      # CRUD + auto-seeding
|   |   |   +-- stats/         # Admin analytics aggregation
|   |   |   +-- users/         # Admin user management
|   |   +-- admin/             # Admin portal pages
|   |   +-- book/              # Booking funnel
|   |   +-- dashboard/         # Customer dashboard
|   |   +-- login/             # Sign-in page
|   |   +-- register/          # Registration page
|   |   +-- services/          # Catalog + detail pages
|   |   +-- globals.css        # Global CSS design system
|   |   +-- layout.tsx         # Root layout + metadata
|   |   +-- manifest.ts        # PWA manifest
|   |   +-- page.tsx           # Homepage
|   |   +-- robots.ts          # Crawler policy
|   |   +-- sitemap.ts         # Dynamic XML sitemap
|   |
|   +-- components/
|   |   +-- Footer.tsx
|   |   +-- Navbar.tsx
|   |   +-- ServiceCard.tsx
|   |   +-- Sidebar.tsx
|   |   +-- Toast.tsx
|   |
|   +-- lib/
|       +-- models/            # Mongoose schemas (User, Service, Appointment, Review)
|       +-- auth.ts            # JWT + bcrypt + cookie helpers
|       +-- db.ts              # Cached Mongoose connection
|       +-- logger.ts          # Structured server logger
|       +-- validation.ts      # Zod validation schemas
|
+-- .env.local                 # Create this locally (see below). Not committed.
+-- .gitignore
+-- next.config.ts
+-- package.json
+-- tsconfig.json
```

---

## Database Schema

### User
| Field | Type | Notes |
|---|---|---|
| `name` | String | Required, max 50 chars |
| `email` | String | Required, unique, lowercase |
| `password` | String | Bcrypt hashed, excluded from queries by default |
| `role` | Enum | `customer`, `mechanic`, or `admin` |
| `createdAt` / `updatedAt` | Date | Mongoose timestamps |

### Service
| Field | Type | Notes |
|---|---|---|
| `name` | String | Required, unique, max 100 chars |
| `description` | String | Required, max 1,000 chars |
| `price` | Number | Required, min 0 |
| `duration` | Number | In minutes, min 10, default 60 |
| `category` | String | Required |
| `image` | String | Asset path, defaults to `services-1.png` |

### Appointment
| Field | Type | Notes |
|---|---|---|
| `customer` | ObjectId -> User | Required |
| `service` | ObjectId -> Service | Required |
| `mechanic` | ObjectId -> User | Optional, assigned by admin |
| `date` | Date | Required |
| `timeSlot` | Enum | `09:00 AM`, `11:00 AM`, `02:00 PM`, `04:00 PM` |
| `status` | Enum | `pending`, `confirmed`, `in-progress`, `completed`, `cancelled` |
| `notes` | String | Optional, max 500 chars |

### Review
| Field | Type | Notes |
|---|---|---|
| `customer` | ObjectId -> User | Required |
| `service` | ObjectId -> Service | Required |
| `rating` | Number | 1-5 stars, required |
| `comment` | String | Required, min 5, max 1,000 chars |
| `createdAt` | Date | Auto-set |

---

## API Reference

All API routes return JSON. Authentication is enforced via server-side JWT cookie validation.

### Auth

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register a new user |
| `POST` | `/api/auth/login` | Public | Login and receive session cookie |
| `POST` | `/api/auth/logout` | Authenticated | Clear the session cookie |
| `GET` | `/api/auth/me` | Authenticated | Return current user from session |

### Services

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/services` | Public | List all services (seeds DB if empty) |
| `POST` | `/api/services` | Admin | Create a new service |
| `GET` | `/api/services/[id]` | Public | Get a single service |
| `PUT` | `/api/services/[id]` | Admin | Update a service |
| `DELETE` | `/api/services/[id]` | Admin | Delete a service |

### Appointments

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/appointments` | Authenticated | Customers: own bookings. Admins: all bookings |
| `POST` | `/api/appointments` | Customer | Create a new booking |
| `GET` | `/api/appointments/[id]` | Authenticated | Get a single appointment |
| `PUT` | `/api/appointments/[id]` | Admin | Update status or assign mechanic |
| `DELETE` | `/api/appointments/[id]` | Customer/Admin | Cancel (customer: own pending only) |
| `GET` | `/api/appointments/slots` | Authenticated | Get available slots for a date + service |

### Reviews

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/reviews` | Public | Get reviews for a service (`?serviceId=`) |
| `POST` | `/api/reviews` | Customer | Submit a review (verified buyer required) |

### Admin

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/stats` | Admin | Revenue, counts, distributions, top services |
| `GET` | `/api/users` | Admin | List all users |
| `PUT` | `/api/users/[id]` | Admin | Change a user's role |
| `DELETE` | `/api/users/[id]` | Admin | Delete a user (self-deletion blocked) |

---

## Pages & Screens

| Route | Screen | Access |
|---|---|---|
| `/` | Homepage: hero, services preview, about & stats counters | Public |
| `/services` | Services catalog with search and filter | Public |
| `/services/[id]` | Service detail + reviews + booking CTA | Public |
| `/book` | Multi-step booking funnel with real-time slot picker | Authenticated |
| `/login` | Sign-in form | Public |
| `/register` | Registration form | Public |
| `/dashboard` | Customer appointments, cancellation, and review submission | Authenticated |
| `/admin` | Admin overview: KPIs + popular services + recent bookings | Admin |
| `/admin/appointments` | Full appointment table with status dispatch | Admin |
| `/admin/services` | Service CRUD form and management table | Admin |
| `/admin/users` | User table with role management | Admin |

---

## Security

| Mechanism | Implementation |
|---|---|
| Password hashing | `bcryptjs` with 10 salt rounds |
| Session tokens | JWT signed with `JWT_SECRET`, 7-day expiry |
| Cookie security | `HttpOnly`, `Secure` (production only), `SameSite=Strict` |
| Input validation | Zod schemas on every API route before any DB access |
| Role enforcement | Server-side RBAC via `getAuthenticatedUser(roles[])` |
| Admin self-lockout guard | Admin cannot delete or downgrade their own account |
| Secrets management | All credentials in `.env.local`, excluded from git |

---

## SEO & Performance

| Feature | Implementation |
|---|---|
| Page metadata | `export const metadata` on every page and layout |
| Open Graph | Title, description, and hero image in `layout.tsx` |
| Dynamic sitemap | `/sitemap.xml` — pulls live service IDs from MongoDB Atlas |
| Robots policy | `/robots.txt` — blocks `/admin/`, `/dashboard/`, `/api/` |
| Schema.org JSON-LD | `AutoRepair` (LocalBusiness) on homepage; `Service` on detail pages |
| PWA manifest | `/manifest.webmanifest` — standalone display, dark navy theme, GearSync icons |
| PWA icons | `icon-192.png` and `icon-512.png` in `/public` |
| Font optimisation | Google Fonts (Chakra Petch + Mulish) via `next/font` with `display: swap` |
| Static assets | All images served from `/public/assets/images/` via root-relative URLs |
| Production build | Turbopack compilation: 26 static and dynamic routes verified |

---

## Getting Started

### Prerequisites

- Node.js 20 or higher
- A MongoDB Atlas cluster (or a local MongoDB instance)

### 1. Clone the Repository

```bash
git clone https://github.com/Abdurrehman510/Gear-Sync.git
cd Gear-Sync
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the project root:

```env
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/gearsync?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=your-strong-random-secret-key-here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> Never commit `.env.local` to version control. It is already listed in `.gitignore`.

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. First-Time Setup

1. Go to `http://localhost:3000/register` and register your first account
2. This account is **automatically granted the `admin` role**
3. The services catalog **auto-seeds** with 5 default services on the first `/api/services` request if the collection is empty

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `MONGODB_URI` | Yes | Full MongoDB Atlas connection string |
| `JWT_SECRET` | Yes | Secret key for signing and verifying JWT tokens |
| `NEXT_PUBLIC_APP_URL` | Yes | Public base URL used in sitemap and robots.txt |

---

## Deployment

### Build for Production

```bash
npm run build
npm start
```

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Import the repository at [vercel.com/new](https://vercel.com/new)
3. Set the three environment variables in the Vercel project settings
4. Click Deploy — Vercel handles serverless Next.js Route Handlers automatically

### Deploy to Other Platforms

The app runs on any platform supporting Node.js (Railway, Render, AWS, DigitalOcean App Platform, etc.). Ensure environment variables are configured and MongoDB Atlas Network Access allows connections from the host IP.

---

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start the development server with Turbopack |
| `npm run build` | Compile an optimised production build |
| `npm start` | Serve the production build |
| `npm run lint` | Run ESLint across the codebase |

---

<div align="center">

Built with love by [Abdurrehman510](https://github.com/Abdurrehman510)

</div>
