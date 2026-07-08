import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

// 1. Sesuaikan Breadcrumbs agar menampilkan navigasi yang benar
const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    // {
    //     title: 'Uang Makan',
    //     href: '/uang-makan',
    // },
];

export default function Index() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Data Uang Makan" />
            
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                
                {/* Bagian Atas: Kartu Ringkasan (Opsional) */}
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    <div className="border-sidebar-border/70 dark:border-sidebar-border relative flex flex-col justify-center overflow-hidden rounded-xl border bg-white dark:bg-neutral-900 p-6 shadow-sm">
                        <span className="text-sm text-neutral-500 dark:text-neutral-400">Total Periode Ini</span>
                        <span className="text-2xl font-bold mt-1">Rp 4.500.000</span>
                    </div>
                    <div className="border-sidebar-border/70 dark:border-sidebar-border relative flex flex-col justify-center overflow-hidden rounded-xl border bg-white dark:bg-neutral-900 p-6 shadow-sm">
                        <span className="text-sm text-neutral-500 dark:text-neutral-400">Karyawan Menerima</span>
                        <span className="text-2xl font-bold mt-1">45 Orang</span>
                    </div>
                    <div className="border-sidebar-border/70 dark:border-sidebar-border relative flex flex-col justify-center overflow-hidden rounded-xl border bg-white dark:bg-neutral-900 p-6 shadow-sm">
                        <span className="text-sm text-neutral-500 dark:text-neutral-400">Status Pembayaran</span>
                        <span className="text-2xl font-bold mt-1 text-emerald-600">Selesai</span>
                    </div>
                </div>

                {/* Bagian Bawah: Area Utama untuk Tabel/List Data */}
                <div className="border-sidebar-border/70 dark:border-sidebar-border relative min-h-[100vh] flex-1 rounded-xl border bg-white dark:bg-neutral-900 md:min-h-min p-6 shadow-sm">
                    
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold">Riwayat Uang Makan</h2>
                        <button className="px-4 py-2 bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 rounded-md text-sm font-medium hover:opacity-90 transition">
                            + Tambah Data
                        </button>
                    </div>

                    {/* Placeholder untuk Tabel */}
                    <div className="w-full text-center py-20 text-neutral-500 dark:text-neutral-400 border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-lg">
                        Tabel data uang makan akan tampil di sini.
                    </div>

                </div>
            </div>
        </AppLayout>
    );
}