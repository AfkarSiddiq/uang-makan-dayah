import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { GraduationCap, Users, Search, FolderArchive, ArrowRight, UserMinus } from 'lucide-react';
import { useState, useMemo } from 'react';
import { Student } from '@/types';

interface TahunItem {
    exit_year: number;
    total_alumni: number;
}

interface Props {
    tahunLulus: TahunItem[];
    siswaPindah?: Student[];
}

export default function Index({ tahunLulus, siswaPindah = [] }: Props) {
    const [activeTab, setActiveTab] = useState<'lulus' | 'pindah'>('lulus');
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [yearFilter, setYearFilter] = useState<string>('all');

    // Daftar tahun keluar unik dari siswa pindah untuk dropdown filter
    const uniqueExitYears = useMemo(() => {
        const years = siswaPindah
            .map(s => Number(s.exit_year))
            .filter((y): y is number => !isNaN(y) && y > 1900);
        return Array.from(new Set(years)).sort((a, b) => b - a);
    }, [siswaPindah]);

    // Daftar status mutasi unik dari data siswa
    const uniqueStatuses = useMemo(() => {
        const statuses = siswaPindah
            .map(s => s.status)
            .filter((st): st is string => Boolean(st) && st.toLowerCase() !== 'aktif' && st.toLowerCase() !== 'lulus');
        return Array.from(new Set(statuses));
    }, [siswaPindah]);

    // Filter siswa pindah berdasarkan search dan filter
    const filteredSiswaPindah = useMemo(() => {
        return siswaPindah.filter(student => {
            const matchSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                student.nisn.includes(searchQuery);
            if (!matchSearch) return false;

            if (statusFilter !== 'all' && student.status !== statusFilter) return false;
            if (yearFilter !== 'all' && String(student.exit_year || '') !== yearFilter) return false;

            return true;
        });
    }, [siswaPindah, searchQuery, statusFilter, yearFilter]);

    const getMonthName = (monthNumber?: number) => {
        if (!monthNumber || monthNumber < 1 || monthNumber > 12) return '-';
        const date = new Date(2000, monthNumber - 1, 1);
        return date.toLocaleString('id-ID', { month: 'short' });
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Arsip & Alumni', href: '/alumni' }]}>
            <Head title="Arsip & Alumni" />
            
            <div className="p-6 max-w-7xl mx-auto space-y-6">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
                            <FolderArchive className="w-7 h-7 text-indigo-600 dark:text-indigo-400" /> 
                            Arsip & Alumni
                        </h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            Pusat riwayat santri yang telah lulus (alumni) dan santri mutasi non-aktif (pindah/berhenti).
                        </p>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60 self-start md:self-auto">
                        <button
                            type="button"
                            onClick={() => setActiveTab('lulus')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition ${
                                activeTab === 'lulus'
                                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                            }`}
                        >
                            <GraduationCap className="w-4 h-4" />
                            <span>Data Alumni ({tahunLulus.reduce((acc, curr) => acc + curr.total_alumni, 0)})</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('pindah')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition ${
                                activeTab === 'pindah'
                                    ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-sm'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                            }`}
                        >
                            <UserMinus className="w-4 h-4" />
                            <span>Siswa Pindah/Berhenti ({siswaPindah.length})</span>
                        </button>
                    </div>
                </div>

                {/* Tab 1: Data Alumni */}
                {activeTab === 'lulus' && (
                    <div className="space-y-6 animate-in fade-in duration-200">
                        {tahunLulus.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                {tahunLulus.map((item) => (
                                    <Link
                                        key={item.exit_year}
                                        href={`/alumni/${item.exit_year}`}
                                        className="group bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-indigo-500/50 dark:hover:border-indigo-500/50 transition duration-200 flex flex-col justify-between"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition duration-200">
                                                <GraduationCap className="w-6 h-6" />
                                            </div>
                                            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                                Angkatan {item.exit_year}
                                            </span>
                                        </div>

                                        <div className="mt-6">
                                            <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                                                Tahun Lulus {item.exit_year}
                                            </h3>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
                                                <Users className="w-4 h-4 text-slate-400" />
                                                Total <span className="font-semibold text-slate-700 dark:text-slate-200">{item.total_alumni} santri</span> terdaftar
                                            </p>
                                        </div>

                                        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                                            <span>Lihat Daftar Alumni</span>
                                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition duration-200" />
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white dark:bg-slate-900 p-12 rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
                                <GraduationCap className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                                <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">Belum Ada Data Alumni</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                                    Siswa yang dinaikkan kelas hingga lulus akan otomatis tercatat dan terkelompokkan di dalam halaman ini.
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Tab 2: Siswa Pindah / Berhenti */}
                {activeTab === 'pindah' && (
                    <div className="space-y-6 animate-in fade-in duration-200">
                        {/* Filters & Search */}
                        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
                                <select
                                    value={statusFilter}
                                    onChange={e => setStatusFilter(e.target.value)}
                                    className="w-full sm:w-auto rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="all">Semua Status Mutasi</option>
                                    {uniqueStatuses.length > 0 ? (
                                        uniqueStatuses.map(st => (
                                            <option key={`st-${st}`} value={st}>Status: {st.charAt(0).toUpperCase() + st.slice(1)}</option>
                                        ))
                                    ) : (
                                        <>
                                            <option value="pindah">Status: Pindah</option>
                                            <option value="berhenti">Status: Berhenti</option>
                                            <option value="keluar">Status: Keluar</option>
                                        </>
                                    )}
                                </select>
                                <select
                                    value={yearFilter}
                                    onChange={e => setYearFilter(e.target.value)}
                                    className="w-full sm:w-auto rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="all">Semua Tahun Keluar</option>
                                    {uniqueExitYears.map(y => (
                                        <option key={`exit-${y}`} value={String(y)}>Tahun {y}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="relative w-full md:w-80">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                                    <Search className="h-4 w-4 text-slate-400" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Cari Nama atau NISN..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    className="block w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 py-2 pl-10 pr-4 text-sm placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:text-white transition"
                                />
                            </div>
                        </div>

                        {/* Tampilan Desktop: Table */}
                        <div className="hidden md:block bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden overflow-x-auto">
                            <table className="w-full text-left text-sm whitespace-nowrap">
                                <thead className="border-b border-slate-200 bg-slate-50/80 font-semibold text-slate-600 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-300">
                                    <tr>
                                        <th className="w-16 px-6 py-4">No</th>
                                        <th className="px-6 py-4">NISN</th>
                                        <th className="px-6 py-4">Nama Lengkap</th>
                                        <th className="px-6 py-4">L/P</th>
                                        <th className="px-6 py-4">Kelas Terakhir</th>
                                        <th className="px-6 py-4">Waktu Keluar</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                    {filteredSiswaPindah.length > 0 ? (
                                        filteredSiswaPindah.map((student, idx) => (
                                            <tr key={student.id} className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                                <td className="px-6 py-4 text-slate-500 dark:text-slate-400 font-medium">{idx + 1}</td>
                                                <td className="px-6 py-4 font-mono font-medium text-slate-800 dark:text-slate-300">{student.nisn}</td>
                                                <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{student.name}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${
                                                        student.gender === 'L' 
                                                            ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' 
                                                            : 'bg-pink-50 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300'
                                                    }`}>
                                                        {student.gender === 'L' ? 'Putra' : 'Putri'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">
                                                    {student.class ? `Kelas ${student.class}` : '-'}
                                                </td>
                                                <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                                                    {student.exit_year ? `${getMonthName(student.exit_month)} ${student.exit_year}` : '-'}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset bg-rose-50 text-rose-700 ring-rose-600/20 dark:bg-rose-400/10 dark:text-rose-400 uppercase tracking-wider">
                                                        {student.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <Link
                                                        href={route(student.gender === 'L' ? 'santriwan.show' : 'santriwati.show', { id: student.id })}
                                                        className="inline-flex items-center justify-center rounded-lg bg-indigo-50 px-3.5 py-1.5 text-xs font-semibold text-indigo-600 transition hover:bg-indigo-100 dark:bg-indigo-900/40 dark:text-indigo-300 dark:hover:bg-indigo-900/70"
                                                    >
                                                        Lihat Arsip →
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={8} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                                                <UserMinus className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                                                <p className="font-semibold text-base text-slate-700 dark:text-slate-300">Tidak ada data santri pindah/berhenti</p>
                                                <p className="text-xs text-slate-400 mt-0.5">Coba sesuaikan filter atau kata kunci pencarian Anda.</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Tampilan Mobile: Kartu Responsif */}
                        <div className="md:hidden space-y-3.5">
                            {filteredSiswaPindah.length > 0 ? (
                                filteredSiswaPindah.map((student) => (
                                    <div key={student.id} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                                        <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-2.5">
                                            <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-lg">
                                                NISN: {student.nisn}
                                            </span>
                                            <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-extrabold ring-1 ring-inset bg-rose-50 text-rose-700 ring-rose-600/20 dark:bg-rose-400/10 dark:text-rose-400 uppercase">
                                                {student.status}
                                            </span>
                                        </div>

                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <h3 className="font-extrabold text-base text-slate-900 dark:text-white leading-snug">
                                                    {student.name}
                                                </h3>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${
                                                        student.gender === 'L' 
                                                            ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' 
                                                            : 'bg-pink-50 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300'
                                                    }`}>
                                                        {student.gender === 'L' ? 'Putra' : 'Putri'}
                                                    </span>
                                                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                                                        {student.class ? `Kelas ${student.class}` : 'Tanpa Kelas'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                                            <span>
                                                Waktu Keluar: <strong className="text-slate-700 dark:text-slate-300">{student.exit_year ? `${getMonthName(student.exit_month)} ${student.exit_year}` : '-'}</strong>
                                            </span>
                                            <Link
                                                href={route(student.gender === 'L' ? 'santriwan.show' : 'santriwati.show', { id: student.id })}
                                                className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-indigo-500 transition"
                                            >
                                                Arsip →
                                            </Link>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800">
                                    <UserMinus className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                                    <p className="font-semibold text-sm text-slate-700 dark:text-slate-300">Tidak ada data santri pindah/berhenti</p>
                                    <p className="text-xs text-slate-400 mt-0.5">Coba sesuaikan filter atau kata kunci pencarian Anda.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}