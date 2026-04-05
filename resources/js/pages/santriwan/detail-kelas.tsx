import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

interface Student {
    id: number;
    nisn: string;
    name: string;
    status: string;
}

interface Props {
    namaKelas: string;
    students: Student[];
}

export default function DetailKelas({ namaKelas, students }: Props) {
    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Data Santriwan', href: '/santriwan' },
                { title: `Kelas ${namaKelas}`, href: '#' },
            ]}
        >
            <Head title={`Santriwan Kelas ${namaKelas}`} />

            <div className="p-6">
                <div className="mb-6 flex items-center gap-4">
                    <Link href="/santriwan" className="rounded-md border p-2 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Santriwan Kelas {namaKelas}</h1>
                        <p className="text-slate-500">Menampilkan {students.length} santri aktif.</p>
                    </div>
                </div>

                {/* Tabel Data Siswa ditaruh di sini (Sama seperti tabel sebelumnya) */}
                <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="border-b border-slate-200 bg-slate-50 font-medium text-slate-500 dark:border-slate-800 dark:bg-slate-800/50">
                        <tr>
                            <th className="w-16 px-6 py-4">No</th>
                            <th className="px-6 py-4">NISN</th>
                            <th className="px-6 py-4">Nama Lengkap</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                        {students.length > 0 ? (
                            students.map((student, index) => (
                                <tr key={student.id} className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{index + 1}</td>
                                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-300">{student.nisn}</td>
                                    <td className="px-6 py-4 font-semibold text-slate-800 dark:text-slate-200">{student.name}</td>
                                    <td className="px-6 py-4">
                                        <span
                                            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                                                student.status === 'aktif'
                                                    ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-400/10 dark:text-emerald-400'
                                                    : 'bg-rose-50 text-rose-700 ring-rose-600/20 dark:bg-rose-400/10 dark:text-rose-400'
                                            }`}
                                        >
                                            {student.status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {/* Tombol yang mengarah ke route show (Profil Siswa) */}
                                        <Link
                                            href={route('santriwan.show', { id: student.id })}
                                            className="inline-flex items-center justify-center rounded-md bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-600 transition-colors hover:bg-indigo-100 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none dark:bg-indigo-900/50 dark:text-indigo-400 dark:hover:bg-indigo-900"
                                        >
                                            Lihat Profil
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="px-6 py-10 text-center text-slate-500 dark:text-slate-400">
                                    Belum ada data santriwan di kelas ini.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </AppLayout>
    );
}
