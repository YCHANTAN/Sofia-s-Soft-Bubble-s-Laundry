# Laundry Management Information System (LMIS)
## Project Setup Instructions & CLI Prompts

This guide outlines the terminal commands, folder architecture, and core functionalities required to build the LMIS for Sofia’s Soft Bubble’s Laundry Shop. 

### Tech Stack
*   **Frontend:** React, TypeScript, Tailwind CSS (for rapid UI styling)
*   **Backend:** Node.js, Express, TypeScript
*   **Database:** PostgreSQL

---

## 1. Initial Project Scaffolding

Open your terminal and execute the following commands to create the root directory and set up the separate frontend and backend workspaces.

```bash
# Create the root project directory
mkdir sofias-lmis
cd sofias-lmis

# -----------------------------
# FRONTEND SETUP (Vite + React + TS)
# -----------------------------
npm create vite@latest frontend -- --template react-ts
cd frontend

# Install core dependencies and Tailwind CSS 
npm install
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Install routing and state management (optional but recommended)
npm install react-router-dom axios lucide-react

cd ..

# -----------------------------
# BACKEND SETUP (Node + Express + TS)
# -----------------------------
mkdir backend
cd backend
npm init -y

# Install Express and core backend dependencies
npm install express cors dotenv pg

# Install TypeScript and Dev Dependencies
npm install -D typescript @types/node @types/express @types/cors ts-node-dev

# Initialize TypeScript config
npx tsc --init
```

---

## 2. Proposed Folder Structure

A well-organized folder structure is critical for maintainability as the application grows.

### Backend (`/backend`)
We will use a standard Controller-Service-Route architecture.

```text
backend/
├── src/
│   ├── config/           # Database connections and environment variables
│   │   └── db.ts         # PostgreSQL connection pool setup
│   ├── controllers/      # Route handlers (req, res logic)
│   │   ├── authController.ts
│   ├── middleware/       # Custom middleware (auth, error handling)
│   │   └── auth.ts
│   ├── models/           # DB queries or ORM models
│   │   ├── customerModel.ts
│   ├── routes/           # Express route definitions
│   │   ├── customerRoutes.ts
│   │   └── orderRoutes.ts
│   ├── services/         # Business logic (e.g., SMS notification triggers)
│   │   └── notificationService.ts
│   ├── utils/            # Helper functions
│   └── index.ts          # Entry point (Express app setup)
├── .env                  # Environment variables (DB URI, Ports)
├── package.json
└── tsconfig.json
```

### Frontend (`/frontend`)
Organized by features/pages for modularity.

```text
frontend/
├── src/
│   ├── assets/           # Images, logos (e.g., Soft Bubble logo)
│   ├── components/       # Reusable UI components
│   │   ├── common/       # Buttons, Inputs, Modals
│   │   └── layout/       # Sidebar, Header, PageWrapper
│   ├── features/         # Domain-specific components
│   │   ├── auth/         # Login forms
│   │   ├── customers/    # Customer list, Add customer form
│   │   └── orders/       # Kanban board, Order cards
│   ├── hooks/            # Custom React hooks (e.g., useAuth, useOrders)
│   ├── pages/            # Top-level page components
│   │   ├── Dashboard.tsx # Staff Kanban / Admin Metrics
│   │   ├── Customers.tsx
│   │   └── Login.tsx
│   ├── services/         # API call configurations (Axios instances)
│   │   └── api.ts
│   ├── types/            # TypeScript interfaces/types
│   │   └── index.ts
│   ├── App.tsx           # Main router setup
│   └── main.tsx          # React DOM render
├── index.html
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

---

## 3. PostgreSQL Database Setup (CLI)

Ensure PostgreSQL is installed and running. Use `psql` to create the database and tables.

```sql
-- Open psql terminal
psql -U postgres

-- Create Database
CREATE DATABASE sofias_lmis;
\c sofias_lmis;

-- Create Users Table (Admin & Staff)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL -- 'admin' or 'staff'
);

-- Create Customers Table
CREATE TABLE customers (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Orders Table
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    customer_id INT REFERENCES customers(id),
    weight_kg DECIMAL(5,2) NOT NULL,
    service_type VARCHAR(50) NOT NULL, -- e.g., 'Wash & Dry', 'Dry Only'
    status VARCHAR(20) DEFAULT 'Pending', -- 'Pending', 'Washing', 'Drying', 'Ready', 'Completed'
    total_amount DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 4. Core Functionalities & Implementation Checklist

Based on the LMIS Executive Summary, here is the feature checklist for the CLI and logic implementation:

### [ ] 1. Authentication & Security (Admin vs. Staff)
*   **Backend:** Implement JWT (JSON Web Tokens) in `authController.ts` for login. Create a middleware `auth.ts` to protect routes.
*   **Frontend:** Create `Login.tsx` and store the JWT securely. Redirect users based on their role (Admin -> Analytics, Staff -> Orders).

### [ ] 2. Customer Information Management
*   **Backend:** Create CRUD (Create, Read, Update, Delete) routes in `customerRoutes.ts`.
*   **Frontend:** Build a searchable data table in `Customers.tsx`. Use a debounced search input to query the database by name or phone number.

### [ ] 3. Laundry Order Tracking (Kanban Board)
*   **Backend:** Create a `PATCH /orders/:id/status` endpoint to update the `status` column in the database.
*   **Frontend:** In `Dashboard.tsx`, implement a Kanban-style layout with columns (Pending, Washing, Drying, Ready). Use local state to handle drag-and-drop or click-to-move functionality, triggering the PATCH request on drop.

### [ ] 4. Smart Notification System (Simulated/Integrated)
*   **Backend:** In `orderController.ts`, add a hook: when an order status is updated to `'Ready'`, trigger `notificationService.ts`. This service can integrate with a third-party SMS API (like Twilio or Semaphore) to send the "Ready for pickup" text.

### [ ] 5. Automated Financial Ledger (Report Generation)
*   **Backend:** Create an analytics endpoint (`GET /reports/revenue`) that runs SQL aggregations (e.g., `SUM(total_amount)`) grouped by day, week, and month.
*   **Frontend:** Display these metrics in the Admin Dashboard using a charting library (like Recharts) to visualize daily income.
