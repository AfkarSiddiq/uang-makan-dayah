import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Search } from 'lucide-react'; // [DITAMBAHKAN]: Import icon Search
import { useState } from 'react'; // [DITAMBAHKAN]: Import useState

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
    // [DITAMBAHKAN]: State untuk menyimpan teks pencarian
    const [searchQuery, setSearchQuery] = useState('');

    // [DITAMBAHKAN]: Logika Filter Data
    // Hanya tampilkan siswa yang nama atau NISN-nya mengandung huruf/angka yang diketik
    const filteredStudents = students.filter(student => 
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        student.nisn.includes(searchQuery)
    );

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Data Santriwan', href: '/santriwan' },
                { title: `Kelas ${namaKelas}`, href: '#' },
            ]}
        >
            <Head title={`Santriwan Kelas ${namaKelas}`} />

            <div className="p-6">
                <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Link href="/santriwan" className="rounded-md border border-slate-200 dark:border-slate-800 p-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition">
                            <ArrowLeft className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Santriwan Kelas {namaKelas}</h1>
                            <p className="text-slate-500">Menampilkan {students.length} santri aktif.</p>
                        </div>
                    </div>

                    {/* [DITAMBAHKAN]: Kotak Input Search Bar */}
                    <div className="relative w-full sm:w-72">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <Search className="h-4 w-4 text-slate-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Cari Nama atau NISN..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="block w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 py-2 pl-10 pr-3 text-sm placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:text-white transition"
                        />
                    </div>
                </div>

                {/* Tabel Data Siswa */}
                {/* [DIPERBAIKI]: Tambahkan class pembungkus agar tabel responsif dan rapi seperti sebelumnya */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm overflow-hidden overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="border-b border-slate-200 bg-slate-50/80 font-medium text-slate-500 dark:border-slate-800 dark:bg-slate-800/50">
                            <tr>
                                <th className="w-16 px-6 py-4">No</th>
                                <th className="px-6 py-4">NISN</th>
                                <th className="px-6 py-4">Nama Lengkap</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                            {/* [DIPERBAIKI]: Gunakan 'filteredStudents' bukan 'students' */}
                            {filteredStudents.length > 0 ? (
                                filteredStudents.map((student, index) => (
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
                                    <td colSpan={5} className="px-6 py-12 text-center">
                                        {/* [DIPERBAIKI]: Logika pesan kosong jika pencarian tidak ditemukan */}
                                        <p className="text-slate-500 dark:text-slate-400">
                                            {students.length === 0 
                                                ? 'Belum ada data santriwan di kelas ini.' 
                                                : `Tidak ada santriwan dengan nama atau NISN "${searchQuery}".`
                                            }
                                        </p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}