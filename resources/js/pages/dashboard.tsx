import AppLayout from '@/layouts/app-layout';
import { Transaction, TransactionSummary } from '@/types';
import { Head } from '@inertiajs/react';
import { ArrowDownRight, ArrowUpDown, ArrowUpRight, BarChart3, Clock, PieChart } from 'lucide-react';
import { useState } from 'react';

interface Props {
    latest_transactions?: Transaction[];
    chart_data?: {
        in_categories: { category: string; total: number }[];
        out_categories: { category: string; total: number }[];
        monthly_trend: { year: number; month: number; in: number; out: number }[];
    };
    summary: TransactionSummary;
}

export default function Index({ latest_transactions = [], chart_data, summary }: Props) {
    const [catTab, setCatTab] = useState<'in' | 'out'>('in');

    const formatRupiah = (angka: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(angka);
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }]}>
            <Head title="Dashboard" />

            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
                        <p className="text-sm text-slate-500">Kelola semua pemasukan dan pengeluaran</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 dark:border-emerald-900 dark:bg-emerald-950/30">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/50">
                                <ArrowDownRight className="h-5 w-5 text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Total Masuk</p>
                                <p className="text-xl font-bold text-emerald-700 dark:text-emerald-300">{formatRupiah(summary.total_in)}</p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-rose-200 bg-rose-50 p-5 dark:border-rose-900 dark:bg-rose-950/30">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-900/50">
                                <ArrowUpRight className="h-5 w-5 text-rose-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-rose-600 dark:text-rose-400">Total Keluar</p>
                                <p className="text-xl font-bold text-rose-700 dark:text-rose-300">{formatRupiah(summary.total_out)}</p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-900 dark:bg-amber-950/30">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/50">
                                <ArrowUpDown className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-amber-600 dark:text-amber-400">Saldo</p>
                                <p className="text-xl font-bold text-amber-700 dark:text-amber-300">{formatRupiah(summary.balance)}</p>
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
