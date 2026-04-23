import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import StudentForm from './Form';

export default function Create() {
    const handleSuccess = () => {
        router.visit(route('siswa.index'));
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Siswa', href: '/siswa' },
                { title: 'Tambah', href: '#' },
            ]}
        >
            <Head title="Tambah Siswa" />

            <div className="mx-auto max-w-2xl space-y-6 p-6">
                <Link
                    href={route('siswa.index')}
                    className="inline-flex items-center text-sm font-medium text-slate-500 transition hover:text-slate-900 dark:hover:text-white"
                >
                    <ArrowLeft className="mr-1 h-4 w-4" />
                    Kembali ke Data Siswa
                </Link>

                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <div className="border-b border-slate-200 p-6 dark:border-slate-800">
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Form Siswa Baru</h2>
                        <p className="mt-1 text-sm text-slate-500">Tambah data siswa baru</p>
                    </div>

                    <div className="p-6">
                        <StudentForm onSuccess={handleSuccess} />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
