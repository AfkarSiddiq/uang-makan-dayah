import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SearchInput } from '@/components/ui/search-input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { Transaction, TransactionSummary } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Clock, Download, Eye, Filter, History, Printer, Search, ShieldAlert, User, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface TransactionLog {
    id: number;
    action: string;
    created_at: string;
    user?: { id: number; name: string };
}

interface TransactionWithLogs extends Transaction {
    logs?: TransactionLog[];
}

interface Props {
    transactions: {
        data: TransactionWithLogs[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
    };
    summary: TransactionSummary;
    filters: {
        type?: string;
        category?: string;
        date_from?: string;
        date_to?: string;
        search?: string;
        sort_by?: string;
        sort_dir?: string;
        per_page?: string;
    };
    categories: {
        in: string[];
        out: string[];
    };
    allowedTypes: string[];
}

const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

function formatSppMonthsCompact(sppPayments: { sppMonth: { year: number; month: number } }[]): string {
    if (!sppPayments || sppPayments.length === 0) return '';

    const grouped: Record<number, number[]> = {};
    for (const sp of sppPayments) {
        const year = sp.sppMonth.year;
        const month = sp.sppMonth.month;
        if (!grouped[year]) grouped[year] = [];
        grouped[year].push(month);
    }

    const parts: string[] = [];
    for (const year of Object.keys(grouped).map(Number).sort()) {
        const names = grouped[year].sort((a, b) => a - b).map(m => shortMonths[m - 1]);
        parts.push(`${names.join(', ')} ${year}`);
    }
    return parts.join(', ');
}

export default function Index({ transactions, summary, filters, categories, allowedTypes }: Props) {
    const [showFilters, setShowFilters] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState<TransactionWithLogs | null>(null);
    const [localFilters, setLocalFilters] = useState({
        type: filters.type || '',
        category: filters.category || '',
        date_from: filters.date_from || '',
        date_to: filters.date_to || '',
        search: filters.search || '',
        sort_by: filters.sort_by || 'transaction_date',
        sort_dir: filters.sort_dir || 'desc',
        per_page: filters.per_page || '10',
    });

    useEffect(() => {
        const currentType = filters.type || '';
        const validType = currentType && allowedTypes.includes(currentType) ? currentType : '';
        setLocalFilters({
            type: validType,
            category: filters.category || '',
            date_from: filters.date_from || '',
            date_to: filters.date_to || '',
            search: filters.search || '',
            sort_by: filters.sort_by || 'transaction_date',
            sort_dir: filters.sort_dir || 'desc',
            per_page: filters.per_page || '10',
        });
    }, [filters.type, filters.category, filters.date_from, filters.date_to, filters.search, filters.sort_by, filters.sort_dir, filters.per_page, allowedTypes]);

    const applyFilters = (newFilters: Record<string, string>) => {
        router.get(
            route('history'),
            { ...localFilters, ...newFilters },
            { replace: true, preserveState: true, only: ['transactions', 'summary', 'filters'] },
        );
    };

    const clearFilters = () => {
        setLocalFilters({ type: '', category: '', date_from: '', date_to: '', search: '', sort_by: 'transaction_date', sort_dir: 'desc', per_page: '10' });
        router.get(route('history'));
    };

    const applyFilter = () => {
        applyFilters(localFilters);
    };

    const formatRupiah = (angka: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(angka);
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const hasActiveFilters = filters.type || filters.category || filters.date_from || filters.date_to || filters.search;

    return (
        <AppLayout breadcrumbs={[{ title: 'Riwayat & Audit Log', href: '/payment-history' }]}>
            <Head title="Log Riwayat & Audit" />

            <div className="space-y-6 p-6">
                {/* HEADER KHUSUS RIWAYAT */}
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-3.5">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 shadow-sm dark:bg-indigo-950/50 dark:text-indigo-400">
                            <History className="h-6 w-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Log Riwayat & Audit Transaksi</h1>
                            <p className="text-sm text-slate-500">Pantau jejak pencatatan, waktu rekam aktivitas, serta riwayat perubahan data keuangan</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <a href={route('transaction.export', localFilters)} download>
                            <Button variant="outline" className="bg-white shadow-sm dark:bg-slate-900">
                                <Download className="mr-2 h-4 w-4" />
                                Export Log Audit
                            </Button>
                        </a>
                    </div>
                </div>

                {/* SUMMARY CARDS RINGKAS */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {(allowedTypes.includes('in') || allowedTypes.length === 0) && (
                        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Masuk (Tersaring)</span>
                            <p className="mt-1 text-lg font-bold text-emerald-600 dark:text-emerald-400">{formatRupiah(summary.total_in)}</p>
                        </div>
                    )}
                    {(allowedTypes.includes('out') || allowedTypes.length === 0) && (
                        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Keluar (Tersaring)</span>
                            <p className="mt-1 text-lg font-bold text-rose-600 dark:text-rose-400">{formatRupiah(summary.total_out)}</p>
                        </div>
                    )}
                    {allowedTypes.length !== 1 && (
                        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Selisih Arus Kas</span>
                            <p className="mt-1 text-lg font-bold text-indigo-600 dark:text-indigo-400">{formatRupiah(summary.balance)}</p>
                        </div>
                    )}
                </div>

                {/* MODAL DETAIL DAN JEJAK AUDIT */}
                {selectedTransaction && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
                        <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-xl dark:bg-slate-900">
                            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-6 py-4 dark:border-slate-800 dark:bg-slate-800/30">
                                <div className="flex items-center gap-2">
                                    <History className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Detail Audit Transaksi</h3>
                                </div>
                                <button
                                    onClick={() => setSelectedTransaction(null)}
                                    className="text-slate-400 transition-colors hover:text-slate-600 dark:hover:text-slate-300"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="space-y-4 p-6">
                                <div className="border-b border-slate-100 pb-4 text-center dark:border-slate-800">
                                    <p className="mb-1 text-xs font-semibold text-slate-400 uppercase tracking-wider">Nominal Transaksi</p>
                                    <p
                                        className={`text-3xl font-bold ${selectedTransaction.type === 'in' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}
                                    >
                                        {selectedTransaction.type === 'in' ? '+' : '-'} {formatRupiah(selectedTransaction.amount)}
                                    </p>
                                    <span
                                        className={`mt-2 inline-flex items-center rounded px-2.5 py-0.5 text-xs font-bold tracking-wider uppercase ${
                                            selectedTransaction.type === 'in'
                                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30'
                                                : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30'
                                        }`}
                                    >
                                        {selectedTransaction.type === 'in' ? 'UANG MASUK' : 'UANG KELUAR'}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-x-4 gap-y-4 text-sm">
                                    <div>
                                        <p className="mb-1 text-xs text-slate-400 uppercase font-semibold">Pencatat / Admin</p>
                                        <p className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-slate-200">
                                            <User className="h-4 w-4 text-indigo-500" />
                                            {selectedTransaction.user?.name || 'Sistem / Otomatis'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="mb-1 text-xs text-slate-400 uppercase font-semibold">Waktu Transaksi</p>
                                        <p className="font-medium text-slate-900 dark:text-slate-200">
                                            {formatDate(selectedTransaction.transaction_date)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="mb-1 text-xs text-slate-400 uppercase font-semibold">ID Referensi</p>
                                        <p className="font-mono font-medium text-slate-900 dark:text-slate-200">
                                            {selectedTransaction.transaction_id}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="mb-1 text-xs text-slate-400 uppercase font-semibold">Kategori</p>
                                        <p className="font-medium text-slate-900 dark:text-slate-200">{selectedTransaction.category}</p>
                                    </div>
                                    <div>
                                        <p className="mb-1 text-xs text-slate-400 uppercase font-semibold">Siswa Terkait</p>
                                        <p className="font-medium text-indigo-600 dark:text-indigo-400">
                                            {selectedTransaction.student ? selectedTransaction.student.name : '-'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="mb-1 text-xs text-slate-400 uppercase font-semibold">Status Audit</p>
                                        {selectedTransaction.logs && selectedTransaction.logs.length > 0 ? (
                                            <span className="inline-flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400">
                                                <ShieldAlert className="h-4 w-4" /> Pernah Diedit ({selectedTransaction.logs.length}x)
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-400">
                                                <Clock className="h-4 w-4 text-slate-400" /> Rekam Asli
                                            </span>
                                        )}
                                    </div>
                                    <div className="col-span-2 rounded-lg border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/50">
                                        <p className="mb-1 text-xs text-slate-400 uppercase font-semibold">Catatan Transaksi</p>
                                        <p className="font-medium text-slate-900 dark:text-slate-200">
                                            {selectedTransaction.note || <span className="italic opacity-50">Tidak ada catatan</span>}
                                        </p>
                                    </div>
                                </div>

                                {/* BULAN SPP */}
                                {selectedTransaction.category === 'SPP' && selectedTransaction.sppPayments && selectedTransaction.sppPayments.length > 0 && (
                                    <div className="border-t border-slate-100 pt-4 dark:border-slate-800">
                                        <p className="mb-3 flex items-center gap-1.5 text-xs font-bold tracking-wider text-indigo-700 uppercase dark:text-indigo-400">
                                            Bulan SPP yang Dibayar
                                        </p>
                                        <div className="space-y-2">
                                            {selectedTransaction.sppPayments.map((sp: SppPayment) => (
                                                <div
                                                    key={sp.id}
                                                    className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 p-2.5 dark:border-slate-800 dark:bg-slate-800/30"
                                                >
                                                    <span className="text-sm font-semibold text-slate-900 dark:text-slate-200">
                                                        {months[sp.sppMonth.month - 1]} {sp.sppMonth.year}
                                                    </span>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                                            {formatRupiah(sp.paid_amount)}
                                                        </span>
                                                        <span
                                                            className={`inline-flex items-center rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                                                                sp.status === 'paid'
                                                                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                                                    : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                                            }`}
                                                        >
                                                            {sp.status === 'paid' ? 'Lunas' : 'Cicilan'}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* JEJAK PERUBAHAN */}
                                {selectedTransaction.logs && selectedTransaction.logs.length > 0 && (
                                    <div className="col-span-2 mt-4 border-t border-slate-100 pt-4 dark:border-slate-800">
                                        <p className="mb-3 flex items-center gap-1.5 text-xs font-bold tracking-wider text-amber-700 uppercase dark:text-amber-400">
                                            <ShieldAlert className="h-4 w-4" /> Jejak Perubahan Data (Audit Trail)
                                        </p>
                                        <div className="max-h-36 space-y-2.5 overflow-y-auto pr-2">
                                            {selectedTransaction.logs.map((log: TransactionLog) => (
                                                <div
                                                    key={log.id}
                                                    className="rounded-lg border border-amber-200/80 bg-amber-50/80 p-3 text-xs text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300"
                                                >
                                                    <div className="mb-1.5 flex items-center justify-between border-b border-amber-200/50 pb-1 dark:border-amber-800/50">
                                                        <span className="flex items-center gap-1 font-bold">
                                                            <User className="h-3 w-3" /> {log.user?.name || 'Sistem'}
                                                        </span>
                                                        <span className="text-[10px] opacity-75">
                                                            {new Date(log.created_at).toLocaleString('id-ID')}
                                                        </span>
                                                    </div>
                                                    <p>
                                                        Tindakan: <span className="font-bold uppercase underline">{log.action}</span>
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end gap-3 border-t border-slate-100 bg-slate-50/50 px-6 py-4 dark:border-slate-800 dark:bg-slate-800/30">
                                <Button variant="outline" onClick={() => setSelectedTransaction(null)} className="bg-white dark:bg-slate-900">
                                    Tutup
                                </Button>
                                {selectedTransaction.id && (
                                    <a href={`/payment/${selectedTransaction.id}/print`} target="_blank" rel="noreferrer">
                                        <Button className="flex items-center gap-2 bg-indigo-600 text-white hover:bg-indigo-700">
                                            <Printer className="h-4 w-4" /> Cetak Bukti
                                        </Button>
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* PANEL UTAMA LOG AUDIT */}
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex flex-col gap-4 border-b border-slate-200 bg-slate-50/50 p-4 sm:flex-row dark:border-slate-800 dark:bg-slate-800/20">
                        <SearchInput
                            value={localFilters.search}
                            onChange={(value) => setLocalFilters({ ...localFilters, search: value })}
                            onSubmit={applyFilter}
                            onClear={() => setLocalFilters({ ...localFilters, search: '' })}
                            placeholder="Cari nomor transaksi, catatan, siswa..."
                            showButton
                        />
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)} className="bg-white dark:bg-slate-900">
                                <Filter className="mr-2 h-4 w-4" />
                                Filter Log
                                {hasActiveFilters && <span className="ml-2 h-2 w-2 rounded-full bg-indigo-500" />}
                            </Button>
                            {hasActiveFilters && (
                                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-slate-500 hover:text-slate-700">
                                    <X className="mr-1 h-4 w-4" />
                                    Reset
                                </Button>
                            )}
                        </div>
                    </div>

                    {showFilters && (
                        <div className="grid grid-cols-1 gap-4 border-b border-slate-200 bg-slate-50 p-4 sm:grid-cols-2 lg:grid-cols-4 dark:border-slate-800 dark:bg-slate-800/50">
                            <div>
                                <label className="mb-1 block text-xs font-semibold tracking-wider text-slate-500 uppercase">Tipe Arus</label>
                                <Select
                                    value={localFilters.type || 'all'}
                                    onValueChange={(value) => setLocalFilters({ ...localFilters, type: value === 'all' ? '' : value })}
                                >
                                    <SelectTrigger className="bg-white dark:bg-slate-900">
                                        <SelectValue placeholder="Semua" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {allowedTypes.length !== 1 && <SelectItem value="all">Semua Arus</SelectItem>}
                                        {allowedTypes.includes('in') && <SelectItem value="in">Uang Masuk</SelectItem>}
                                        {allowedTypes.includes('out') && <SelectItem value="out">Uang Keluar</SelectItem>}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-semibold tracking-wider text-slate-500 uppercase">Kategori</label>
                                <Select
                                    value={localFilters.category || 'all'}
                                    onValueChange={(value) => setLocalFilters({ ...localFilters, category: value === 'all' ? '' : value })}
                                >
                                    <SelectTrigger className="bg-white dark:bg-slate-900">
                                        <SelectValue placeholder="Semua" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Kategori</SelectItem>
                                        {categories.in.map((cat) => (
                                            <SelectItem key={cat} value={cat}>
                                                {cat}
                                            </SelectItem>
                                        ))}
                                        {categories.out.map((cat) => (
                                            <SelectItem key={cat} value={cat}>
                                                {cat}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-semibold tracking-wider text-slate-500 uppercase">Dari Tanggal</label>
                                <Input
                                    type="date"
                                    className="bg-white dark:bg-slate-900"
                                    value={localFilters.date_from}
                                    onChange={(e) => setLocalFilters({ ...localFilters, date_from: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-semibold tracking-wider text-slate-500 uppercase">Sampai Tanggal</label>
                                <div className="flex gap-2">
                                    <Input
                                        type="date"
                                        className="bg-white dark:bg-slate-900"
                                        value={localFilters.date_to}
                                        onChange={(e) => setLocalFilters({ ...localFilters, date_to: e.target.value })}
                                    />
                                    <Button onClick={applyFilter} className="shrink-0 bg-indigo-600 hover:bg-indigo-700">
                                        <Search className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TABEL AUDIT TRAIL KHUSUS RIWAYAT */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-semibold tracking-wider text-slate-500 uppercase dark:border-slate-800 dark:bg-slate-800/30">
                                    <th className="px-5 py-3.5 text-left">Waktu & Pencatat</th>
                                    <th className="px-5 py-3.5 text-left">ID & Kategori</th>
                                    <th className="px-5 py-3.5 text-left">Subjek / Keterangan</th>
                                    <th className="px-5 py-3.5 text-left">Status Audit</th>
                                    <th className="px-5 py-3.5 text-right">Nominal</th>
                                    <th className="px-5 py-3.5 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                                {transactions.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-14 text-center">
                                            <div className="flex flex-col items-center justify-center gap-2 text-slate-400">
                                                <History className="h-10 w-10 opacity-40" />
                                                <p className="text-base font-medium text-slate-500">Log riwayat tidak ditemukan</p>
                                                <p className="text-xs">Tidak ada catatan transaksi yang sesuai dengan filter Anda.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    transactions.data.map((transaction) => (
                                        <tr
                                            key={transaction.id}
                                            onClick={() => setSelectedTransaction(transaction)}
                                            className="group cursor-pointer transition-colors hover:bg-indigo-50/60 dark:hover:bg-indigo-950/20"
                                        >
                                            <td className="px-5 py-3.5 whitespace-nowrap">
                                                <div className="flex flex-col gap-1">
                                                    <span className="font-semibold text-slate-900 group-hover:text-indigo-600 dark:text-slate-200 dark:group-hover:text-indigo-400">
                                                        {formatDate(transaction.transaction_date)}
                                                    </span>
                                                    <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                                                        <User className="h-3 w-3 text-slate-400" />
                                                        {transaction.user?.name || 'Sistem'}
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="px-5 py-3.5 whitespace-nowrap">
                                                <div className="flex flex-col gap-1">
                                                    <span className="font-mono text-xs font-bold text-slate-600 dark:text-slate-400">
                                                        {transaction.transaction_id}
                                                    </span>
                                                    <span className="inline-block w-fit rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                                        {transaction.category}
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="min-w-[220px] px-5 py-3.5">
                                                <div className="flex flex-col">
                                                    {transaction.student ? (
                                                        <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                                                            {transaction.student.name}
                                                        </span>
                                                    ) : null}
                                                    {transaction.category === 'SPP' && transaction.sppPayments && transaction.sppPayments.length > 0 && (
                                                        <span className="mt-0.5 inline-flex flex-wrap gap-1">
                                                            <span className="rounded bg-indigo-100 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300">
                                                                {formatSppMonthsCompact(transaction.sppPayments)}
                                                            </span>
                                                        </span>
                                                    )}
                                                    <span className="line-clamp-2 text-xs text-slate-500 dark:text-slate-400">
                                                        {transaction.note || <span className="italic opacity-50">Tanpa catatan</span>}
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="px-5 py-3.5 whitespace-nowrap">
                                                {transaction.logs && transaction.logs.length > 0 ? (
                                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800 shadow-sm dark:bg-amber-950/60 dark:text-amber-300">
                                                        <ShieldAlert className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                                                        Diedit ({transaction.logs.length}x)
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                                                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                                                        Rekam Asli
                                                    </span>
                                                )}
                                            </td>

                                            <td className="px-5 py-3.5 text-right whitespace-nowrap">
                                                <span
                                                    className={`text-base font-bold ${
                                                        transaction.type === 'in'
                                                            ? 'text-emerald-600 dark:text-emerald-400'
                                                            : 'text-rose-600 dark:text-rose-400'
                                                    }`}
                                                >
                                                    {transaction.type === 'in' ? '+' : '-'} {formatRupiah(transaction.amount)}
                                                </span>
                                            </td>

                                            <td className="px-5 py-3.5 text-center whitespace-nowrap">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedTransaction(transaction);
                                                    }}
                                                    className="text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 dark:text-indigo-400 dark:hover:bg-indigo-950/50"
                                                >
                                                    <Eye className="mr-1 h-4 w-4" /> Lihat Log
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* PAGINATION */}
                    <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-200 bg-slate-50/50 px-6 py-4 sm:flex-row dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex flex-col items-center gap-4 text-sm text-slate-500 sm:flex-row dark:text-slate-400">
                            <p>
                                Menampilkan <span className="font-semibold text-slate-900 dark:text-white">{transactions.from || 0}</span> -{' '}
                                <span className="font-semibold text-slate-900 dark:text-white">{transactions.to || 0}</span> dari{' '}
                                <span className="font-semibold text-slate-900 dark:text-white">{transactions.total}</span> data log
                            </p>

                            <div className="flex items-center gap-2 border-l border-slate-300 pl-4 dark:border-slate-700">
                                <span>Tampilkan:</span>
                                <Select
                                    value={String(localFilters.per_page || '10')}
                                    onValueChange={(value) => {
                                        applyFilters({ per_page: value, page: '1' });
                                    }}
                                >
                                    <SelectTrigger className="h-8 w-[70px] bg-white dark:bg-slate-900">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="10">10</SelectItem>
                                        <SelectItem value="25">25</SelectItem>
                                        <SelectItem value="50">50</SelectItem>
                                        <SelectItem value="100">100</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {transactions.last_page > 1 && (
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => applyFilters({ page: String(transactions.current_page - 1) })}
                                    disabled={transactions.current_page === 1}
                                    className="bg-white dark:bg-slate-900"
                                >
                                    Sebelumnya
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => applyFilters({ page: String(transactions.current_page + 1) })}
                                    disabled={transactions.current_page === transactions.last_page}
                                    className="bg-white dark:bg-slate-900"
                                >
                                    Selanjutnya
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
