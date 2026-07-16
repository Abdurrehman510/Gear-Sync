<div align="center">

<br/>

<img src="public/assets/images/logo.png" alt="GearSync Logo" width="180"/>

<br/>

# GearSync

### Enterprise-Grade Auto Maintenance, Dispatch & Booking Platform

A high-performance, production-grade automotive service booking, scheduling, and management system built for vehicle servicing networks and independent workshop groups. Built on **Next.js App Router**, **TypeScript**, and **MongoDB Atlas**, it automates booking lifecycles, dispatcher scheduling, customer reviews, and administrative business analytics.

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
- [Enterprise Features](#enterprise-features)
- [Tech Stack](#tech-stack)
- [System Architecture](#system-architecture)
- [Database Schema](#database-schema)
- [API Reference](#api-reference)
- [Security & Compliance](#security--compliance)
- [Production SEO & Performance](#production-seo--performance)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)
- [About the Author](#about-the-author)

---

## Overview

**GearSync** is a custom, commercial-grade scheduling and business administration portal designed for car service stations and auto mechanics. It streamlines customer onboarding, manages service menus, prevents time-slot conflicts, and aggregates business metrics. 

By utilizing **Next.js Route Handlers** for the backend API, the application is self-contained, light, and optimized for serverless deployments on platforms like Vercel.

---

## Enterprise Features

### 👤 Identity & Access Control (RBAC)
- **Bcrypt Encrypted Authentication**: Secured with 10 salt rounds.
- **Secure JWT Sessions**: Handled via server-side HttpOnly, SameSite=Strict, Secure-flagged cookies to prevent XSS/CSRF exploits.
- **Role-Based Access Control**: Scoped views and database writes for `customer`, `mechanic`, and `admin` roles.
- **Admin Self-Lockout Safety**: Automated locks prevent admins from accidentally downgrading their roles or deleting their profiles.

### 📅 Smart Scheduling Engine
- **Live Conflict Resolution**: Direct checks on active appointments block double-bookings.
- **1-Hour Immediate Time Buffer**: Filters slots dynamically based on the current system time to block past or late same-day slots.
- **Pre-Selected Service Funnel**: Query-parameter routing links specific catalog listings straight into booking steps.

### 📊 Administrative Console
- **Business Performance KPIs**: Live cards tracking total appointments, aggregate revenues, total customers, and active mechanics.
- **Mongo Aggregations**: Pipelines group appointments by status, summarize completed service revenues, and list popular services.
- **Interactive Management Grids**: Custom dashboards for service menu CRUD, dispatcher status updates, mechanic assignments, and client role controls.

### ⭐ Verified Customer Reviews
- **Verified Purchase Gate**: restrains review inputs to customers who have an appointment marked as `completed` for that service.
- **Rating Matrix**: 1-5 star ratings paired with descriptive comments (Zod-validated).

---

## Tech Stack

- **Framework**: Next.js 16.2.10 (App Router, Turbopack)
- **Language**: TypeScript 5.x (strict-mode)
- **Database**: MongoDB Atlas via Mongoose 9.x
- **Authentication**: JWT (`jsonwebtoken`) & `bcryptjs`
- **Validation**: Zod 4.x
- **Icons & Animation**: `lucide-react`, `canvas-confetti`
- **Styling**: Vanilla CSS (modular design system with custom HSL variables)
- **SEO & PWA**: Schema.org JSON-LD scripts, dynamic sitemaps, robots.txt, `manifest.ts`

---

## System Architecture

```
Client Browsers
   │
   ├── Next.js App Router (React Server & Client Components)
   │     ├── Pages (Client-side interactivity via 'use client')
   │     ├── Global Layouts (Navbar, Footer, Sidebar)
   │     └── Route Handlers (/api/...)
   │           ├── Auth Cookie Verifications (JWT)
   │           ├── Zod Body Parsing
   │           └── Database Operations (Mongoose ORM)
   │
   └── MongoDB Atlas Database Clusters
```

---

## Database Schema

- **User**: Name, email, hashed password, and authorization role (`customer` | `mechanic` | `admin`).
- **Service**: Service name, category, pricing, duration (in minutes), description, and graphic assets.
- **Appointment**: Customer reference, service, assigned mechanic, target date, slot selection, and status lifecycle.
- **Review**: Customer link, service link, numerical rating, and text comments.

---

## API Reference

All requests expect and return JSON payloads. Session cookies must be present for protected endpoints.

### Authentication
`POST /api/auth/register` • `POST /api/auth/login` • `POST /api/auth/logout` • `GET /api/auth/me`

### Services Management
`GET /api/services` (Lists menu/seeds database) • `POST /api/services` (Admin only) • `GET/PUT/DELETE /api/services/[id]`

### Appointments Dispatcher
`GET /api/appointments` • `POST /api/appointments` (Book slot) • `GET/PUT/DELETE /api/appointments/[id]` • `GET /api/appointments/slots` (Check slots)

### Customer Reviews
`GET /api/reviews` (Fetch catalog item reviews) • `POST /api/reviews` (Post verified review)

### Business Administration
`GET /api/stats` (KPI analytics, Admin only) • `GET /api/users` • `PUT/DELETE /api/users/[id]`

---

## Security & Compliance

- **HTTP-Only Cookies**: JWT tokens are inaccessible to browser scripts, stopping XSS injection attacks.
- **Cross-Site Request Protection**: SameSite=Strict cookies shield database writes.
- **Input Validation**: Zero body/query data is accepted without passing through structured Zod schema checks.
- **Data Encapsulation**: Password variables are marked with `select: false` to ensure credentials do not leave the database.

---

## Production SEO & Performance

- **Structured JSON-LD**: Homepage renders `AutoRepair` (LocalBusiness) schema; dynamic service detail pages output `Service` schema.
- **Dynamic Sitemap**: Dynamic sitemap script (`sitemap.ts`) joins static routes and live Mongo service records automatically.
- **Crawl Indexing**: `robots.txt` guidelines block indexing of dashboard, admin, and backend `/api/` paths.
- **PWAs ready**: `manifest.webmanifest` configuration maps icon sets, standalone displays, and brand theme accents.

---

## About the Author

**Abdurrehman Narmawala**  
*Founder & Enterprise Architect*  

I am the founder of an IT Consulting & Digital Transformation firm specializing in building high-performance, enterprise-grade web applications, custom SaaS architectures, AI integrations, automated workflows, and robust business software. 

We partner with organizations to modernize their legacy operations, scale their digital infrastructure, and launch market-disrupting software products with absolute quality. 

### Let's Collaborate
Are you looking to build a high-performance web platform, optimize your digital operations, or launch a custom SaaS product? We handle paid consulting, architecture design, and end-to-end software development. 

*   🌐 **Portfolio & Case Studies**: [abdurrehman.co.in](https://abdurrehman.co.in)
*   📧 **Direct Inquiry**: [abdurrehmannarmawala510@gmail.com](mailto:abdurrehmannarmawala510@gmail.com)
*   💼 **LinkedIn**: [in/abdurrehman-narmawala](https://linkedin.com/in/abdurrehman-narmawala)
*   🐙 **GitHub**: [github.com/Abdurrehman510](https://github.com/Abdurrehman510)
*   📞 **Telephone**: Available upon request / via Portfolio contact
