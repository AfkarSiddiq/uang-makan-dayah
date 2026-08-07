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

            <div className="mx-auto max-w-3xl space-y-4 sm:space-y-6 p-4 sm:p-6">
                <Link
                    href={route('siswa.index')}
                    className="inline-flex items-center text-xs sm:text-sm font-medium text-muted-foreground transition hover:text-primary dark:text-muted-foreground dark:hover:text-primary"
                >
                    <ArrowLeft className="mr-1.5 h-4 w-4" />
                    Kembali ke Pusat Data Siswa
                </Link>

                <div className="overflow-hidden rounded-2xl border border-border/80 bg-white shadow-xs dark:border-border dark:bg-card">
                    <div className="border-b border-border/80 bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-transparent p-4 sm:p-6 dark:border-border dark:from-indigo-950/40 dark:via-purple-950/20">
                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary dark:text-primary">
                            <Sparkles className="h-4 w-4" />
                            <span>Pendaftaran Baru</span>
                        </div>
                        <h1 className="mt-1.5 text-lg sm:text-xl font-bold text-foreground dark:text-white">Formulir Pendaftaran Siswa & Santri Baru</h1>
                        <p className="mt-1 text-xs sm:text-sm text-muted-foreground dark:text-muted-foreground">
                            Lengkapi identitas siswa, penempatan kelas, dan periode masuk untuk memulai pencatatan tagihan SPP secara otomatis.
                        </p>
                    </div>

                    <div className="p-4 sm:p-6">
                        <StudentForm onSuccess={handleSuccess} />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
