<div align="center">

<br/>

<img src="public/assets/images/logo.png" alt="GearSync Brand Logo" width="220"/>

# GearSync

### Enterprise-Grade Auto Service Management, Dispatch & Real-Time Booking Platform

*A production-ready SaaS solution engineered to automate booking workflows, streamline mechanic dispatch, and provide data-driven business insights for auto repair networks and workshop chains.*

<br/>

[![Next.js](https://img.shields.io/badge/Next.js-16.2.10-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![MongoDB Atlas](https://img.shields.io/badge/MongoDB_Atlas-7.0-47a248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)
[![Mongoose](https://img.shields.io/badge/Mongoose-9.0-880000?style=for-the-badge&logo=mongoose&logoColor=white)](https://mongoosejs.com)
[![React](https://img.shields.io/badge/React-19.0-61dafb?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Zod](https://img.shields.io/badge/Zod-4.0-3068b7?style=for-the-badge&logo=zod&logoColor=white)](https://zod.dev)

</div>

---

## 🎯 The Business Challenge & The Solution

### The Challenge
Modern automotive repair chains and independent workshops face significant operational bottlenecks. Manual booking processes result in scheduling conflicts, double-booked mechanics, and customer dissatisfaction. Additionally, unverified online reviews damage reputation, while a lack of real-time analytics makes it difficult for owners to track revenue, evaluate service performance, and manage workforce capacity.

### The GearSync Solution
**GearSync** addresses these bottlenecks with an automated, self-contained scheduling and resource management portal. It connects customers, mechanics, and administrators in a single workspace:
- **Customers** get an interactive booking engine with real-time slot verification.
- **Mechanics** receive structured scheduling pipelines.
- **Administrators** leverage aggregated dashboards for mechanic dispatch, catalog control, and business metrics.

---

## 🌟 Platform Capabilities

### 📅 Smart Booking Engine
- **Live Slot Conflict Resolution**: Real-time queries check active appointments on the database, disabling booked slots instantly.
- **Same-Day 1-Hour Time Buffer**: A validation mechanism checks the current time for same-day appointments, blocking past or imminent slots (`09:00 AM`, `11:00 AM`, `02:00 PM`, `04:00 PM`) to protect mechanic prep time.
- **Pre-Selected Entry Funnel**: Clicking any card in the public services catalog links directly to the booking form with the service pre-selected.
- **Interactive Steps**: Includes calendar date constraints and a success celebration animated by `canvas-confetti`.

### 👥 Customer Workspace
- **Personal Booking Ledger**: Transparent tracking of active and historical service records.
- **Color-Coded Status Lifecycles**: Visual badges tracking job progress: `Pending` ➔ `Confirmed` ➔ `In-Progress` ➔ `Completed` ➔ `Cancelled`.
- **Instant Cancellations**: Customers can cancel pending bookings instantly.
- **Verified Review Gateway**: Prevents fake feedback by allowing reviews only for services the customer has booked and completed.

### 📊 Administrative Command Center
- **Performance KPI Cards**: Real-time business metrics tracking total revenue, aggregate appointments, total customer accounts, and active mechanics.
- **Interactive Dispatcher**: Drag-and-drop style controls to assign mechanics and update appointment progress.
- **Global Catalog CRUD**: Panel to edit descriptions, pricing, duration, and asset paths for the service menu.
- **Access Control Panel**: Interface to modify user roles (`customer`, `mechanic`, `admin`) and handle profile removals.

---

## 🛠 Tech Stack & Dependencies

*   **Core Framework**: Next.js 16.2.10 (App Router, Turbopack compilation)
*   **Programming Language**: TypeScript 5.x (Strict-mode configuration)
*   **Database & ORM**: MongoDB Atlas, Mongoose 9.x
*   **Authentication**: JWT (`jsonwebtoken` 9.x) & `bcryptjs` 3.x
*   **Request & Schema Validation**: Zod 4.x
*   **Icons & UI Assets**: `lucide-react`, Google Fonts (Chakra Petch, Mulish)
*   **Client Animation**: `canvas-confetti`
*   **Styling**: Vanilla CSS Modules (custom HSL variables, fluid typography, dark mode presets)

---

## 🏗 System Architecture & Design Patterns

### Unified Next.js API Routes (Serverless-Ready)
Instead of running a separate Express.js server, GearSync uses Next.js Route Handlers. This design choice simplifies deployment, eliminates cross-origin configuration issues, reduces cold starts, and keeps the code unified in a single repository.

### Cached Database Connections
To prevent connection leaks during serverless hot-reloads, GearSync uses a cached Mongoose connection pattern:

```typescript
// Maintains a single connection across hot-reloads in development
let cached = global.mongooseCached;
if (!cached) {
  cached = global.mongooseCached = { conn: null, promise: null };
}
```

### Database Entity Relationship Model

```
 ┌──────────────┐             ┌─────────────────┐
 │     User     │◄───────────┤   Appointment   │
 └──────────────┘             └────────┬────────┘
        ▲                              │
        │                              ▼
 ┌──────┴───────┐             ┌─────────────────┐
 │    Review    │────────────►│     Service     │
 └──────────────┘             └─────────────────┘
```

---

## 🔒 Security & Data Integrity

-   **JWT Session Cookies**: Authentication tokens are stored in HttpOnly, SameSite=Strict, Secure-flagged cookies, protecting them from XSS reads and CSRF writes.
-   **Server-Side RBAC Guards**: Every protected route checks session tokens on the server, ignoring client-side claims.
-   **Schema-First Sanitization**: Zod validation blocks invalid request payloads before they reach database models.
-   **Data Leak Protections**: Hashed passwords are set to `select: false` in the Mongoose schema, preventing credentials from being exposed in API responses.
-   **Lockout Safety Controls**: Scripted checks prevent administrators from deleting their own profiles or changing their own roles.

---

## 📈 SEO & Production Optimizations

-   **Dynamic Sitemap Generation**: `/sitemap.xml` queries MongoDB Atlas, joining static routes and dynamic service page links (`/services/[id]`) with their last-modified dates.
-   **Crawl Exclusions**: `/robots.txt` blocks crawler bots from private pages (`/admin/*`, `/dashboard/*`, `/api/*`) while indexing public service pages.
-   **Structured Schema.org Metadata**:
    *   **Homepage**: Injects `AutoRepair` (LocalBusiness) schema (hours, location, phone, price levels).
    *   **Dynamic Pages**: Injects `Service` schema (prices, descriptions, verified reviews) to display rich search result snippets.
-   **PWA Installability**: `/manifest.webmanifest` maps touch icons and standalone launch settings, allowing the platform to be installed on mobile and desktop.

---

## ⚙ Local Configuration & Setup

### Prerequisites
- Node.js 20.x or higher
- A MongoDB Atlas connection string (or a local MongoDB instance)

### 1. Clone & Install
```bash
git clone https://github.com/Abdurrehman510/Gear-Sync.git
cd Gear-Sync
npm install
```

### 2. Configure Environment Variables
Create a `.env.local` file in the root directory:
```env
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_signature_secret_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Run the Development Server
```bash
npm run dev
```

### 4. Onboard Administrator
Register at `http://localhost:3000/register`. The first registered profile is automatically granted the `admin` role. The services catalog seeds itself with 5 default services on the first API request.

---

## 🚀 Business Roadmap

- [ ] **Stripe Payment Gateway**: Online prepayments and deposit holds for scheduled bookings.
- [ ] **SMS Integration**: Automated booking notifications and mechanic reminders via Twilio.
- [ ] **Mechanic Dashboard**: Custom views for assigned tasks, schedule logs, and timesheet check-ins.
- [ ] **Live Chat**: Connects clients and mechanics on the job.

---

## 👨‍💻 About the Developer

**Abdurrehman Narmawala**  
*Founder & Lead Software Architect*  

I build high-performance web applications, custom SaaS platforms, automated workflows, and software solutions for digital transformation. I partner with businesses to modernize legacy operations, scale digital infrastructure, and launch production-ready products.

### Let's Collaborate
Need custom web architecture, consulting, or full-stack software development? I handle paid projects and technical consulting.

- 🌐 **Portfolio & Case Studies**: [abdurrehman.co.in](https://abdurrehman.co.in)
- 📧 **Direct Inquiry**: [abdurrehmannarmawala510@gmail.com](mailto:abdurrehmannarmawala510@gmail.com)
- 💼 **LinkedIn Profile**: [/in/abdurrehman-narmawala](https://linkedin.com/in/abdurrehman-narmawala)
- 🐙 **GitHub Space**: [/Abdurrehman510](https://github.com/Abdurrehman510)
- 📞 **Phone Details**: Available upon request / via Portfolio contact page
