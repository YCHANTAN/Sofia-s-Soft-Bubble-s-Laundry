# Sofia's Soft Bubble's Laundry Shop - Management System

A modern, professional Laundry Management Information System (LMIS) designed for efficiency, visual appeal, and ease of use. This system features a real-time operational dashboard, financial analytics, and robust customer/staff management.

## 🌟 Key Features

### 🛒 Operations & Orders
- **Live Kanban Dashboard:** Track orders through stages (Pending → Washing → Drying → Ready → Completed).
- **Auto-Pricing:** Intelligent price calculation based on weight (standard rate: ₱33.00/kg).
- **Branded Notifications:** Integrated `react-hot-toast` for elegant, non-intrusive user feedback.
- **Custom Modals:** Professional confirmation dialogs for critical actions.

### 📊 Business Intelligence
- **Financial Analytics:** Interactive Area Charts using `Recharts` to visualize weekly revenue.
- **Transaction Integrity:** Deleting customer accounts preserves their order history as "Deleted Customer" for accurate financial reporting.
- **Audit Logging:** System-wide tracking of sensitive actions.

### 👥 User Management
- **Role-Based Access Control (RBAC):** Distinct interfaces for Admins, Staff, and Customers.
- **Staff Management:** Admins can create, edit (including passwords), and remove staff accounts.
- **Customer Portal:** Real-time tracking for customers to check their laundry status.

## 🛠️ Tech Stack

- **Frontend:** React 19 (TypeScript), Vite, Tailwind CSS, Lucide React, Recharts, React Hot Toast.
- **Backend:** Node.js, Express, PostgreSQL, JSON Web Tokens (JWT), Bcrypt.
- **Database:** PostgreSQL.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd sofias-soft-bubbles
```

### 2. Backend Setup
1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend/` directory:
   ```env
   PORT=5000
   DATABASE_URL=postgres://username:password@localhost:5432/sofias_lmis
   JWT_SECRET=your_super_secret_key
   ```
4. Initialize the database:
   ```bash
   npm run db:init
   npm run seed:admin
   ```
5. Start the development server:
   ```bash
   npm run dev
   ```

### 3. Frontend Setup
1. Navigate to the frontend folder:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

---

## 📦 Required Packages to Install

If you are starting from scratch or adding features, ensure these core packages are present:

### Frontend Dependencies
```bash
npm install axios lucide-react react-router-dom recharts react-hot-toast
```

### Backend Dependencies
```bash
npm install express pg dotenv cors jsonwebtoken bcryptjs
```

---

## 🎨 Design Language
- **Primary Color:** `#00B5B8` (Teal)
- **Aesthetic:** Soft Bubbles, Glassmorphism, Rounded Corners (`2rem`+), and subtle gradients.
- **Typography:** Bold, black-weighted headings for a modern "app" feel.

## 🛡️ Security
- **JWT Authentication:** Secure stateless session management.
- **Bcrypt Hashing:** Industry-standard password security.
- **Transactional DB Queries:** Atomic operations to prevent data corruption during deletions.

---

© 2026 Sofia's Soft Bubble's Laundry Shop. All Rights Reserved.
