# LMIS: Business Requirements & System Overview
## Sofia’s Soft Bubble’s Laundry Shop

This document serves as the primary business context guide for developers and AI assistants. It outlines the core problems, the proposed digital solutions, user personas, and the essential functionalities required for the Laundry Management Information System (LMIS).

---

## 1. Problem Statement & The Impact
The business currently relies on manual, paper-based processes, leading to:
*   **Manual Bookkeeping:** Time-consuming calculations prone to human error.
*   **Fragmented Customer Records:** Lost or disorganized contact information scattered across notebooks.
*   **Notification Lag:** No systematic way to alert customers when laundry is finished, causing shop congestion and customer dissatisfaction.
*   **Disorganized Workflow:** Difficulty in tracking exactly which stage of the laundry process an order is in.

---

## 2. The Solution
The LMIS will transition the shop to a centralized digital platform featuring:
1.  A searchable, unified **Customer Database**.
2.  An **Automated Financial Ledger** to track daily/weekly/monthly revenue.
3.  A **Smart Notification System** to text customers automatically.
4.  A **Visual Order Tracking System** (Kanban board) for operational efficiency.
5.  **Role-Based Access Control (RBAC)** to secure sensitive data.

---

## 3. User Personas & Access Levels

### Admin / Shop Owner
*   **Profile:** The owner overseeing overall business health and operations.
*   **System Access:** Full Access (Superuser).
*   **Key Capabilities:**
    *   View all financial reports, revenue charts, and business analytics.
    *   Manage staff accounts (create, delete, reset passwords).
    *   Adjust system settings (pricing, service types).
    *   View the system Audit Trail to monitor staff activities.

### Laundry Staff
*   **Profile:** Frontline workers handling customer intake and laundry processing.
*   **System Access:** Restricted (Operations only).
*   **Key Capabilities:**
    *   Create, search, and update customer profiles.
    *   Input new laundry orders and generate digital receipts.
    *   Update order statuses (e.g., moving an order from 'Washing' to 'Drying').
    *   Trigger automated SMS notifications to customers.
    *   *Restriction:* Cannot view high-level financial reports or alter system settings.

### Customers
*   **Profile:** Clients of Sofia's Soft Bubbles.
*   **System Access:** None (External).
*   **Key Interactions:**
    *   Receive automated SMS notifications when laundry is "Ready for Pickup."
    *   Provide contact details to staff for digital record-keeping.

---

## 4. Core Functionalities (Developer Checklist)

### Authentication & Authorization
- [ ] Implement JWT-based login.
- [ ] Create middleware to route users based on role (`admin` vs `staff`).

### Customer Management
- [ ] Interface to rapidly register new walk-in customers.
- [ ] Global search bar to instantly pull up customer history via Name or Phone Number.

### Order Tracking & Queue Management
- [ ] Create a Kanban-style interface for active orders.
- [ ] Define order states: `Pending` -> `Washing` -> `Drying` -> `Ready` -> `Completed`.
- [ ] Allow staff to easily update these states.

### Automated Notifications
- [ ] Integrate a background service/hook that listens for status changes.
- [ ] Automatically dispatch an SMS to the associated customer's phone number when an order hits the `Ready` state.

### Reporting & Analytics
- [ ] Real-time dashboard for the Admin showing today's revenue, active orders, and completed orders.
- [ ] Exportable financial summaries (CSV/PDF) for bookkeeping.

### Audit & Security
- [ ] Log critical actions (e.g., "Order deleted", "Payment voided") with a timestamp and the user ID of the staff member who performed it.
- [ ] Ensure database backups are scheduled.
