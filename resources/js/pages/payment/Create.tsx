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

const parseDateSafe = (val: string | null | undefined): Date | undefined => {
    if (!val) return undefined;
    const parts = val.split('-');
    if (parts.length === 3) {
        const y = Number(parts[0]);
        const m = Number(parts[1]) - 1;
        const d = Number(parts[2]);
        if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
            return new Date(y, m, d);
        }
    }
    const d = new Date(val);
    return isNaN(d.getTime()) ? undefined : d;
};

const formatDateIndonesian = (val: string | null | undefined): string => {
    if (!val) return 'Pilih tanggal';
    const d = parseDateSafe(val);
    if (!d) return 'Pilih tanggal';
    return d.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
};

export default function Create({ studentsByGender, classes, categories, allowedCreateTypes }: Props) {
    const defaultType = allowedCreateTypes && allowedCreateTypes.length > 0 && !allowedCreateTypes.includes('in') && allowedCreateTypes.includes('out')
        ? 'out'
        : 'in';

    const [idempotencyKey] = useState(() => (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'key-' + Date.now() + '-' + Math.random().toString(36).substring(2, 9)));

    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    const { data, setData, post, processing, errors } = useForm({
        idempotency_key: idempotencyKey,
        type: defaultType as 'in' | 'out',
        category: '',
        amount: '',
        student_id: undefined as string | undefined,
        transaction_date: todayStr,
        note: '',
    });

    const [type, setType] = useState<'in' | 'out'>(defaultType);
    const [selectedGender, setSelectedGender] = useState<string>('');
    const [selectedClass, setSelectedClass] = useState<string>('');
    const [calendarOpen, setCalendarOpen] = useState(false);

    const handleTypeChange = (newType: 'in' | 'out') => {
        setType(newType);
        setData('type', newType);
        setData('category', '');
        setData('student_id', '');
        setSelectedGender('');
        setSelectedClass('');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (processing) return;
        post(route('payment.store'), {
            headers: {
                'X-Idempotency-Key': idempotencyKey,
            },
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

            <div className="mx-auto max-w-2xl space-y-4 px-3 py-4 sm:space-y-6 sm:px-6 sm:py-6">
                {/* TODO: replaces every hardcoded back button with BackButton component */}
                <BackButton href={route('payment.index')}>Transaksi</BackButton>

                <div className="overflow-hidden rounded-xl border border-border bg-white shadow-sm dark:border-slate-800 dark:bg-card">
                    <div className="border-b border-border p-4 sm:p-6 dark:border-slate-800">
                        <h2 className="text-base sm:text-lg font-semibold text-foreground dark:text-white">Form Transaksi Baru</h2>
                        <p className="mt-0.5 text-xs sm:text-sm text-muted-foreground">Catat pemasukan atau pengeluaran baru</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4 p-4 sm:space-y-6 sm:p-6">
                        <div>
                            <Label className="mb-2 block text-xs sm:text-sm text-foreground/90 dark:text-slate-300">Tipe Transaksi</Label>
                            <div className="flex flex-col gap-2.5 sm:flex-row sm:gap-4">
                                <button
                                    type="button"
                                    onClick={() => handleTypeChange('in')}
                                    disabled={allowedCreateTypes && allowedCreateTypes.length > 0 && !allowedCreateTypes.includes('in')}
                                    className={`flex-1 rounded-lg border-2 px-3 py-2.5 text-xs font-semibold sm:px-4 sm:py-3 sm:text-sm transition flex items-center justify-center gap-1.5 ${
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
                                    className={`flex-1 rounded-lg border-2 px-3 py-2.5 text-xs font-semibold sm:px-4 sm:py-3 sm:text-sm transition flex items-center justify-center gap-1.5 ${
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

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <Label htmlFor="category" className="text-xs sm:text-sm text-foreground/90 dark:text-slate-300">
                                    Kategori <span className="text-rose-500">*</span>
                                </Label>
                                <Select value={data.category || undefined} onValueChange={(value) => {
                                    setData('category', value);
                                    if (value !== 'Uang Makan Bulanan') {
                                        setData('student_id', '');
                                        setSelectedGender('');
                                        setSelectedClass('');
                                    }
                                }}>
                                    <SelectTrigger className="mt-1 h-11 w-full sm:h-10">
                                        <SelectValue placeholder="-- Pilih Kategori --" />
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

                        {type === 'in' && data.category === 'Uang Makan Bulanan' && (
                            <>
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div>
                                        <Label htmlFor="gender" className="text-xs sm:text-sm text-foreground/90 dark:text-slate-300">
                                            Jenis Kelamin
                                        </Label>
                                        <Select value={selectedGender} onValueChange={(value) => {
                                            setSelectedGender(value === 'all' ? '' : value);
                                            setSelectedClass('');
                                            setData('student_id', '');
                                        }}>
                                            <SelectTrigger className="mt-1 h-11 w-full sm:h-10">
                                                <SelectValue placeholder="Pilih Jenis Kelamin" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="L">Laki-laki</SelectItem>
                                                <SelectItem value="P">Perempuan</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <Label htmlFor="class" className="text-xs sm:text-sm text-foreground/90 dark:text-slate-300">
                                            Filter Kelas
                                        </Label>
                                        <Select value={selectedClass} onValueChange={(value) => {
                                            setSelectedClass(value === 'all' ? '' : value);
                                            setData('student_id', '');
                                        }}>
                                            <SelectTrigger className="mt-1 h-11 w-full sm:h-10">
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

                                <div>
                                    <Label htmlFor="student_id" className="text-xs sm:text-sm text-foreground/90 dark:text-slate-300">
                                        Pilih Siswa <span className="text-rose-500">*</span>
                                    </Label>
                                    <Select
                                        value={data.student_id}
                                        onValueChange={(value) => setData('student_id', value)}
                                        disabled={!selectedGender}
                                    >
                                        <SelectTrigger className="mt-1 h-11 w-full sm:h-10">
                                            <SelectValue placeholder={!selectedGender ? "Pilih jenis kelamin terlebih dahulu" : "Pilih siswa"} />
                                        </SelectTrigger>
                                        <SelectContent className="max-w-[90vw] sm:max-w-md">
                                            {(() => {
                                                const genderKey = selectedGender || Object.keys(studentsByGender)[0];
                                                if (genderKey && studentsByGender[genderKey]) {
                                                    const filteredStudents = selectedClass
                                                        ? studentsByGender[genderKey][selectedClass] || []
                                                        : Object.values(studentsByGender[genderKey] || {}).flat();
                                                    return filteredStudents.map((student: Student) => (
                                                        <SelectItem key={student.id} value={String(student.id)} className="text-xs sm:text-sm">
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
                                            Pembayaran Uang Makan Bulanan akan otomatis dialokasikan ke tagihan tertunda siswa.
                                        </p>
                                    )}
                                </div>
                            </>
                        )}

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <Label htmlFor="transaction_date" className="text-xs sm:text-sm text-foreground/90 dark:text-slate-300">
                                    Tanggal Transaksi <span className="text-rose-500">*</span>
                                </Label>
                                <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={`mt-1 h-11 sm:h-10 w-full justify-start text-left font-normal ${
                                                !data.transaction_date && 'text-muted-foreground'
                                            }`}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                                            <span className="font-medium text-foreground dark:text-slate-200">
                                                {formatDateIndonesian(data.transaction_date)}
                                            </span>
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={parseDateSafe(data.transaction_date)}
                                            defaultMonth={parseDateSafe(data.transaction_date) || new Date()}
                                            onSelect={(date) => {
                                                if (date) {
                                                    const year = date.getFullYear();
                                                    const month = String(date.getMonth() + 1).padStart(2, '0');
                                                    const day = String(date.getDate()).padStart(2, '0');
                                                    setData('transaction_date', `${year}-${month}-${day}`);
                                                    setCalendarOpen(false);
                                                }
                                            }}
                                            captionLayout="dropdown"
                                            fromYear={2020}
                                            toYear={2035}
                                            initialFocus
                                            className="rounded-xl border border-border bg-white dark:bg-card p-3 shadow-lg"
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
                                {processing ? 'Menyimpan...' : 'Simpan Transaksi'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
