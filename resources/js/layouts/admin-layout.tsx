import React, { ReactNode } from 'react';
import { Link } from '@inertiajs/react';

interface Props {
    children: ReactNode;
}

export default function AdminLayout({ children }: Props) {
    return (
        <div className="flex min-h-screen bg-gray-100">
            {/* Sidebar Tetap di Kiri */}
            <nav className="w-64 bg-card text-white flex flex-col fixed h-full">
                <div className="p-6 text-xl font-bold border-b border-slate-800">
                    MY APP
                </div>
                <div className="p-4 flex-grow space-y-2">
                    <Link href="/admin/dashboard" className="block p-3 hover:bg-slate-800 rounded">Dashboard</Link>
                    <Link href="/admin/users" className="block p-3 hover:bg-slate-800 rounded">Users</Link>
                </div>
            </nav>

            {/* Konten Utama di Kanan */}
            <div className="flex-1 ml-64 flex flex-col">
                <header className="h-16 bg-white shadow-sm flex items-center px-8 sticky top-0">
                    <span className="font-semibold text-gray-700">Admin Panel</span>
                </header>
                
                <main className="p-8">
                    {children} {/* Di sini isi halamanmu muncul */}
                </main>
            </div>
        </div>
    );
}