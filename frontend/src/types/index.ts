export interface User {
  id: number;
  username: string;
  role: 'admin' | 'staff' | 'customer';
}

export interface Customer {
  id: number;
  full_name: string;
  phone_number: string;
  created_at: string;
}

export interface Order {
  id: number;
  customer_id: number;
  full_name: string;
  phone_number: string;
  weight_kg: number;
  service_type: string;
  status: 'Pending' | 'Washing' | 'Drying' | 'Ready' | 'Completed';
  total_amount: number;
  created_at: string;
  updated_at: string;
}

export interface DashboardStats {
  activeOrders: number;
  todayRevenue: number;
  newCustomersToday: number;
}

export interface RevenueReport {
  daily: { date: string; revenue: string }[];
  weekly: { week: string; revenue: string }[];
  monthly: { month: string; revenue: string }[];
}
