import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { AlertTriangle, ArrowLeft, Download, FileSpreadsheet, Search, User, Wallet } from 'lucide-react';
import { useState } from 'react';

interface UnpaidMonth {
    id: number;
    month: number;
    year: number;
    month_name: string;
}

interface Student {
    id: number;
    name: string;
    nisn: string;
    class: number | null;
    gender: string;
    entry_month: number;
    entry_year: number;
    arrears_count: number;
    total_expected: number;
    paid_count: number;
    total_arrears: number;
    unpaid_months: UnpaidMonth[];
}

interface Props {
    students: Student[];
    summary: {
        total_students: number;
        total_arrears: number;
    };
    availableMonths: { id: number; month: number; year: number; label: string }[];
    selectedMonth: string | null;
}

export default function Index({ students, summary, availableMonths, selectedMonth }: Props) {
    const [search, setSearch] = useState('');
    const [selectedExportMonth, setSelectedExportMonth] = useState<string>('');
    const [showExportModal, setShowExportModal] = useState(false);
    const [selectedClass, setSelectedClass] = useState<string>('all');
    const [expandedStudent, setExpandedStudent] = useState<number | null>(null);

    const filteredStudents = students.filter((student) => {
        const matchesSearch = student.name.toLowerCase().includes(search.toLowerCase()) ||
            student.nisn.includes(search);
        const matchesClass = selectedClass === 'all' || String(student.class) === selectedClass;
        return matchesSearch && matchesClass;
    });

    const classes = [...new Set(students.map((s) => s.class).filter(Boolean))].sort((a, b) => a - b);

    const formatRupiah = (angka: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(angka);
    };

    const toggleExpand = (id: number) => {
        setExpandedStudent(expandedStudent === id ? null : id);
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Tunggakan SPP', href: '/tuition-arrears' }]}>
            <Head title="Tunggakan SPP" />

            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <a href="/dashboard">
                            <button className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800">
                                <ArrowLeft className="h-5 w-5" />
                            </button>
                        </a>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Tunggakan SPP</h1>
                            <p className="text-sm text-slate-500">Daftar siswa dengan tunggakan pembayaran SPP</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => window.open('/tuition-arrears/export-all', '_blank')}
                            className="flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                        >
                            <Download className="h-4 w-4" />
                            Export Semua
                        </button>
                        <button
                            onClick={() => setShowExportModal(true)}
                            className="flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                        >
                            <FileSpreadsheet className="h-4 w-4" />
                            Export per Bulan
                        </button>
                    </div>
                </div>

                {showExportModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                        <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg dark:bg-slate-900">
                            <h3 className="mb-4 text-lg font-semibold">Export Tunggakan per Bulan</h3>
                            <select
                                className="mb-4 w-full rounded-lg border border-slate-300 px-4 py-2 dark:border-slate-600 dark:bg-slate-800"
                                value={selectedExportMonth}
                                onChange={(e) => setSelectedExportMonth(e.target.value)}
                            >
                                <option value="">Pilih Bulan</option>
                                {availableMonths.map((m) => (
                                    <option key={m.id} value={m.id}>
                                        {m.label}
                                    </option>
                                ))}
                            </select>
                            <div className="flex justify-end gap-2">
                                <button
                                    onClick={() => setShowExportModal(false)}
                                    className="rounded-lg px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={() => {
                                        if (selectedExportMonth) {
                                            window.open(`/tuition-arrears/export-month?spp_month_id=${selectedExportMonth}`, '_blank');
                                            setShowExportModal(false);
                                        }
                                    }}
                                    disabled={!selectedExportMonth}
                                    className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Export
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="rounded-xl border border-rose-200 bg-rose-50 p-5 dark:border-rose-900 dark:bg-rose-950/30">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-900/50">
                                <User className="h-5 w-5 text-rose-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-rose-600 dark:text-rose-400">Total Siswa Menunggak</p>
                                <p className="text-2xl font-bold text-rose-700 dark:text-rose-300">{summary.total_students}</p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-900 dark:bg-amber-950/30">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/50">
                                <Wallet className="h-5 w-5 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-amber-600 dark:text-amber-400">Total Tunggakan</p>
                                <p className="text-xl font-bold text-amber-700 dark:text-amber-300">{formatRupiah(summary.total_arrears)}</p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-800">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700">
                                <AlertTriangle className="h-5 w-5 text-slate-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Rata-rata Tunggakan</p>
                                <p className="text-xl font-bold text-slate-700 dark:text-slate-300">
                                    {summary.total_students > 0 ? formatRupiah(Math.round(summary.total_arrears / summary.total_students)) : 'Rp 0'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-4 sm:flex-row">
                    <div className="relative flex-1">
                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Cari nama atau NISN..."
                            className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-4 dark:border-slate-600 dark:bg-slate-800"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <select
                        className="rounded-lg border border-slate-300 px-4 py-2 dark:border-slate-600 dark:bg-slate-800"
                        value={selectedClass}
                        onChange={(e) => setSelectedClass(e.target.value)}
                    >
                        <option value="all">Semua Kelas</option>
                        {classes.map((cls) => (
                            <option key={cls} value={cls}>
                                Kelas {cls}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/50">
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Siswa</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold uppercase text-slate-500">Kelas</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold uppercase text-slate-500">Tunggakan</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-slate-500">Total</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold uppercase text-slate-500">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {filteredStudents.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                                        {students.length === 0 ? 'Tidak ada data tunggakan' : 'Tidak ada siswa yang cocok'}
                                    </td>
                                </tr>
                            ) : (
                                filteredStudents.map((student) => (
                                    <>
                                        <tr key={student.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                            <td className="px-4 py-3">
                                                <div>
                                                    <p className="font-medium text-slate-900 dark:text-white">{student.name}</p>
                                                    <p className="text-sm text-slate-500">NISN: {student.nisn}</p>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <span className="rounded-full bg-slate-100 px-2 py-1 text-sm dark:bg-slate-800">
                                                    {student.class ? `Kelas ${student.class}` : '-'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <span className="rounded-full bg-rose-100 px-2 py-1 text-sm font-medium text-rose-700 dark:bg-rose-900/30 dark:text-rose-400">
                                                    {student.arrears_count} bulan
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <span className="font-semibold text-rose-600 dark:text-rose-400">
                                                    {formatRupiah(student.total_arrears)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <button
                                                    onClick={() => toggleExpand(student.id)}
                                                    className="rounded-lg px-3 py-1 text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
                                                >
                                                    {expandedStudent === student.id ? 'Tutup' : 'Detail'}
                                                </button>
                                            </td>
                                        </tr>
                                        {expandedStudent === student.id && (
                                            <tr>
                                                <td colSpan={5} className="bg-slate-50 px-4 py-4 dark:bg-slate-800/30">
                                                    <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
                                                        <h4 className="mb-3 font-semibold text-slate-900 dark:text-white">Bulan yang belum dibayar:</h4>
                                                        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                                                            {student.unpaid_months.map((month) => (
                                                                <div
                                                                    key={month.id}
                                                                    className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm dark:border-amber-900 dark:bg-amber-950/30"
                                                                >
                                                                    <span className="font-medium">{month.month_name}</span>
                                                                    <span className="text-slate-500"> {month.year}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <div className="mt-3 flex justify-end">
                                                            <a
                                                                href={`/siswa/${student.id}`}
                                                                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700"
                                                            >
                                                                Bayar Sekarang
                                                            </a>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}