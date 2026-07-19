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
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground dark:text-white">Transaksi</h1>
                        <p className="text-sm text-muted-foreground">Kelola semua pemasukan dan pengeluaran</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        {can('pembayaran.import') && (
                            <Link href={route('transaction.import.create')}>
                                <Button variant="outline" className="bg-white dark:bg-card">
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
                                <Button variant="outline" className="bg-white dark:bg-card">
                                    <Download className="mr-2 h-4 w-4" />
                                    Export{localFilters.date_from || localFilters.date_to || localFilters.type || localFilters.category || localFilters.search ? ' (Filtered)' : ''}
                                </Button>
                            </a>
                        )}
                        {(can('pembayaran.masuk.create') || can('pembayaran.keluar.create')) && (
                            <Link href={route('payment.create')}>
                                <Button className="bg-primary hover:bg-indigo-700 text-white shadow-sm">
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
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/50">
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
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-900/50">
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
                        <div className="rounded-xl border border-primary/20 bg-primary p-5 shadow-lg shadow-primary/20 dark:border-primary/30 dark:bg-primary">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-foreground/20 dark:bg-primary-foreground/20">
                                    <ArrowUpDown className="h-5 w-5 text-primary-foreground" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-primary-foreground/90">Saldo</p>
                                    <p className="text-xl font-bold text-primary-foreground">{formatRupiah(summary.balance)}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="overflow-hidden rounded-xl border border-border bg-white shadow-sm dark:border-slate-800 dark:bg-card">
                    <div className="flex flex-col gap-4 border-b border-border p-4 sm:flex-row dark:border-slate-800">
                        <SearchInput
                            value={localFilters.search}
                            onChange={(value) => setLocalFilters({ ...localFilters, search: value })}
                            onSubmit={() => applyFilters(localFilters)}
                            onClear={() => setLocalFilters({ ...localFilters, search: '' })}
                            placeholder="Cari nomor transaksi, catatan, siswa..."
                            showButton
                        />
                        <div className="flex gap-2 shrink-0">
                            <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)} className="bg-white dark:bg-card">
                                <Filter className="mr-2 h-4 w-4" />
                                Filter
                                {hasActiveFilters && <span className="ml-2 h-2 w-2 rounded-full bg-primary/50" />}
                            </Button>
                            {hasActiveFilters && (
                                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground hover:text-foreground/90">
                                    <X className="mr-1 h-4 w-4" />
                                    Reset
                                </Button>
                            )}
                        </div>
                    </div>

                    {showFilters && (
                        <div className="grid grid-cols-1 gap-4 border-b border-border bg-slate-50 p-4 sm:grid-cols-2 lg:grid-cols-4 dark:border-slate-800 dark:bg-slate-800/50">
                            <div>
                                <label className="mb-1 block text-xs font-semibold tracking-wider text-muted-foreground uppercase">Tipe</label>
                                <Select value={localFilters.type || 'all'} onValueChange={(value) => setLocalFilters({ ...localFilters, type: value === 'all' ? '' : value })}>
                                    <SelectTrigger className="bg-white dark:bg-card">
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
                                <label className="mb-1 block text-xs font-semibold tracking-wider text-muted-foreground uppercase">Kategori</label>
                                <Select
                                    value={localFilters.category || 'all'}
                                    onValueChange={(value) => setLocalFilters({ ...localFilters, category: value === 'all' ? '' : value })}
                                >
                                    <SelectTrigger className="bg-white dark:bg-card">
                                        <SelectValue placeholder="Semua" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua</SelectItem>
                                        <SelectItem value="_income_header" disabled className="text-xs text-muted-foreground font-semibold pointer-events-none">
                                            — Pemasukan —
                                        </SelectItem>
                                        {categories.in.map((cat) => (
                                            <SelectItem key={cat} value={cat}>
                                                {cat}
                                            </SelectItem>
                                        ))}
                                        <SelectItem value="_expense_header" disabled className="text-xs text-muted-foreground font-semibold pointer-events-none">
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
                                <label className="mb-1 block text-xs font-semibold tracking-wider text-muted-foreground uppercase">Dari Tanggal</label>
                                <Input
                                    type="date"
                                    value={localFilters.date_from}
                                    onChange={(e) => setLocalFilters({ ...localFilters, date_from: e.target.value })}
                                    className="bg-white dark:bg-card"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-semibold tracking-wider text-muted-foreground uppercase">Sampai Tanggal</label>
                                <div className="flex gap-2">
                                    <Input
                                        type="date"
                                        value={localFilters.date_to}
                                        onChange={(e) => setLocalFilters({ ...localFilters, date_to: e.target.value })}
                                        className="bg-white dark:bg-card"
                                    />
                                    <Button onClick={applyFilter} className="shrink-0 bg-primary hover:bg-indigo-700 text-white">
                                        <Search className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* DESKTOP TABLE VIEW */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border bg-slate-50 dark:border-slate-800 dark:bg-slate-800/50">
                                    <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                        <button onClick={() => handleSort('transaction_id')} className="flex items-center gap-1 hover:text-foreground/90">
                                            No. Transaksi
                                            {getSortIcon('transaction_id')}
                                        </button>
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                        <button onClick={() => handleSort('transaction_date')} className="flex items-center gap-1 hover:text-foreground/90">
                                            Tanggal
                                            {getSortIcon('transaction_date')}
                                        </button>
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                        <button onClick={() => handleSort('category')} className="flex items-center gap-1 hover:text-foreground/90">
                                            Kategori
                                            {getSortIcon('category')}
                                        </button>
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                        <button onClick={() => handleSort('student_name')} className="flex items-center gap-1 hover:text-foreground/90">
                                            Siswa
                                            {getSortIcon('student_name')}
                                        </button>
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-muted-foreground uppercase">Catatan</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                        <button onClick={() => handleSort('amount')} className="flex items-center gap-1 ml-auto hover:text-foreground/90">
                                            Jumlah
                                            {getSortIcon('amount')}
                                        </button>
                                    </th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold tracking-wider text-muted-foreground uppercase">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {transactions.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
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
                                                <span className="font-mono text-sm font-medium text-foreground dark:text-white">
                                                    {transaction.transaction_id}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-slate-600 dark:text-muted-foreground whitespace-nowrap">
                                                {formatDate(transaction.transaction_date)}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span
                                                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ${
                                                        transaction.type === 'in'
                                                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                                            : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
                                                    }`}
                                                >
                                                    {transaction.type === 'in' ? '↓ ' : '↑ '}
                                                    {transaction.category}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-slate-600 dark:text-muted-foreground">
                                                {transaction.student ? (
                                                    <span className="font-medium text-slate-800 dark:text-slate-200">{transaction.student.name}</span>
                                                ) : (
                                                    <span className="text-muted-foreground">-</span>
                                                )}
                                            </td>
                                            <td className="max-w-[220px] truncate px-4 py-3 text-sm text-slate-600 dark:text-muted-foreground">
                                                {transaction.note || '-'}
                                            </td>
                                            <td
                                                className={`px-4 py-3 text-right text-sm font-bold whitespace-nowrap ${
                                                    transaction.type === 'in'
                                                        ? 'text-emerald-600 dark:text-emerald-400'
                                                        : 'text-rose-600 dark:text-rose-400'
                                                }`}
                                            >
                                                {transaction.type === 'in' ? '+' : '-'}
                                                {formatRupiah(transaction.amount)}
                                            </td>
                                            <td className="px-4 py-3 text-center whitespace-nowrap">
                                                <div className="flex items-center justify-center gap-1">
                                                    {transaction.id && (
                                                        <>
                                                            {can('pembayaran.print') && (
                                                                <a href={`/payment/${transaction.id}/print`} target="_blank" title="Cetak PDF">
                                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-600 hover:text-primary dark:text-muted-foreground">
                                                                        <Printer className="h-4 w-4" />
                                                                    </Button>
                                                                </a>
                                                            )}
                                                            {can('pembayaran.edit') && (
                                                                <a href={`/payment/${transaction.id}/edit`}>
                                                                    <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">
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
                                                                className="h-8 w-8 p-0 text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-950/40"
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

                    {/* MOBILE CARD VIEW */}
                    <div className="block md:hidden divide-y divide-slate-100 dark:divide-slate-800">
                        {transactions.data.length === 0 ? (
                            <div className="px-4 py-12 text-center text-muted-foreground">
                                <div className="flex flex-col items-center gap-2">
                                    <Search className="h-8 w-8 text-slate-300" />
                                    <p>Tidak ada transaksi ditemukan</p>
                                </div>
                            </div>
                        ) : (
                            transactions.data.map((transaction) => (
                                <div key={transaction.id} className="p-4 space-y-3 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="font-mono text-xs font-bold text-foreground dark:text-white rounded bg-slate-100 dark:bg-slate-800 px-2.5 py-1">
                                            {transaction.transaction_id}
                                        </span>
                                        <span className="text-xs text-muted-foreground dark:text-muted-foreground font-medium">
                                            {formatDate(transaction.transaction_date)}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between gap-2">
                                        <span
                                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                                transaction.type === 'in'
                                                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                                    : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
                                            }`}
                                        >
                                            {transaction.type === 'in' ? '↓ ' : '↑ '}
                                            {transaction.category}
                                        </span>
                                        <span className="text-sm font-semibold text-foreground dark:text-white truncate max-w-[180px]">
                                            {transaction.student ? transaction.student.name : <span className="text-muted-foreground font-normal">-</span>}
                                        </span>
                                    </div>

                                    {transaction.note && (
                                        <p className="text-xs text-slate-600 dark:text-muted-foreground bg-slate-50 dark:bg-slate-800/50 rounded-lg p-2.5 line-clamp-2">
                                            {transaction.note}
                                        </p>
                                    )}

                                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/60">
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

                                        <div className="flex items-center gap-1.5">
                                            {transaction.id && (
                                                <>
                                                    {can('pembayaran.print') && (
                                                        <a href={`/payment/${transaction.id}/print`} target="_blank" title="Cetak PDF">
                                                            <Button variant="outline" size="sm" className="h-8 px-2.5 text-xs bg-white dark:bg-card">
                                                                <Printer className="h-3.5 w-3.5 mr-1" />
                                                                Cetak
                                                            </Button>
                                                        </a>
                                                    )}
                                                    {can('pembayaran.edit') && (
                                                        <a href={`/payment/${transaction.id}/edit`}>
                                                            <Button variant="outline" size="sm" className="h-8 px-2.5 text-xs bg-white dark:bg-card">
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
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-8 w-8 p-0 text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-950/40 bg-white dark:bg-card"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                </form>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {transactions.last_page > 1 && (
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-border px-4 py-3 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/20">
                            <p className="text-sm text-muted-foreground text-center sm:text-left">
                                Menampilkan <span className="font-semibold text-foreground dark:text-white">{transactions.from || 0}</span> - <span className="font-semibold text-foreground dark:text-white">{transactions.to || 0}</span> dari <span className="font-semibold text-foreground dark:text-white">{transactions.total}</span> transaksi
                            </p>
                            <div className="flex gap-2">
                                {transactions.current_page > 1 && (
                                    <Button variant="outline" size="sm" onClick={() => applyFilters({ page: String(transactions.current_page - 1) })} className="bg-white dark:bg-card">
                                        Previous
                                    </Button>
                                )}
                                {transactions.current_page < transactions.last_page && (
                                    <Button variant="outline" size="sm" onClick={() => applyFilters({ page: String(transactions.current_page + 1) })} className="bg-white dark:bg-card">
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
