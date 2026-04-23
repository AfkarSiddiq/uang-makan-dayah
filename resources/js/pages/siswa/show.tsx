import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { Student } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Edit, User } from 'lucide-react';

interface Props {
    student: Student;
}

const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

export default function Show({ student }: Props) {
    const getStatusBadge = (status: string) => {
        const statusStyles: Record<string, string> = {
            aktif: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
            lulus: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
            pindah: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
            berhenti: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
        };
        return statusStyles[status] || 'bg-slate-100 text-slate-700';
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Siswa', href: '/siswa' },
                { title: student.name, href: '#' },
            ]}
        >
            <Head title={student.name} />

            <div className="space-y-6 p-6">
                <Link
                    href={route('siswa.index')}
                    className="inline-flex items-center text-sm font-medium text-slate-500 transition hover:text-slate-900 dark:hover:text-white"
                >
                    <ArrowLeft className="mr-1 h-4 w-4" />
                    Kembali ke Data Siswa
                </Link>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    <div className="col-span-1 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex flex-col items-center text-center">
                            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/30">
                                <User className="h-12 w-12 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <h3 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">{student.name}</h3>
                            <p className="text-sm text-slate-500">NISN: {student.nisn}</p>
                            <span className={`mt-2 inline-flex rounded-full px-3 py-1 text-sm font-medium ${getStatusBadge(student.status)}`}>
                                {student.status}
                            </span>
                        </div>
                    </div>

                    <div className="col-span-2 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Informasi Siswa</h3>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-slate-500">Nama Lengkap</p>
                                    <p className="font-medium text-slate-900 dark:text-white">{student.name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">NISN</p>
                                    <p className="font-medium text-slate-900 dark:text-white">{student.nisn}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">Jenis Kelamin</p>
                                    <p className="font-medium text-slate-900 dark:text-white">{student.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">Kelas</p>
                                    <p className="font-medium text-slate-900 dark:text-white">{student.class ? `Kelas ${student.class}` : '-'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">Status</p>
                                    <p className="font-medium text-slate-900 dark:text-white">{student.status}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">Tanggal Masuk</p>
                                    <p className="font-medium text-slate-900 dark:text-white">
                                        {student.entry_month && student.entry_year ? `${months[student.entry_month - 1]} ${student.entry_year}` : '-'}
                                    </p>
                                </div>
                                {student.exit_month && student.exit_year && (
                                    <>
                                        <div>
                                            <p className="text-sm text-slate-500">Tanggal Keluar</p>
                                            <p className="font-medium text-slate-900 dark:text-white">
                                                {`${months[student.exit_month - 1]} ${student.exit_year}`}
                                            </p>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end border-t border-slate-200 pt-4 dark:border-slate-800">
                            <Link href={route('siswa.edit', student.id)}>
                                <Button>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit Siswa
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
