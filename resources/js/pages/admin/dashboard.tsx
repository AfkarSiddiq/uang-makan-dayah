import AdminLayout from '@/layouts/admin-layout';
import { Head } from '@inertiajs/react';

export default function Dashboard() {
    return (
        <AdminLayout>
            <Head title="Dashboard" />
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
                <h1 className="text-2xl font-bold text-gray-800">Selamat Datang!</h1>
                <p className="text-gray-500 mt-2">Layout admin kamu sudah siap digunakan.</p>
            </div>
        </AdminLayout>
    );
}