import { BackButton } from '@/components/ui/back-button';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatNumberToRupiah, parseRupiahToString } from '@/lib/utils';
import AppLayout from '@/layouts/app-layout';
import { Student } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { Calendar as CalendarIcon, Save } from 'lucide-react';
import { useState } from 'react';

interface Props {
    studentsByGender: Record<string, Record<string, Student[]>>;
    classes: string[];
    categories: {
        in: string[];
        out: string[];
    };
    allowedCreateTypes?: string[];
}

export default function Create({ studentsByGender, classes, categories, allowedCreateTypes }: Props) {
    const defaultType = allowedCreateTypes && allowedCreateTypes.length > 0 && !allowedCreateTypes.includes('in') && allowedCreateTypes.includes('out')
        ? 'out'
        : 'in';

    const { data, setData, post, processing, errors } = useForm({
        type: defaultType as 'in' | 'out',
        category: (defaultType === 'in' ? categories.in[0] : categories.out[0]) ?? undefined,
        amount: '',
        student_id: undefined as string | undefined,
        transaction_date: new Date().toISOString().split('T')[0],
        note: '',
    });

    const [type, setType] = useState<'in' | 'out'>(defaultType);
    const [selectedGender, setSelectedGender] = useState<string>('');
    const [selectedClass, setSelectedClass] = useState<string>('');

    const handleTypeChange = (newType: 'in' | 'out') => {
        setType(newType);
        setData('type', newType);
        setData('category', newType === 'in' ? categories.in[0] : categories.out[0]);
        setData('student_id', '');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('payment.store'), {
            onSuccess: () => {
                router.visit(route('payment.index'));
            },
        });
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Transaksi', href: '/payment' },
                { title: 'Tambah', href: '#' },
            ]}
        >
            <Head title="Tambah Transaksi" />

            <div className="mx-auto max-w-2xl space-y-6 p-6">
                {/* TODO: replaces every hardcoded back button with BackButton component */}
                <BackButton href={route('payment.index')}>Transaksi</BackButton>

                <div className="overflow-hidden rounded-xl border border-border bg-white shadow-sm dark:border-slate-800 dark:bg-card">
                    <div className="border-b border-border p-6 dark:border-slate-800">
                        <h2 className="text-lg font-semibold text-foreground dark:text-white">Form Transaksi Baru</h2>
                        <p className="mt-1 text-sm text-muted-foreground">Catat pemasukan atau pengeluaran baru</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6 p-6">
                        <div>
                            <Label className="mb-3 block text-foreground/90 dark:text-slate-300">Tipe Transaksi</Label>
                            <div className="flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => handleTypeChange('in')}
                                    disabled={allowedCreateTypes && allowedCreateTypes.length > 0 && !allowedCreateTypes.includes('in')}
                                    className={`flex-1 rounded-lg border-2 px-4 py-3 text-sm font-medium transition ${
                                        allowedCreateTypes && allowedCreateTypes.length > 0 && !allowedCreateTypes.includes('in')
                                            ? 'cursor-not-allowed border-slate-100 bg-slate-100 text-muted-foreground dark:border-slate-800 dark:bg-slate-800 dark:text-slate-600'
                                            : type === 'in'
                                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
                                            : 'border-border text-slate-600 hover:border-slate-300 dark:border-border dark:text-muted-foreground'
                                    }`}
                                >
                                    ↓ Pemasukan {allowedCreateTypes && allowedCreateTypes.length > 0 && !allowedCreateTypes.includes('in') && '(Tidak Ada Izin)'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleTypeChange('out')}
                                    disabled={allowedCreateTypes && allowedCreateTypes.length > 0 && !allowedCreateTypes.includes('out')}
                                    className={`flex-1 rounded-lg border-2 px-4 py-3 text-sm font-medium transition ${
                                        allowedCreateTypes && allowedCreateTypes.length > 0 && !allowedCreateTypes.includes('out')
                                            ? 'cursor-not-allowed border-slate-100 bg-slate-100 text-muted-foreground dark:border-slate-800 dark:bg-slate-800 dark:text-slate-600'
                                            : type === 'out'
                                            ? 'border-rose-500 bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400'
                                            : 'border-border text-slate-600 hover:border-slate-300 dark:border-border dark:text-muted-foreground'
                                    }`}
                                >
                                    ↑ Pengeluaran {allowedCreateTypes && allowedCreateTypes.length > 0 && !allowedCreateTypes.includes('out') && '(Tidak Ada Izin)'}
                                </button>
                            </div>
                            {errors.type && <p className="mt-1 text-sm text-rose-600">{errors.type}</p>}
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <Label htmlFor="category" className="text-foreground/90 dark:text-slate-300">
                                    Kategori <span className="text-rose-500">*</span>
                                </Label>
                                <Select value={data.category} onValueChange={(value) => {
                                    setData('category', value);
                                    if (value !== 'SPP') {
                                        setData('student_id', '');
                                        setSelectedGender('');
                                        setSelectedClass('');
                                    }
                                }}>
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
                                <Label htmlFor="amount" className="text-foreground/90 dark:text-slate-300">
                                    Jumlah (Rp) <span className="text-rose-500">*</span>
                                </Label>
                                <Input
                                    id="amount"
                                    type="text"
                                    inputMode="numeric"
                                    placeholder="0"
                                    value={formatNumberToRupiah(data.amount)}
                                    onChange={(e) => setData('amount', parseRupiahToString(e.target.value))}
                                    className="mt-1"
                                />
                                {errors.amount && <p className="mt-1 text-sm text-rose-600">{errors.amount}</p>}
                            </div>
                        </div>

{type === 'in' && data.category === 'SPP' && (
                            <>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div>
                                        <Label htmlFor="gender" className="text-foreground/90 dark:text-slate-300">
                                            Jenis Kelamin
                                        </Label>
                                        <Select value={selectedGender} onValueChange={(value) => {
                                            setSelectedGender(value === 'all' ? '' : value);
                                            setSelectedClass('');
                                            setData('student_id', '');
                                        }}>
                                            <SelectTrigger className="mt-1">
                                                <SelectValue placeholder="Pilih Jenis Kelamin" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="L">Laki-laki</SelectItem>
                                                <SelectItem value="P">Perempuan</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <Label htmlFor="class" className="text-foreground/90 dark:text-slate-300">
                                            Filter Kelas
                                        </Label>
                                        <Select value={selectedClass} onValueChange={(value) => {
                                            setSelectedClass(value === 'all' ? '' : value);
                                            setData('student_id', '');
                                        }}>
                                            <SelectTrigger className="mt-1">
                                                <SelectValue placeholder="Pilih kelas" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">Semua Kelas</SelectItem>
                                                {classes.map((cls) => (
                                                    <SelectItem key={cls} value={cls}>
                                                        Kelas {cls}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <Label htmlFor="student_id" className="text-foreground/90 dark:text-slate-300">
                                    Pilih Siswa <span className="text-rose-500">*</span>
                                </Label>
                                <Select
                                    value={data.student_id}
                                    onValueChange={(value) => setData('student_id', value)}
                                    disabled={!selectedGender}
                                >
                                    <SelectTrigger className="mt-1">
                                        <SelectValue placeholder={!selectedGender ? "Pilih jenis kelamin terlebih dahulu" : "Pilih siswa"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(() => {
                                            const genderKey = selectedGender || Object.keys(studentsByGender)[0];
                                            if (genderKey && studentsByGender[genderKey]) {
                                                const filteredStudents = selectedClass
                                                    ? studentsByGender[genderKey][selectedClass] || []
                                                    : Object.values(studentsByGender[genderKey] || {}).flat();
                                                return filteredStudents.map((student: Student) => (
                                                    <SelectItem key={student.id} value={String(student.id)}>
                                                        {student.name} - {student.nisn} (Kelas {student.class})
                                                    </SelectItem>
                                                ));
                                            }
                                            return [];
                                        })()}
                                    </SelectContent>
                                </Select>
                                {errors.student_id && <p className="mt-1 text-sm text-rose-600">{errors.student_id}</p>}
                                {data.student_id && (
                                    <p className="mt-1 text-xs text-primary dark:text-primary">
                                        Pembayaran SPP akan otomatis dialokasikan ke tagihan tertunda siswa.
                                    </p>
                                )}
                            </>
                        )}

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <Label htmlFor="transaction_date" className="text-foreground/90 dark:text-slate-300">
                                    Tanggal <span className="text-rose-500">*</span>
                                </Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={`mt-1 w-full justify-start text-left font-normal ${
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
                            <Label htmlFor="note" className="text-foreground/90 dark:text-slate-300">
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

                        <div className="flex justify-end gap-3 border-t border-border pt-4 dark:border-slate-800">
                            <Link href={route('payment.index')}>
                                <Button variant="outline" type="button">
                                    Batal
                                </Button>
                            </Link>
                            <Button type="submit" disabled={processing}>
                                <Save className="mr-2 h-4 w-4" />
                                Simpan Transaksi
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
