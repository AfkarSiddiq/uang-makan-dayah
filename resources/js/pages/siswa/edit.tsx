import AppLayout from '@/layouts/app-layout';
import { Student } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import StudentForm from './Form';

interface Props {
    student: Student;
}

export default function Edit({ student }: Props) {
    const backUrl = student.gender === 'L' ? route('santriwan.show', student.id) : route('santriwati.show', student.id);

    const handleSuccess = () => {
        router.visit(backUrl);
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: student.gender === 'L' ? 'Santriwan' : 'Santriwati', href: student.gender === 'L' ? '/santriwan' : '/santriwati' },
                { title: student.name, href: backUrl },
                { title: 'Edit', href: '#' },
            ]}
        >
            <Head title={`Edit ${student.name}`} />

            <div className="mx-auto max-w-3xl space-y-4 sm:space-y-6 p-4 sm:p-6">
                <Link
                    href={backUrl}
                    className="inline-flex items-center text-xs sm:text-sm font-medium text-muted-foreground transition hover:text-foreground dark:hover:text-white"
                >
                    <ArrowLeft className="mr-1 h-4 w-4" />
                    Kembali ke Profil Siswa
                </Link>

                <div className="overflow-hidden rounded-xl border border-border bg-white shadow-sm dark:border-slate-800 dark:bg-card">
                    <div className="border-b border-border p-4 sm:p-6 dark:border-slate-800">
                        <h2 className="text-base sm:text-lg font-semibold text-foreground dark:text-white">Edit Data Siswa</h2>
                        <p className="mt-1 text-xs sm:text-sm text-muted-foreground">Perbarui identitas, penempatan kelas, atau status kesiswaan</p>
                    </div>

                    <div className="p-4 sm:p-6">
                        <StudentForm student={student} onSuccess={handleSuccess} />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
