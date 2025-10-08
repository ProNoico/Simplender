import { LucideIcon } from 'lucide-react';

// Using Supabase's user type structure as a reference
export interface User {
  id: string;
  email?: string;
  user_metadata: {
    full_name?: string;
    avatar_url?: string;
    business_name?: string;
    phone?: string;
  };
  app_metadata: {
    provider?: string;
    providers?: string[];
    plan?: 'free' | 'pro';
    trial_ends_at?: string;
  }
  created_at: string;
}

export interface Session {
  user: User | null;
  access_token: string | null;
}

export interface Product {
    id: string;
    user_id: string;
    name: string;
    description?: string;
    cost?: number;
    price: number;
    initial_stock: number;
    current_stock: number;
    min_stock_alert: number;
    is_active: boolean;
    created_at: string;
}

export interface Sale {
    id: string;
    user_id: string;
    product_id: string;
    customer_id?: string;
    quantity: number;
    amount: number;
    payment_method: 'cash' | 'card' | 'transfer' | 'other';
    notes?: string;
    created_at: string;
    product_name?: string; // Campo para el nombre "archivado"
    product?: { name: string }; // Mantenemos para compatibilidad temporal
    customer?: { name: string };
}

export type ExpenseCategory = 'proveedores' | 'servicios' | 'marketing' | 'impuestos' | 'otro';

export interface Expense {
    id: string;
    user_id: string;
    description: string;
    amount: number;
    category: ExpenseCategory;
    expense_date: string;
    created_at: string;
}

export interface Customer {
    id: string;
    user_id: string;
    name: string;
    phone: string;
    email?: string;
    internal_notes?: string;
    last_purchase_date?: string;
    total_purchases: number;
    created_at: string;
    last_purchase_product_name?: string;
    last_purchase_amount?: number;
    clv?: number;
}

export type TaskCategory = 'ventas' | 'marketing' | 'admin' | 'finanzas' | 'otro';

export interface Task {
    id: string;
    user_id: string;
    title: string;
    description?: string;
    category: TaskCategory;
    due_date: string;
    is_completed: boolean;
    created_at: string;
}

export interface DashboardStats {
    monthly_sales: number;
    monthly_goal: number;
    most_sold_product: { name: string; quantity: number } | null;
    active_customers: number;
    sales_over_time: { date: string; total: number }[];
    last_5_sales: Sale[];
}

export interface NavItem {
    path: string;
    label: string;
    icon: LucideIcon;
}