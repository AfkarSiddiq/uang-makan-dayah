import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SearchInput } from '@/components/ui/search-input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { Transaction, TransactionSummary } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowDown, ArrowDownRight, ArrowUp, ArrowUpDown, ArrowUpRight, Download, Filter, Plus, Printer, Search, Trash2, Upload, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { usePermissions } from '@/hooks/use-permissions';

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
        sort_by?: string;
        sort_dir?: string;
    };
    categories: {
        in: string[];
        out: string[];
    };
    allowedTypes: string[];
}

export default function Index({ transactions, summary, filters, categories, allowedTypes }: Props) {
    const { can } = usePermissions();
    const [showFilters, setShowFilters] = useState(false);
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
        router.get(route('payment.index'), { ...localFilters, ...newFilters }, { replace: true, preserveState: true, only: ['transactions', 'summary'] });
    };

    // TODO: create a better sort button component that could handle things like a null data etc
    // FIX: whys when the sort button is clicked the link would show the sort parameter
    const handleSort = (column: string) => {
        const newDir = localFilters.sort_by === column && localFilters.sort_dir === 'asc' ? 'desc' : 'asc';
        applyFilters({ sort_by: column, sort_dir: newDir });
    };

    const getSortIcon = (column: string) => {
        if (localFilters.sort_by !== column) return <ArrowUpDown className="h-4 w-4 opacity-50" />;
        return localFilters.sort_dir === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
    };

    const clearFilters = () => {
        setLocalFilters({ type: '', category: '', date_from: '', date_to: '', search: '', sort_by: 'transaction_date', sort_dir: 'desc' });
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
            <Head title="Transaksi" />

            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Transaksi</h1>
                        <p className="text-sm text-slate-500">Kelola semua pemasukan dan pengeluaran</p>
                    </div>
                    <div className="flex gap-2">
                        {can('pembayaran.import') && (
                            <Link href={route('transaction.import.create')}>
                                <Button variant="outline">
                                    <Upload className="mr-2 h-4 w-4" />
                                    Import
                                </Button>
                            </Link>
                        )}
                        {can('pembayaran.export') && (
                            <a
                                href={route('transaction.export', localFilters)}
                                download
                            >
                                <Button variant="outline">
                                    <Download className="mr-2 h-4 w-4" />
                                    Export{localFilters.date_from || localFilters.date_to || localFilters.type || localFilters.category || localFilters.search ? ' (Filtered)' : ''}
                                </Button>
                            </a>
                        )}
                        {(can('pembayaran.masuk.create') || can('pembayaran.keluar.create')) && (
                            <Link href={route('payment.create')}>
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Tambah Transaksi
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    {(allowedTypes.includes('in') || allowedTypes.length === 0) && (
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
                    )}

                    {(allowedTypes.includes('out') || allowedTypes.length === 0) && (
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
                    )}

                    {allowedTypes.length !== 1 && (
                        <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-5 dark:border-indigo-900 dark:bg-indigo-950/30">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/50">
                                    <ArrowUpDown className="h-5 w-5 text-indigo-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">Saldo</p>
                                    <p className="text-xl font-bold text-indigo-700 dark:text-indigo-300">{formatRupiah(summary.balance)}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex flex-col gap-4 border-b border-slate-200 p-4 sm:flex-row dark:border-slate-800">
                        <SearchInput
                            value={localFilters.search}
                            onChange={(value) => setLocalFilters({ ...localFilters, search: value })}
                            onSubmit={() => applyFilters(localFilters)}
                            onClear={() => setLocalFilters({ ...localFilters, search: '' })}
                            placeholder="Cari nomor transaksi, catatan, siswa..."
                            showButton
                        />
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
                                <Filter className="mr-2 h-4 w-4" />
                                Filter
                                {hasActiveFilters && <span className="ml-2 h-2 w-2 rounded-full bg-indigo-500" />}
                            </Button>
                            {hasActiveFilters && (
                                <Button variant="ghost" size="sm" onClick={clearFilters}>
                                    <X className="mr-1 h-4 w-4" />
                                    Reset
                                </Button>
                            )}
                        </div>
                    </div>

                    {showFilters && (
                        <div className="grid grid-cols-1 gap-4 border-b border-slate-200 bg-slate-50 p-4 sm:grid-cols-2 lg:grid-cols-4 dark:border-slate-800 dark:bg-slate-800/50">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Tipe</label>
                                <Select value={localFilters.type || 'all'} onValueChange={(value) => setLocalFilters({ ...localFilters, type: value === 'all' ? '' : value })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Semua" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua</SelectItem>
                                        {(allowedTypes.length === 0 || allowedTypes.includes('in')) && (
                                            <SelectItem value="in">Masuk</SelectItem>
                                        )}
                                        {(allowedTypes.length === 0 || allowedTypes.includes('out')) && (
                                            <SelectItem value="out">Keluar</SelectItem>
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Kategori</label>
                                <Select
                                    value={localFilters.category || 'all'}
                                    onValueChange={(value) => setLocalFilters({ ...localFilters, category: value === 'all' ? '' : value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Semua" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua</SelectItem>
                                        <SelectItem value="_income_header" disabled className="text-xs text-slate-500 font-semibold pointer-events-none">
                                            — Pemasukan —
                                        </SelectItem>
                                        {categories.in.map((cat) => (
                                            <SelectItem key={cat} value={cat}>
                                                {cat}
                                            </SelectItem>
                                        ))}
                                        <SelectItem value="_expense_header" disabled className="text-xs text-slate-500 font-semibold pointer-events-none">
                                            — Pengeluaran —
                                        </SelectItem>
                                        {categories.out.map((cat) => (
                                            <SelectItem key={cat} value={cat}>
                                                {cat}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Dari Tanggal</label>
                                <Input
                                    type="date"
                                    value={localFilters.date_from}
                                    onChange={(e) => setLocalFilters({ ...localFilters, date_from: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Sampai Tanggal</label>
                                <Input
                                    type="date"
                                    value={localFilters.date_to}
                                    onChange={(e) => setLocalFilters({ ...localFilters, date_to: e.target.value })}
                                />
                            </div>
                            <div className="flex items-end">
                                <Button onClick={applyFilter} className="w-full">
                                    Terapkan Filter
                                </Button>
                            </div>
                        </div>
                    )}

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/50">
                                    <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-slate-500 uppercase">
                                        <button onClick={() => handleSort('transaction_id')} className="flex items-center gap-1 hover:text-slate-700">
                                            No. Transaksi
                                            {getSortIcon('transaction_id')}
                                        </button>
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-slate-500 uppercase">
                                        <button onClick={() => handleSort('transaction_date')} className="flex items-center gap-1 hover:text-slate-700">
                                            Tanggal
                                            {getSortIcon('transaction_date')}
                                        </button>
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-slate-500 uppercase">
                                        <button onClick={() => handleSort('category')} className="flex items-center gap-1 hover:text-slate-700">
                                            Kategori
                                            {getSortIcon('category')}
                                        </button>
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-slate-500 uppercase">
                                        <button onClick={() => handleSort('student_name')} className="flex items-center gap-1 hover:text-slate-700">
                                            Siswa
                                            {getSortIcon('student_name')}
                                        </button>
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-slate-500 uppercase">Catatan</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold tracking-wider text-slate-500 uppercase">
                                        <button onClick={() => handleSort('amount')} className="flex items-center gap-1 ml-auto hover:text-slate-700">
                                            Jumlah
                                            {getSortIcon('amount')}
                                        </button>
                                    </th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold tracking-wider text-slate-500 uppercase">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {transactions.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                                            <div className="flex flex-col items-center gap-2">
                                                <Search className="h-8 w-8 text-slate-300" />
                                                <p>Tidak ada transaksi ditemukan</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    transactions.data.map((transaction) => (
                                        <tr key={transaction.id} className="transition hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                            <td className="px-4 py-3">
                                                <span className="font-mono text-sm font-medium text-slate-900 dark:text-white">
                                                    {transaction.transaction_id}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                                                {formatDate(transaction.transaction_date)}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span
                                                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                                        transaction.type === 'in'
                                                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                                            : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
                                                    }`}
                                                >
                                                    {transaction.type === 'in' ? '↓ ' : '↑ '}
                                                    {transaction.category}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                                                {transaction.student ? (
                                                    <span>{transaction.student.name}</span>
                                                ) : (
                                                    <span className="text-slate-400">-</span>
                                                )}
                                            </td>
                                            <td className="max-w-[200px] truncate px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                                                {transaction.note || '-'}
                                            </td>
                                            <td
                                                className={`px-4 py-3 text-right text-sm font-semibold ${
                                                    transaction.type === 'in'
                                                        ? 'text-emerald-600 dark:text-emerald-400'
                                                        : 'text-rose-600 dark:text-rose-400'
                                                }`}
                                            >
                                                {transaction.type === 'in' ? '+' : '-'}
                                                {formatRupiah(transaction.amount)}
                                            </td>
                                                    <td className="px-4 py-3 text-center">
                                                        <div className="flex items-center justify-center gap-1">
                                                            {transaction.id && (
                                                                <>
                                                                    {can('pembayaran.print') && (
                                                                        <a href={`/payment/${transaction.id}/print`} target="_blank" title="Cetak PDF">
                                                                            <Button variant="ghost" size="sm">
                                                                                <Printer className="h-4 w-4" />
                                                                            </Button>
                                                                        </a>
                                                                    )}
                                                                    {can('pembayaran.edit') && (
                                                                        <a href={`/payment/${transaction.id}/edit`}>
                                                                            <Button variant="ghost" size="sm">
                                                                                Edit
                                                                            </Button>
                                                                        </a>
                                                                    )}
                                                                </>
                                                            )}
                                                            {can('pembayaran.delete') && (
                                                                <form
                                                                    onSubmit={(e) => {
                                                                        e.preventDefault();
                                                                        if (confirm('Yakin ingin menghapus transaksi ini?')) {
                                                                            router.delete(`/payment/${transaction.id}`);
                                                                        }
                                                                    }}
                                                                >
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </Button>
                                                                </form>
                                                            )}
                                                        </div>
                                                    </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {transactions.last_page > 1 && (
                        <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 dark:border-slate-800">
                            <p className="text-sm text-slate-500">
                                Menampilkan {transactions.from} - {transactions.to} dari {transactions.total} transaksi
                            </p>
                            <div className="flex gap-1">
                                {transactions.current_page > 1 && (
                                    <Button variant="outline" size="sm" onClick={() => applyFilters({ page: String(transactions.current_page - 1) })}>
                                        Previous
                                    </Button>
                                )}
                                {transactions.current_page < transactions.last_page && (
                                    <Button variant="outline" size="sm" onClick={() => applyFilters({ page: String(transactions.current_page + 1) })}>
                                        Next
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
