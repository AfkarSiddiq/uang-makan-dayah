import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    url: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
    items?: {
        title: string;
        url: string;
        icon: LucideIcon | null;
    }[];
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}

export interface Student {
    id: number;
    nisn: string;
    name: string;
    gender: string;
    class: string;
    status: string;
    student_type: 'umum' | 'yatim' | 'piatu' | 'yatim_piatu';
    entry_month: number;
    entry_year: number;
    exit_month?: number;
    exit_year?: number;
}

export interface Transaction {
    id: number;
    transaction_id: string;
    student_id: number | null;
    student?: Student;
    type: 'in' | 'out';
    category: string;
    amount: number;
    note: string | null;
    transaction_date: string;
    user_id: number;
    user?: User;
    created_at: string;
    updated_at: string;
}

export interface TransactionSummary {
    total_in: number;
    total_out: number;
    balance: number;
}
