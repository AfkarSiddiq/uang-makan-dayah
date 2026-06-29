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

            <div className="mx-auto max-w-2xl space-y-6 p-6">
                <Link
                    href={backUrl}
                    className="inline-flex items-center text-sm font-medium text-slate-500 transition hover:text-slate-900 dark:hover:text-white"
                >
                    <ArrowLeft className="mr-1 h-4 w-4" />
                    Kembali ke Profil Siswa
                </Link>

                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <div className="border-b border-slate-200 p-6 dark:border-slate-800">
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Edit Siswa</h2>
                        <p className="mt-1 text-sm text-slate-500">Edit data siswa</p>
                    </div>

                    <div className="p-6">
                        <StudentForm student={student} onSuccess={handleSuccess} />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
