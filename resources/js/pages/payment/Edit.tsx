import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { Student, Transaction } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
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

            <div className="mx-auto max-w-2xl space-y-6 p-6">
                <Link
                    href={route('payment.index')}
                    className="inline-flex items-center text-sm font-medium text-slate-500 transition hover:text-slate-900 dark:hover:text-white"
                >
                    <ArrowLeft className="mr-1 h-4 w-4" />
                    Kembali ke Transaksi
                </Link>

                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <div className="border-b border-slate-200 p-6 dark:border-slate-800">
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Edit Transaksi</h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Nomor: <span className="font-mono">{transaction.transaction_id}</span>
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6 p-6">
                        <div>
                            <Label className="mb-3 block text-slate-700 dark:text-slate-300">Tipe Transaksi</Label>
                            <div className="flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => handleTypeChange('in')}
                                    className={`flex-1 rounded-lg border-2 px-4 py-3 text-sm font-medium transition ${
                                        type === 'in'
                                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
                                            : 'border-slate-200 text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:text-slate-400'
                                    }`}
                                >
                                    ↑ Pemasukan
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleTypeChange('out')}
                                    className={`flex-1 rounded-lg border-2 px-4 py-3 text-sm font-medium transition ${
                                        type === 'out'
                                            ? 'border-rose-500 bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400'
                                            : 'border-slate-200 text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:text-slate-400'
                                    }`}
                                >
                                    ↓ Pengeluaran
                                </button>
                            </div>
                            {errors.type && <p className="mt-1 text-sm text-rose-600">{errors.type}</p>}
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <Label htmlFor="category" className="text-slate-700 dark:text-slate-300">
                                    Kategori <span className="text-rose-500">*</span>
                                </Label>
                                <Select value={data.category} onValueChange={(value) => setData('category', value)}>
                                    <SelectTrigger className="mt-1">
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
                                <Label htmlFor="amount" className="text-slate-700 dark:text-slate-300">
                                    Jumlah (Rp) <span className="text-rose-500">*</span>
                                </Label>
                                <Input
                                    id="amount"
                                    type="number"
                                    min="1"
                                    placeholder="0"
                                    value={data.amount}
                                    onChange={(e) => setData('amount', e.target.value)}
                                    className="mt-1"
                                />
                                {errors.amount && <p className="mt-1 text-sm text-rose-600">{errors.amount}</p>}
                            </div>
                        </div>

                        {type === 'in' && (
                            <div>
                                <Label htmlFor="student_id" className="text-slate-700 dark:text-slate-300">
                                    Siswa (opsional)
                                </Label>
                                <Select value={data.student_id} onValueChange={(value) => setData('student_id', value === 'none' ? '' : value)}>
                                    <SelectTrigger className="mt-1">
                                        <SelectValue placeholder="Pilih siswa (jika terkait)" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">Tidak ada</SelectItem>
                                        {students.map((student) => (
                                            <SelectItem key={student.id} value={String(student.id)}>
                                                {student.name} - {student.nisn} (Kelas {student.class})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <Label htmlFor="transaction_date" className="text-slate-700 dark:text-slate-300">
                                    Tanggal <span className="text-rose-500">*</span>
                                </Label>
                                <Input
                                    id="transaction_date"
                                    type="date"
                                    value={data.transaction_date}
                                    onChange={(e) => setData('transaction_date', e.target.value)}
                                    className="mt-1"
                                />
                                {errors.transaction_date && <p className="mt-1 text-sm text-rose-600">{errors.transaction_date}</p>}
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="note" className="text-slate-700 dark:text-slate-300">
                                Catatan
                            </Label>
                            <Input
                                id="note"
                                type="text"
                                placeholder="Contoh: Terima dari Budi, bayar spp bulan maret"
                                value={data.note}
                                onChange={(e) => setData('note', e.target.value)}
                                className="mt-1"
                            />
                            {errors.note && <p className="mt-1 text-sm text-rose-600">{errors.note}</p>}
                        </div>

                        <div className="flex justify-end gap-3 border-t border-slate-200 pt-4 dark:border-slate-800">
                            <Link href={route('payment.index')}>
                                <Button variant="outline" type="button">
                                    Batal
                                </Button>
                            </Link>
                            <Button type="submit" disabled={processing}>
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
