import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Sparkles } from 'lucide-react';
import StudentForm from './Form';

export default function Create() {
    const handleSuccess = () => {
        router.visit(route('siswa.index'));
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Data & Input Siswa', href: '/siswa' },
                { title: 'Tambah Siswa Baru', href: '#' },
            ]}
        >
            <Head title="Tambah Siswa Baru" />

            <div className="mx-auto max-w-3xl space-y-6 p-6">
                <Link
                    href={route('siswa.index')}
                    className="inline-flex items-center text-sm font-medium text-slate-500 transition hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
                >
                    <ArrowLeft className="mr-1.5 h-4 w-4" />
                    Kembali ke Pusat Data Siswa
                </Link>

                <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs dark:border-slate-800/80 dark:bg-slate-900">
                    <div className="border-b border-slate-200/80 bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-transparent p-6 dark:border-slate-800/80 dark:from-indigo-950/40 dark:via-purple-950/20">
                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                            <Sparkles className="h-4 w-4" />
                            <span>Pendaftaran Baru</span>
                        </div>
                        <h1 className="mt-1.5 text-xl font-bold text-slate-900 dark:text-white">Formulir Pendaftaran Siswa & Santri Baru</h1>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            Lengkapi identitas siswa, penempatan kelas, dan periode masuk untuk memulai pencatatan tagihan SPP secara otomatis.
                        </p>
                    </div>

                    <div className="p-6">
                        <StudentForm onSuccess={handleSuccess} />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
