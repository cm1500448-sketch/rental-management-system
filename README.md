# Rental Management System

A full-stack web application for managing rental properties. Built as a portfolio project to demonstrate real-world application development with a Node.js backend and React frontend.

## What it does

The system has two roles — **owner** and **tenant** — each with their own interface.

**Owners can:**
- Add and manage properties
- Add units to each property (single rooms, bedsitters, 1 bedroom, 2 bedroom, etc.)
- Record tenants and assign them to units via leases
- Track which units are occupied and by which tenant
- Add extra charges per unit per billing period (water, electricity, etc.)
- Send bills to tenants with a breakdown of rent + charges
- Review proof of payment uploaded by tenants and mark bills as paid or rejected
- View a dashboard with occupancy stats, expected vs collected rent, expiring leases, and overdue payments

**Tenants can:**
- Register using their email (must be added by the owner first)
- Log in and view their bills
- Upload proof of payment for each bill
- Track the status of their payments (pending, under review, paid, rejected)

## Tech Stack

**Backend**
- Node.js + Express
- PostgreSQL
- Knex.js (query builder + migrations)
- JWT authentication with token blacklisting
- Joi validation
- Multer for file uploads
- node-cron for automated monthly billing

**Frontend**
- React 18 + Vite
- TanStack Query (data fetching + caching)
- React Hook Form + Zod (form validation)
- Tailwind CSS
- Axios

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL

### 1. Clone the repository

```bash
git clone https://github.com/cm1500448-sketch/rental-management-system.git
cd rental-management-system
```

### 2. Set up the database

Create a PostgreSQL database:

```sql
CREATE DATABASE rental_management;
```

### 3. Configure environment variables

Create `server/.env`:

```
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/rental_management
JWT_SECRET=your_jwt_secret
PORT=3000
NODE_ENV=development
BCRYPT_ROUNDS=10
```

Create `client/.env`:

```
VITE_API_URL=http://localhost:3000
```

### 4. Install dependencies and run migrations

```bash
npm install
cd server
npm install
npx knex migrate:latest
cd ..
cd client
npm install
cd ..
```

### 5. Start the app

```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:3000

## Project Structure

```
├── client/                 # React frontend
│   └── src/
│       ├── api/            # Axios client
│       ├── components/     # Reusable UI components
│       ├── context/        # Auth context
│       ├── hooks/          # TanStack Query hooks
│       ├── pages/          # Page components
│       └── utils/          # Formatters, validators
│
└── server/                 # Express backend
    └── src/
        ├── db/             # Knex config, migrations, seeds
        ├── middleware/      # Auth, validation, error handling
        ├── modules/         # Feature modules (auth, properties, tenants, etc.)
        └── utils/          # AppError, asyncHandler, file upload
```

## Features in Detail

- **JWT authentication** with logout via token blacklist
- **Role-based access** — owners and tenants see completely different interfaces
- **Unit management** — track unit types, occupancy status, and active tenant per unit
- **Bill state machine** — bills move through `pending → under_review → paid/rejected`
- **Proof of payment** — tenants upload JPEG/PNG/PDF, owners review and approve
- **Automated billing** — cron job generates bills 5 days before month end
- **48-hour payment edit window** — payments can only be corrected within 48 hours
- **Dashboard metrics** — occupancy rate, rent collected vs expected, expiring leases, overdue tenants
