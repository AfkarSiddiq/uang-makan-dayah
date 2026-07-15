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
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<'aktif' | 'pindah' | 'all'>('aktif');

    const filteredStudents = students.filter(student => {
        const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              student.nisn.includes(searchQuery);
        if (!matchesSearch) return false;
        if (filterStatus === 'aktif') return student.status === 'aktif';
        if (filterStatus === 'pindah') return student.status !== 'aktif';
        return true;
    });

    const activeCount = students.filter(s => s.status === 'aktif').length;
    const movedCount = students.filter(s => s.status !== 'aktif').length;

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Data Santriwati', href: '/santriwati' },
                { title: `Kelas ${namaKelas}`, href: '#' },
            ]}
        >
            <Head title={`Santriwati Kelas ${namaKelas}`} />

            <div className="p-6">
                <div className="mb-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Link href="/santriwati" className="rounded-md border border-slate-200 dark:border-slate-800 p-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition">
                            <ArrowLeft className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Santriwati Kelas {namaKelas}</h1>
                            <p className="text-sm text-slate-500 mt-0.5">
                                Menampilkan {activeCount} santri aktif{movedCount > 0 ? ` dan ${movedCount} santri pindah/keluar tahun ini` : ''}.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl text-xs font-semibold overflow-x-auto">
                            <button
                                type="button"
                                onClick={() => setFilterStatus('aktif')}
                                className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap ${filterStatus === 'aktif' ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'}`}
                            >
                                Aktif ({activeCount})
                            </button>
                            {movedCount > 0 && (
                                <button
                                    type="button"
                                    onClick={() => setFilterStatus('pindah')}
                                    className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap ${filterStatus === 'pindah' ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'}`}
                                >
                                    Pindah/Keluar ({movedCount})
                                </button>
                            )}
                            {movedCount > 0 && (
                                <button
                                    type="button"
                                    onClick={() => setFilterStatus('all')}
                                    className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap ${filterStatus === 'all' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'}`}
                                >
                                    Semua ({students.length})
                                </button>
                            )}
                        </div>

                        <div className="relative w-full sm:w-64">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <Search className="h-4 w-4 text-slate-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Cari Nama atau NISN..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="block w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 py-2 pl-10 pr-3 text-sm placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:text-white transition"
                            />
                        </div>
                    </div>
                </div>

                {/* Tampilan Desktop: Tabel Data Siswa */}
                <div className="hidden md:block bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden overflow-x-auto">
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
                            {filteredStudents.length > 0 ? (
                                filteredStudents.map((student, index) => (
                                    <tr key={student.id} className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                        <td className="px-6 py-4 text-slate-500 dark:text-slate-400 font-medium">{index + 1}</td>
                                        <td className="px-6 py-4 font-mono font-medium text-slate-900 dark:text-slate-300">{student.nisn}</td>
                                        <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-200">{student.name}</td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset uppercase tracking-wider ${
                                                    student.status === 'aktif'
                                                        ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-400/10 dark:text-emerald-400'
                                                        : 'bg-rose-50 text-rose-700 ring-rose-600/20 dark:bg-rose-400/10 dark:text-rose-400'
                                                }`}
                                            >
                                                {student.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link
                                                href={route('santriwati.show', { id: student.id })}
                                                className="inline-flex items-center justify-center rounded-lg bg-indigo-50 px-3.5 py-1.5 text-xs font-semibold text-indigo-600 transition-colors hover:bg-indigo-100 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none dark:bg-indigo-900/40 dark:text-indigo-300 dark:hover:bg-indigo-900/70"
                                            >
                                                Lihat Profil →
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center">
                                        <p className="text-slate-500 dark:text-slate-400 font-medium">
                                            {students.length === 0 
                                                ? 'Belum ada data santriwati di kelas ini.' 
                                                : `Tidak ada santriwati dengan filter yang dipilih.`
                                            }
                                        </p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Tampilan Mobile: Kartu Responsif */}
                <div className="md:hidden space-y-3">
                    {filteredStudents.length > 0 ? (
                        filteredStudents.map((student, index) => (
                            <div key={student.id} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                                <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-2.5">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-slate-400 dark:text-slate-500">#{index + 1}</span>
                                        <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-lg">
                                            {student.nisn}
                                        </span>
                                    </div>
                                    <span
                                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ring-1 ring-inset uppercase tracking-wider ${
                                            student.status === 'aktif'
                                                ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-400/10 dark:text-emerald-400'
                                                : 'bg-rose-50 text-rose-700 ring-rose-600/20 dark:bg-rose-400/10 dark:text-rose-400'
                                        }`}
                                    >
                                        {student.status}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between gap-2">
                                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white leading-snug">
                                        {student.name}
                                    </h3>
                                    <Link
                                        href={route('santriwati.show', { id: student.id })}
                                        className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-indigo-500 transition flex-shrink-0"
                                    >
                                        Lihat →
                                    </Link>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800">
                            <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                                {students.length === 0 
                                    ? 'Belum ada data santriwati di kelas ini.' 
                                    : `Tidak ada santriwati dengan filter yang dipilih.`
                                }
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}