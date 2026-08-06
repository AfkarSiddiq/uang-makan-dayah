import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { formatNumberToRupiah, parseRupiahToString } from '@/lib/utils';
import { Student, Transaction } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, Calendar as CalendarIcon, Save } from 'lucide-react';
import { useState } from 'react';

interface Props {
    transaction: Transaction;
    students: Student[];
    categories: {
        in: string[];
        out: string[];
    };
}

export default function Edit({ transaction, students, categories }: Props) {
    const { data, setData, patch, processing, errors } = useForm({
        type: transaction.type,
        category: transaction.category,
        amount: String(transaction.amount),
        student_id: transaction.student_id ? String(transaction.student_id) : '',
        transaction_date: transaction.transaction_date,
        note: transaction.note || '',
    });

    const [type, setType] = useState<'in' | 'out'>(transaction.type);

    const handleTypeChange = (newType: 'in' | 'out') => {
        setType(newType);
        setData('type', newType);
        setData('category', newType === 'in' ? categories.in[0] : categories.out[0]);
        setData('student_id', '');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        patch(route('payment.update', transaction.id), {
            onSuccess: () => {
                router.visit(route('payment.index'));
            },
        });
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Transaksi', href: '/payment' },
                { title: transaction.transaction_id, href: '#' },
            ]}
        >
            <Head title={`Edit ${transaction.transaction_id}`} />

            <div className="mx-auto max-w-2xl space-y-4 px-3 py-4 sm:space-y-6 sm:px-6 sm:py-6">
                <Link
                    href={route('payment.index')}
                    className="inline-flex items-center text-xs sm:text-sm font-medium text-muted-foreground transition hover:text-foreground dark:hover:text-white"
                >
                    <ArrowLeft className="mr-1 h-4 w-4" />
                    Kembali ke Transaksi
                </Link>

                <div className="overflow-hidden rounded-xl border border-border bg-white shadow-sm dark:border-slate-800 dark:bg-card">
                    <div className="border-b border-border p-4 sm:p-6 dark:border-slate-800">
                        <h2 className="text-base sm:text-lg font-semibold text-foreground dark:text-white">Edit Transaksi</h2>
                        <p className="mt-0.5 text-xs sm:text-sm text-muted-foreground">
                            Nomor: <span className="font-mono">{transaction.transaction_id}</span>
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4 p-4 sm:space-y-6 sm:p-6">
                        <div>
                            <Label className="mb-2 block text-xs sm:text-sm text-foreground/90 dark:text-slate-300">Tipe Transaksi</Label>
                            <div className="flex flex-col gap-2.5 sm:flex-row sm:gap-4">
                                <button
                                    type="button"
                                    onClick={() => handleTypeChange('in')}
                                    className={`flex-1 rounded-lg border-2 px-3 py-2.5 text-xs font-semibold sm:px-4 sm:py-3 sm:text-sm transition flex items-center justify-center gap-1.5 ${
                                        type === 'in'
                                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
                                            : 'border-border text-slate-600 hover:border-slate-300 dark:border-border dark:text-muted-foreground'
                                    }`}
                                >
                                    ↑ Pemasukan
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleTypeChange('out')}
                                    className={`flex-1 rounded-lg border-2 px-3 py-2.5 text-xs font-semibold sm:px-4 sm:py-3 sm:text-sm transition flex items-center justify-center gap-1.5 ${
                                        type === 'out'
                                            ? 'border-rose-500 bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400'
                                            : 'border-border text-slate-600 hover:border-slate-300 dark:border-border dark:text-muted-foreground'
                                    }`}
                                >
                                    ↓ Pengeluaran
                                </button>
                            </div>
                            {errors.type && <p className="mt-1 text-sm text-rose-600">{errors.type}</p>}
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <Label htmlFor="category" className="text-xs sm:text-sm text-foreground/90 dark:text-slate-300">
                                    Kategori <span className="text-rose-500">*</span>
                                </Label>
                                <Select value={data.category} onValueChange={(value) => {
                                    setData('category', value);
                                    if (value !== 'SPP') {
                                        setData('student_id', '');
                                    }
                                }}>
                                    <SelectTrigger className="mt-1 h-11 w-full sm:h-10">
                                        <SelectValue placeholder="Pilih kategori" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(type === 'in' ? categories.in : categories.out).map((cat) => (
                                            <SelectItem key={cat} value={cat}>
                                                {cat}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.category && <p className="mt-1 text-sm text-rose-600">{errors.category}</p>}
                            </div>

                            <div>
                                <Label htmlFor="amount" className="text-xs sm:text-sm text-foreground/90 dark:text-slate-300">
                                    Jumlah (Rp) <span className="text-rose-500">*</span>
                                </Label>
                                <Input
                                    id="amount"
                                    type="text"
                                    inputMode="numeric"
                                    placeholder="0"
                                    value={formatNumberToRupiah(data.amount)}
                                    onChange={(e) => setData('amount', parseRupiahToString(e.target.value))}
                                    className="mt-1 h-11 sm:h-10"
                                />
                                {errors.amount && <p className="mt-1 text-sm text-rose-600">{errors.amount}</p>}
                            </div>
                        </div>

                        {type === 'in' && data.category === 'SPP' && (
                            <div>
                                <Label htmlFor="student_id" className="text-xs sm:text-sm text-foreground/90 dark:text-slate-300">
                                    Pilih Siswa <span className="text-rose-500">*</span>
                                </Label>
                                <Select value={data.student_id} onValueChange={(value) => setData('student_id', value)}>
                                    <SelectTrigger className="mt-1 h-11 w-full sm:h-10">
                                        <SelectValue placeholder="Pilih siswa" />
                                    </SelectTrigger>
                                    <SelectContent className="max-w-[90vw] sm:max-w-md">
                                        {students.map((student) => (
                                            <SelectItem key={student.id} value={String(student.id)} className="text-xs sm:text-sm">
                                                {student.name} - {student.nisn} (Kelas {student.class})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.student_id && <p className="mt-1 text-sm text-rose-600">{errors.student_id}</p>}
                            </div>
                        )}

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <Label htmlFor="transaction_date" className="text-xs sm:text-sm text-foreground/90 dark:text-slate-300">
                                    Tanggal <span className="text-rose-500">*</span>
                                </Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={`mt-1 h-11 sm:h-10 w-full justify-start text-left font-normal ${
                                                !data.transaction_date && 'text-muted-foreground'
                                            }`}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {data.transaction_date
                                                ? new Date(data.transaction_date + 'T00:00:00').toLocaleDateString('id-ID', {
                                                      day: 'numeric',
                                                      month: 'long',
                                                      year: 'numeric',
                                                  })
                                                : 'Pilih tanggal'}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={data.transaction_date ? new Date(data.transaction_date + 'T00:00:00') : undefined}
                                            onSelect={(date) => {
                                                if (date) {
                                                    setData('transaction_date', date.toISOString().split('T')[0]);
                                                }
                                            }}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                {errors.transaction_date && <p className="mt-1 text-sm text-rose-600">{errors.transaction_date}</p>}
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="note" className="text-xs sm:text-sm text-foreground/90 dark:text-slate-300">
                                Catatan
                            </Label>
                            <Input
                                id="note"
                                type="text"
                                placeholder="Contoh: Terima dari Budi, bayar spp bulan maret"
                                value={data.note}
                                onChange={(e) => setData('note', e.target.value)}
                                className="mt-1 h-11 sm:h-10"
                            />
                            {errors.note && <p className="mt-1 text-sm text-rose-600">{errors.note}</p>}
                        </div>

                        <div className="flex flex-col-reverse gap-2.5 pt-4 sm:flex-row sm:justify-end sm:gap-3 border-t border-border dark:border-slate-800">
                            <Link href={route('payment.index')} className="w-full sm:w-auto">
                                <Button variant="outline" type="button" className="w-full sm:w-auto h-11 sm:h-10">
                                    Batal
                                </Button>
                            </Link>
                            <Button type="submit" disabled={processing} className="w-full sm:w-auto h-11 sm:h-10">
                                <Save className="mr-2 h-4 w-4" />
                                Simpan Perubahan
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
