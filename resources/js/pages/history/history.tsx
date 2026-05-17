import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { Transaction, TransactionSummary } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Download, Filter, Plus, Printer, Search, Upload, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Props {
    transactions: {
        data: Transaction[];
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
    };
    categories: {
        in: string[];
        out: string[];
    };
}

export default function Index({ transactions, summary, filters, categories }: Props) {
    const [showFilters, setShowFilters] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState<any | null>(null);
    const [localFilters, setLocalFilters] = useState({
        type: filters.type || '',
        category: filters.category || '',
        date_from: filters.date_from || '',
        date_to: filters.date_to || '',
        search: filters.search || '',
        sort_by: filters.sort_by || 'transaction_date',
        sort_dir: filters.sort_dir || 'desc',
    });

    useEffect(() => {
        setLocalFilters({
            type: filters.type || '',
            category: filters.category || '',
            date_from: filters.date_from || '',
            date_to: filters.date_to || '',
            search: filters.search || '',
            sort_by: filters.sort_by || 'transaction_date',
            sort_dir: filters.sort_dir || 'desc',
        });
    }, [filters.type, filters.category, filters.date_from, filters.date_to, filters.search, filters.sort_by, filters.sort_dir]);

    // TODO: make the filters button better by not making the whole page reload and making it as one component that other form could use
    const applyFilters = (newFilters: Record<string, string>) => {
        router.get(
            route('payment.index'),
            { ...localFilters, ...newFilters },
            { replace: true, preserveState: true, only: ['transactions', 'summary'] },
        );
    };

    const clearFilters = () => {
        setLocalFilters({ type: '', category: '', date_from: '', date_to: '', search: '' });
        router.get(route('payment.index'));
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
        <AppLayout breadcrumbs={[{ title: 'Transaksi', href: '/payment' }]}>
            <Head title="Riwayat" />

            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Riwayat</h1>
                        <p className="text-sm text-slate-500">Riwayat transaksi</p>
                    </div>
                    <div className="flex gap-2">
                        <Link href={route('transaction.import.create')}>
                            <Button variant="outline">
                                <Upload className="mr-2 h-4 w-4" />
                                Import
                            </Button>
                        </Link>
                        <a href={route('transaction.export', localFilters)} download>
                            <Button variant="outline">
                                <Download className="mr-2 h-4 w-4" />
                                Export
                                {localFilters.date_from || localFilters.date_to || localFilters.type || localFilters.category || localFilters.search
                                    ? ' (Filtered)'
                                    : ''}
                            </Button>
                        </a>
                        <Link href={route('payment.create')}>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Tambah Transaksi
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* MODAL DETAIL TRANSAKSI */}
                {selectedTransaction && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
                        <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-xl dark:bg-slate-900">
                            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-6 py-4 dark:border-slate-800 dark:bg-slate-800/30">
                                <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">Detail Transaksi</h3>
                                <button
                                    onClick={() => setSelectedTransaction(null)}
                                    className="text-slate-400 transition-colors hover:text-slate-600 dark:hover:text-slate-300"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="space-y-4 p-6">
                                {/* Nominal Besar di Atas */}
                                <div className="border-b border-slate-100 pb-4 text-center dark:border-slate-800">
                                    <p className="mb-1 text-sm font-medium text-slate-500">Total Nominal</p>
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

                                {/* Rincian Detail */}
                                <div className="grid grid-cols-2 gap-x-4 gap-y-4 text-sm">
                                    <div>
                                        <p className="mb-1 text-slate-500 dark:text-slate-400">ID Referensi</p>
                                        <p className="font-mono font-medium text-slate-900 dark:text-slate-200">
                                            {selectedTransaction.transaction_id}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="mb-1 text-slate-500 dark:text-slate-400">Waktu Transaksi</p>
                                        <p className="font-medium text-slate-900 dark:text-slate-200">
                                            {formatDate(selectedTransaction.transaction_date)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="mb-1 text-slate-500 dark:text-slate-400">Kategori</p>
                                        <p className="font-medium text-slate-900 dark:text-slate-200">{selectedTransaction.category}</p>
                                    </div>
                                    <div>
                                        <p className="mb-1 text-slate-500 dark:text-slate-400">Siswa Terkait</p>
                                        <p className="font-medium text-indigo-600 dark:text-indigo-400">
                                            {selectedTransaction.student ? selectedTransaction.student.name : '-'}
                                        </p>
                                    </div>
                                    <div className="col-span-2 rounded-lg border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/50">
                                        <p className="mb-1 text-slate-500 dark:text-slate-400">Catatan</p>
                                        <p className="font-medium text-slate-900 dark:text-slate-200">
                                            {selectedTransaction.note || <span className="italic opacity-50">Tidak ada catatan</span>}
                                        </p>
                                    </div>
                                </div>
                                {selectedTransaction.logs && selectedTransaction.logs.length > 0 && (
                                    <div className="col-span-2 mt-4 border-t border-slate-100 pt-4 dark:border-slate-800">
                                        <p className="mb-3 text-xs font-bold tracking-wider text-slate-500 uppercase">
                                            Jejak Perubahan (Audit Trail)
                                        </p>
                                        <div className="max-h-32 space-y-2 overflow-y-auto pr-2">
                                            {selectedTransaction.logs.map((log: any) => (
                                                <div
                                                    key={log.id}
                                                    className="rounded-lg border border-amber-100 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-900/50 dark:bg-amber-900/20 dark:text-amber-300"
                                                >
                                                    <div className="mb-1 flex items-center justify-between">
                                                        <span className="font-semibold">{log.user?.name || 'Sistem'}</span>
                                                        <span className="text-[10px] opacity-75">
                                                            {new Date(log.created_at).toLocaleString('id-ID')}
                                                        </span>
                                                    </div>
                                                    <p>
                                                        Melakukan tindakan: <span className="font-bold uppercase">{log.action}</span>
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
                                    <a href={`/payment/${selectedTransaction.id}/print`} target="_blank">
                                        <Button className="flex items-center gap-2 bg-indigo-600 text-white hover:bg-indigo-700">
                                            <Printer className="h-4 w-4" /> Cetak Bukti
                                        </Button>
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* BUNGKUSAN TABEL DAN FILTER UTAMA */}
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    {/* HEADER FILTER & PENCARIAN (Sama seperti sebelumnya) */}
                    <div className="flex flex-col gap-4 border-b border-slate-200 bg-slate-50/50 p-4 sm:flex-row dark:border-slate-800 dark:bg-slate-800/20">
                        <div className="relative flex-1">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <Input
                                placeholder="Cari nomor transaksi, catatan, siswa..."
                                className="bg-white pl-9 dark:bg-slate-900"
                                value={localFilters.search}
                                onChange={(e) => setLocalFilters({ ...localFilters, search: e.target.value })}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        applyFilters(localFilters);
                                    }
                                }}
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)} className="bg-white dark:bg-slate-900">
                                <Filter className="mr-2 h-4 w-4" />
                                Filter
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

                    {/* PANEL FILTER EXPANDABLE */}
                    {showFilters && (
                        <div className="grid grid-cols-1 gap-4 border-b border-slate-200 bg-slate-50 p-4 sm:grid-cols-2 lg:grid-cols-4 dark:border-slate-800 dark:bg-slate-800/50">
                            {/* ... (Isi filter Select Tipe, Kategori, Tanggal Awal, Tanggal Akhir yang sama) ... */}
                            <div>
                                <label className="mb-1 block text-xs font-semibold tracking-wider text-slate-500 uppercase">Tipe</label>
                                <Select
                                    value={localFilters.type || 'all'}
                                    onValueChange={(value) => setLocalFilters({ ...localFilters, type: value === 'all' ? '' : value })}
                                >
                                    <SelectTrigger className="bg-white dark:bg-slate-900">
                                        <SelectValue placeholder="Semua" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua</SelectItem>
                                        <SelectItem value="in">Uang Masuk</SelectItem>
                                        <SelectItem value="out">Uang Keluar</SelectItem>
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
                                        <SelectItem value="all">Semua</SelectItem>
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

                    {/* TABEL RIWAYAT TRANSAKSI DENGAN CLICKABLE ROWS */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-800/30">
                                    <th className="px-4 py-3.5 text-left font-semibold text-slate-600 dark:text-slate-300">Waktu Transaksi</th>
                                    <th className="px-4 py-3.5 text-left font-semibold text-slate-600 dark:text-slate-300">ID Referensi</th>
                                    <th className="px-4 py-3.5 text-left font-semibold text-slate-600 dark:text-slate-300">Detail & Catatan</th>
                                    <th className="px-4 py-3.5 text-right font-semibold text-slate-600 dark:text-slate-300">Nominal</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                                {transactions.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-12 text-center">
                                            <div className="flex flex-col items-center justify-center gap-2 text-slate-400">
                                                <Search className="h-10 w-10 opacity-50" />
                                                <p className="text-base font-medium text-slate-500">Riwayat kosong</p>
                                                <p className="text-xs">Tidak ada transaksi yang sesuai dengan filter Anda.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    transactions.data.map((transaction) => (
                                        <tr
                                            key={transaction.id}
                                            onClick={() => setSelectedTransaction(transaction)} // INI YANG MEMBUAT BARIS BISA DIKLIK
                                            className="group cursor-pointer transition-colors hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                                        >
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <div className="flex flex-col gap-1">
                                                    <span className="font-medium text-slate-900 transition-colors group-hover:text-indigo-700 dark:text-slate-200 dark:group-hover:text-indigo-300">
                                                        {formatDate(transaction.transaction_date)}
                                                    </span>
                                                    <span
                                                        className={`inline-flex w-fit items-center rounded px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase ${
                                                            transaction.type === 'in'
                                                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30'
                                                                : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30'
                                                        }`}
                                                    >
                                                        {transaction.type === 'in' ? '↓ MASUK' : '↑ KELUAR'}
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <div className="flex flex-col">
                                                    <span className="font-mono text-xs font-semibold text-slate-600 dark:text-slate-400">
                                                        {transaction.transaction_id}
                                                    </span>
                                                    <span className="text-sm font-medium text-slate-800 dark:text-slate-300">
                                                        {transaction.category}
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="min-w-[200px] px-4 py-3">
                                                <div className="flex flex-col">
                                                    {transaction.student ? (
                                                        <span className="font-medium text-indigo-600 dark:text-indigo-400">
                                                            {transaction.student.name}
                                                        </span>
                                                    ) : null}
                                                    <span className="line-clamp-2 text-sm text-slate-500 dark:text-slate-400">
                                                        {transaction.note || <span className="italic opacity-50">Tanpa catatan</span>}
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="px-4 py-3 text-right whitespace-nowrap">
                                                <span
                                                    className={`text-base font-bold ${
                                                        transaction.type === 'in'
                                                            ? 'text-emerald-600 dark:text-emerald-400'
                                                            : 'text-rose-600 dark:text-rose-400'
                                                    }`}
                                                >
                                                    {transaction.type === 'in' ? '+' : '-'}
                                                    {formatRupiah(transaction.amount)}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* PAGINATION & ROWS PER PAGE */}
                    <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-200 bg-slate-50/50 px-6 py-4 sm:flex-row dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex flex-col items-center gap-4 text-sm text-slate-500 sm:flex-row dark:text-slate-400">
                            <p>
                                Menampilkan <span className="font-semibold text-slate-900 dark:text-white">{transactions.from || 0}</span> -{' '}
                                <span className="font-semibold text-slate-900 dark:text-white">{transactions.to || 0}</span> dari{' '}
                                <span className="font-semibold text-slate-900 dark:text-white">{transactions.total}</span> data
                            </p>

                            <div className="flex items-center gap-2 border-l border-slate-300 pl-4 dark:border-slate-700">
                                <span>Tampilkan:</span>
                                <Select
                                    value={String(localFilters.per_page || '10')}
                                    onValueChange={(value) => {
                                        applyFilters({ ...localFilters, per_page: value, page: '1' });
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
                                    onClick={() => applyFilters({ ...localFilters, page: String(transactions.current_page - 1) })}
                                    disabled={transactions.current_page === 1}
                                    className="bg-white dark:bg-slate-900"
                                >
                                    Sebelumnya
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => applyFilters({ ...localFilters, page: String(transactions.current_page + 1) })}
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
