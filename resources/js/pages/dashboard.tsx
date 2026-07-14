import AppLayout from '@/layouts/app-layout';
import { Transaction, TransactionSummary } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowDownRight, ArrowUpDown, ArrowUpRight, BarChart3, Clock, GraduationCap, PieChart, UserCheck, Users } from 'lucide-react';
import { useState } from 'react';

interface Props {
    latest_transactions?: Transaction[];
    chart_data?: {
        in_categories: { category: string; total: number }[];
        out_categories: { category: string; total: number }[];
        monthly_trend: { year: number; month: number; in: number; out: number }[];
    };
    summary: TransactionSummary;
    student_stats?: {
        total_aktif: number;
        santriwan_aktif: number;
        santriwati_aktif: number;
        total_non_aktif: number;
    };
}

export default function Index({ latest_transactions = [], chart_data, summary, student_stats }: Props) {
    const [catTab, setCatTab] = useState<'in' | 'out'>('in');

    const formatRupiah = (angka?: number) => {
        const val = Number(angka || 0);
        if (isNaN(val)) return 'Rp 0';
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }]}>
            <Head title="Dashboard Utama" />

            <div className="space-y-6 p-6">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Dashboard Utama</h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Pantau populasi santri dayah serta arus kas keuangan secara realtime.</p>
                    </div>
                </div>

                {/* RINGKASAN POPULASI SISWA & SANTRI DAYAH */}
                <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-200/80 pb-2 dark:border-slate-800">
                        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                            <Users className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                            Statistik Santri & Siswa Dayah
                        </h2>
                        <Link href="/siswa" className="text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400 self-start sm:self-auto">
                            Kelola Pusat Data Siswa →
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        <Link
                            href="/siswa?status=aktif"
                            className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br from-white via-indigo-50/20 to-indigo-50/50 p-4 shadow-xs transition-all hover:border-indigo-400 hover:shadow-md dark:border-slate-800 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/30"
                        >
                            <div className="flex items-center justify-between gap-2">
                                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">Total Santri Aktif</span>
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 transition group-hover:scale-110 dark:bg-indigo-500/20 dark:text-indigo-400">
                                    <Users className="h-4.5 w-4.5" />
                                </div>
                            </div>
                            <div className="mt-2 flex items-baseline gap-1.5 min-w-0">
                                <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white truncate">{student_stats?.total_aktif || 0}</span>
                                <span className="text-xs font-medium text-slate-500 shrink-0">Siswa</span>
                            </div>
                            <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 truncate">Total santri aktif menimba ilmu</p>
                        </Link>

                        <Link
                            href="/santriwan"
                            className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br from-white via-blue-50/20 to-blue-50/50 p-4 shadow-xs transition-all hover:border-blue-400 hover:shadow-md dark:border-slate-800 dark:from-slate-900 dark:via-slate-900 dark:to-blue-950/30"
                        >
                            <div className="flex items-center justify-between gap-2">
                                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">Santriwan (Putra)</span>
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 transition group-hover:scale-110 dark:bg-blue-500/20 dark:text-blue-400">
                                    <UserCheck className="h-4.5 w-4.5" />
                                </div>
                            </div>
                            <div className="mt-2 flex items-baseline gap-1.5 min-w-0">
                                <span className="text-2xl sm:text-3xl font-extrabold text-blue-600 dark:text-blue-400 truncate">{student_stats?.santriwan_aktif || 0}</span>
                                <span className="text-xs font-medium text-slate-500 shrink-0">Siswa</span>
                            </div>
                            <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 truncate">Remaja putra berstatus aktif</p>
                        </Link>

                        <Link
                            href="/santriwati"
                            className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br from-white via-pink-50/20 to-pink-50/50 p-4 shadow-xs transition-all hover:border-pink-400 hover:shadow-md dark:border-slate-800 dark:from-slate-900 dark:via-slate-900 dark:to-pink-950/30"
                        >
                            <div className="flex items-center justify-between gap-2">
                                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">Santriwati (Putri)</span>
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-pink-500/10 text-pink-600 transition group-hover:scale-110 dark:bg-pink-500/20 dark:text-pink-400">
                                    <Users className="h-4.5 w-4.5" />
                                </div>
                            </div>
                            <div className="mt-2 flex items-baseline gap-1.5 min-w-0">
                                <span className="text-2xl sm:text-3xl font-extrabold text-pink-600 dark:text-pink-400 truncate">{student_stats?.santriwati_aktif || 0}</span>
                                <span className="text-xs font-medium text-slate-500 shrink-0">Siswa</span>
                            </div>
                            <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 truncate">Remaja putri berstatus aktif</p>
                        </Link>

                        <Link
                            href="/siswa?status=lulus"
                            className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br from-white via-amber-50/20 to-amber-50/50 p-4 shadow-xs transition-all hover:border-amber-400 hover:shadow-md dark:border-slate-800 dark:from-slate-900 dark:via-slate-900 dark:to-amber-950/30"
                        >
                            <div className="flex items-center justify-between gap-2">
                                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">Alumni & Non-Aktif</span>
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 transition group-hover:scale-110 dark:bg-amber-500/20 dark:text-amber-400">
                                    <GraduationCap className="h-4.5 w-4.5" />
                                </div>
                            </div>
                            <div className="mt-2 flex items-baseline gap-1.5 min-w-0">
                                <span className="text-2xl sm:text-3xl font-extrabold text-slate-700 dark:text-slate-300 truncate">{student_stats?.total_non_aktif || 0}</span>
                                <span className="text-xs font-medium text-slate-500 shrink-0">Siswa</span>
                            </div>
                            <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 truncate">Lulus, pindah, atau keluar</p>
                        </Link>
                    </div>
                </div>

                {/* RINGKASAN DATA KEUANGAN */}
                <div className="space-y-3 pt-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-200/80 pb-2 dark:border-slate-800">
                        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                            <ArrowUpDown className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                            Ringkasan Arus Kas Keuangan
                        </h2>
                        <Link href="/payment" className="text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400 self-start sm:self-auto">
                            Buka Buku Transaksi →
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        <div className="flex flex-col justify-between rounded-2xl border border-emerald-200/80 bg-gradient-to-br from-white via-emerald-50/30 to-emerald-50 p-4 sm:p-5 shadow-xs transition-all hover:shadow-md dark:border-emerald-900/60 dark:from-slate-900 dark:via-slate-900 dark:to-emerald-950/30">
                            <div className="flex items-center justify-between gap-2">
                                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">Total Pemasukan</span>
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                                    <ArrowDownRight className="h-5 w-5" />
                                </div>
                            </div>
                            <div className="mt-3 min-w-0">
                                <p className="text-lg sm:text-xl lg:text-lg xl:text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight truncate" title={formatRupiah(summary.total_in)}>
                                    {formatRupiah(summary.total_in)}
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col justify-between rounded-2xl border border-rose-200/80 bg-gradient-to-br from-white via-rose-50/30 to-rose-50 p-4 sm:p-5 shadow-xs transition-all hover:shadow-md dark:border-rose-900/60 dark:from-slate-900 dark:via-slate-900 dark:to-rose-950/30">
                            <div className="flex items-center justify-between gap-2">
                                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">Total Pengeluaran</span>
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400">
                                    <ArrowUpRight className="h-5 w-5" />
                                </div>
                            </div>
                            <div className="mt-3 min-w-0">
                                <p className="text-lg sm:text-xl lg:text-lg xl:text-2xl font-extrabold text-rose-600 dark:text-rose-400 tracking-tight truncate" title={formatRupiah(summary.total_out)}>
                                    {formatRupiah(summary.total_out)}
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col justify-between rounded-2xl border border-amber-200/80 bg-gradient-to-br from-white via-amber-50/30 to-amber-50 p-4 sm:p-5 shadow-xs sm:col-span-2 lg:col-span-1 transition-all hover:shadow-md dark:border-amber-900/60 dark:from-slate-900 dark:via-slate-900 dark:to-amber-950/30">
                            <div className="flex items-center justify-between gap-2">
                                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">Saldo Kas Bersih</span>
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
                                    <ArrowUpDown className="h-5 w-5" />
                                </div>
                            </div>
                            <div className="mt-3 min-w-0">
                                <p className="text-lg sm:text-xl lg:text-lg xl:text-2xl font-extrabold text-amber-600 dark:text-amber-400 tracking-tight truncate" title={formatRupiah(summary.balance)}>
                                    {formatRupiah(summary.balance)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* BAGIAN VISUALISASI DATA & 5 TRANSAKSI TERBARU */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* GRAFIK TREN 6 BULAN */}
                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
                            <div className="flex items-center gap-2">
                                <BarChart3 className="h-5 w-5 text-emerald-700 dark:text-emerald-400" />
                                <h2 className="font-semibold text-slate-900 dark:text-white">Tren Arus Kas (6 Bulan Terakhir)</h2>
                            </div>
                            <div className="flex items-center gap-3 text-xs font-medium">
                                <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span> Masuk
                                </span>
                                <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
                                    <span className="h-2.5 w-2.5 rounded-full bg-rose-500"></span> Keluar
                                </span>
                            </div>
                        </div>

                        <div className="mt-4 space-y-4">
                            {(() => {
                                const maxVal = Math.max(...(chart_data?.monthly_trend || []).flatMap((m) => [m.in, m.out]), 1);
                                return (chart_data?.monthly_trend || []).map((m, idx) => {
                                    const dateObj = new Date(2000, m.month - 1, 1);
                                    const monthLabel = `${dateObj.toLocaleString('id-ID', { month: 'short' })} ${m.year}`;
                                    const inPct = Math.round((m.in / maxVal) * 100);
                                    const outPct = Math.round((m.out / maxVal) * 100);

                                    return (
                                        <div key={idx} className="space-y-1.5 border-b border-slate-100 pb-3 last:border-0 last:pb-0 dark:border-slate-800/50">
                                            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{monthLabel}</span>
                                            <div className="space-y-1.5 pt-0.5">
                                                <div className="flex items-center gap-2 text-xs">
                                                    <span className="w-12 text-[11px] text-slate-500">Masuk</span>
                                                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                                                        <div style={{ width: `${inPct}%` }} className="h-full bg-emerald-500 transition-all duration-500" />
                                                    </div>
                                                    <span className="w-24 text-right font-medium text-emerald-600 dark:text-emerald-400">{formatRupiah(m.in)}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs">
                                                    <span className="w-12 text-[11px] text-slate-500">Keluar</span>
                                                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                                                        <div style={{ width: `${outPct}%` }} className="h-full bg-rose-500 transition-all duration-500" />
                                                    </div>
                                                    <span className="w-24 text-right font-medium text-rose-600 dark:text-rose-400">{formatRupiah(m.out)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                });
                            })()}
                        </div>
                    </div>

                    {/* BREAKDOWN KATEGORI */}
                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
                            <div className="flex items-center gap-2">
                                <PieChart className="h-5 w-5 text-emerald-700 dark:text-emerald-400" />
                                <h2 className="font-semibold text-slate-900 dark:text-white">Proporsi Kategori</h2>
                            </div>
                            <div className="flex rounded-lg bg-slate-100 p-0.5 text-xs font-medium dark:bg-slate-800">
                                <button
                                    onClick={() => setCatTab('in')}
                                    className={`rounded-md px-2.5 py-1 transition-all ${catTab === 'in' ? 'bg-white text-emerald-600 shadow-sm dark:bg-slate-700 dark:text-emerald-400 font-semibold' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
                                >
                                    Pemasukan
                                </button>
                                <button
                                    onClick={() => setCatTab('out')}
                                    className={`rounded-md px-2.5 py-1 transition-all ${catTab === 'out' ? 'bg-white text-rose-600 shadow-sm dark:bg-slate-700 dark:text-rose-400 font-semibold' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
                                >
                                    Pengeluaran
                                </button>
                            </div>
                        </div>

                        <div className="mt-4 space-y-4">
                            {(() => {
                                const activeList = catTab === 'in' ? chart_data?.in_categories || [] : chart_data?.out_categories || [];
                                const totalSum = activeList.reduce((acc, curr) => acc + Number(curr.total), 0);

                                if (activeList.length === 0) {
                                    return <p className="py-12 text-center text-sm text-slate-400">Belum ada data kategori untuk filter ini.</p>;
                                }

                                return activeList.slice(0, 6).map((cat, idx) => {
                                    const pct = totalSum > 0 ? Math.round((Number(cat.total) / totalSum) * 100) : 0;
                                    const barColor = catTab === 'in' ? 'bg-emerald-500' : 'bg-rose-500';

                                    return (
                                        <div key={idx} className="space-y-1.5 border-b border-slate-100 pb-3 last:border-0 last:pb-0 dark:border-slate-800/50">
                                            <div className="flex justify-between text-xs">
                                                <span className="font-medium text-slate-700 dark:text-slate-300">{cat.category}</span>
                                                <span className="font-semibold text-slate-900 dark:text-white">
                                                    {formatRupiah(Number(cat.total))} <span className="text-slate-400 font-normal">({pct}%)</span>
                                                </span>
                                            </div>
                                            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                                                <div style={{ width: `${pct}%` }} className={`h-full ${barColor} transition-all duration-500`} />
                                            </div>
                                        </div>
                                    );
                                });
                            })()}
                        </div>
                    </div>
                </div>

                {/* 5 TRANSAKSI TERBARU */}
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                            <Clock className="h-5 w-5 text-emerald-700 dark:text-emerald-400" />
                            <h2 className="font-semibold text-slate-900 dark:text-white">5 Transaksi Terbaru</h2>
                        </div>
                        <span className="text-xs text-slate-500">Aktivitas transaksi terakhir yang dicatat</span>
                    </div>

                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {(!latest_transactions || latest_transactions.length === 0) ? (
                            <p className="py-8 text-center text-sm text-slate-400">Belum ada transaksi.</p>
                        ) : (
                            latest_transactions.map((t) => (
                                <div key={t.id} className="flex flex-col justify-between py-3.5 sm:flex-row sm:items-center">
                                    <div className="flex items-start gap-3">
                                        <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${t.type === 'in' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400' : 'bg-rose-100 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400'}`}>
                                            {t.type === 'in' ? <ArrowDownRight className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="font-medium text-sm text-slate-900 dark:text-white">{t.category}</p>
                                                <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                                                    {t.transaction_id}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-500">
                                                {t.student ? t.student.name : (t.note || 'Tidak ada catatan')} • {formatDate(t.transaction_date)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="mt-2 text-left font-semibold sm:mt-0 sm:text-right">
                                        <span className={`text-sm ${t.type === 'in' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                            {t.type === 'in' ? '+' : '-'} {formatRupiah(t.amount)}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
