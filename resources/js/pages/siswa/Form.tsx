import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Student } from '@/types';
import { router, useForm } from '@inertiajs/react';
import { AlertCircle, Calendar, GraduationCap, Hash, Save, School, User } from 'lucide-react';
import { useEffect, useState } from 'react';

interface StudentFormProps {
    student?: Student;
    onSuccess?: () => void;
    defaultClass?: string;
    defaultStatus?: string;
    defaultGender?: string;
    isSheet?: boolean;
}

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 12 }, (_, i) => String(currentYear - 6 + i));
const months = [
    { value: '1', label: 'Januari' },
    { value: '2', label: 'Februari' },
    { value: '3', label: 'Maret' },
    { value: '4', label: 'April' },
    { value: '5', label: 'Mei' },
    { value: '6', label: 'Juni' },
    { value: '7', label: 'Juli' },
    { value: '8', label: 'Agustus' },
    { value: '9', label: 'September' },
    { value: '10', label: 'Oktober' },
    { value: '11', label: 'November' },
    { value: '12', label: 'Desember' },
];

export default function StudentForm({
    student,
    onSuccess,
    defaultClass,
    defaultStatus,
    defaultGender,
    isSheet = false,
}: StudentFormProps) {
    const isEdit = !!student;
    const [processing, setProcessing] = useState(false);

    const { data, setData, errors, reset } = useForm({
        nisn: student?.nisn || '',
        name: student?.name || '',
        gender: (student?.gender as 'L' | 'P') || (defaultGender as 'L' | 'P') || ('' as 'L' | 'P' | ''),
        class: student?.class || (defaultClass && defaultClass !== 'all' && defaultClass !== 'none' ? defaultClass : ''),
        status: student?.status || defaultStatus || 'aktif',
        student_type: (student?.student_type as 'umum' | 'yatim' | 'piatu' | 'yatim_piatu') || 'umum',
        entry_month: student ? String(student.entry_month) : String(new Date().getMonth() + 1),
        entry_year: student ? String(student.entry_year) : String(currentYear),
        exit_month: student?.exit_month ? String(student.exit_month) : '',
        exit_year: student?.exit_year ? String(student.exit_year) : '',
    });

    // Sync prop changes if drawer opens for different class tab
    useEffect(() => {
        if (!isEdit && defaultClass && defaultClass !== 'all') {
            setData('class', defaultClass === 'none' ? '' : defaultClass);
        }
    }, [defaultClass, isEdit, setData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);

        // Validasi frontend: Pastikan bulan dan tahun keluar tidak lebih terdahulu dibanding bulan dan tahun masuk
        if (data.status === 'lulus' || data.status === 'pindah' || data.status === 'berhenti') {
            const entryScore = (Number(data.entry_year) || 0) * 12 + (Number(data.entry_month) || 0);
            const exitScore = (Number(data.exit_year) || 0) * 12 + (Number(data.exit_month) || 0);

            if (!data.exit_month || !data.exit_year || data.exit_month === 'none' || data.exit_year === 'none') {
                alert(`Bulan dan Tahun keluar wajib dipilih untuk siswa dengan status ${data.status.toUpperCase()}!`);
                setProcessing(false);
                return;
            }

            if (exitScore < entryScore) {
                alert('Bulan dan Tahun keluar TIDAK BOLEH lebih terdahulu dibandingkan Bulan dan Tahun masuk siswa!');
                setProcessing(false);
                return;
            }
        }

        if (isEdit && student) {
            router.put(route('siswa.update', student.id), data, {
                onFinish: () => setProcessing(false),
                onSuccess: () => {
                    onSuccess?.();
                },
            });
        } else {
            router.post(route('siswa.store'), data, {
                onFinish: () => setProcessing(false),
                onSuccess: () => {
                    reset();
                    onSuccess?.();
                },
            });
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Bagian 1: Identitas Pribadi */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 transition-all dark:border-slate-800 dark:bg-slate-800/40">
                <div className="mb-3 flex items-center gap-2 border-b border-slate-200/60 pb-2.5 dark:border-slate-700/60">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400">
                        <User className="h-4 w-4" />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Identitas Pribadi Siswa</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Nomor induk, nama lengkap, dan jenis kelamin</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                        <Label htmlFor="nisn" className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                            <Hash className="h-3.5 w-3.5 text-slate-400" />
                            NISN <span className="text-rose-500">*</span>
                        </Label>
                        <Input
                            id="nisn"
                            type="text"
                            placeholder="Contoh: 0051234567"
                            value={data.nisn}
                            onChange={(e) => setData('nisn', e.target.value)}
                            className="mt-1.5 font-mono text-sm shadow-xs bg-white dark:bg-slate-900"
                        />
                        {errors.nisn && <p className="mt-1 text-xs font-medium text-rose-600 dark:text-rose-400">{errors.nisn}</p>}
                    </div>

                    <div className="sm:col-span-2">
                        <Label htmlFor="name" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                            Nama Lengkap <span className="text-rose-500">*</span>
                        </Label>
                        <Input
                            id="name"
                            type="text"
                            placeholder="Contoh: Muhammad Al-Fatih"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            className="mt-1.5 text-sm shadow-xs bg-white dark:bg-slate-900"
                        />
                        {errors.name && <p className="mt-1 text-xs font-medium text-rose-600 dark:text-rose-400">{errors.name}</p>}
                    </div>

                    <div className="sm:col-span-2">
                        <Label htmlFor="gender" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                            Jenis Kelamin <span className="text-rose-500">*</span>
                        </Label>
                        <Select value={data.gender} onValueChange={(value) => setData('gender', value as 'L' | 'P')}>
                            <SelectTrigger className="mt-1.5 bg-white dark:bg-slate-900">
                                <SelectValue placeholder="Pilih jenis kelamin" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="L">
                                    <span className="flex items-center gap-2">
                                        <span className="font-medium text-blue-600 dark:text-blue-400">♂ Laki-laki</span> (Santriwan)
                                    </span>
                                </SelectItem>
                                <SelectItem value="P">
                                    <span className="flex items-center gap-2">
                                        <span className="font-medium text-pink-600 dark:text-pink-400">♀ Perempuan</span> (Santriwati)
                                    </span>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.gender && <p className="mt-1 text-xs font-medium text-rose-600 dark:text-rose-400">{errors.gender}</p>}
                    </div>
                </div>
            </div>

            {/* Bagian 2: Penempatan & Kategori Akademik */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 transition-all dark:border-slate-800 dark:bg-slate-800/40">
                <div className="mb-3 flex items-center gap-2 border-b border-slate-200/60 pb-2.5 dark:border-slate-700/60">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                        <School className="h-4 w-4" />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Penempatan & Kategori Siswa</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Tentukan penempatan kelas dan tipe pendaftaran</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <Label htmlFor="class" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                            Kelas Saat Ini
                        </Label>
                        <Select value={data.class} onValueChange={(value) => setData('class', value === 'none' ? '' : value)}>
                            <SelectTrigger className="mt-1.5 bg-white dark:bg-slate-900">
                                <SelectValue placeholder="Pilih kelas" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="1">Kelas 1</SelectItem>
                                <SelectItem value="2">Kelas 2</SelectItem>
                                <SelectItem value="3">Kelas 3</SelectItem>
                                <SelectItem value="4">Kelas 4</SelectItem>
                                <SelectItem value="5">Kelas 5</SelectItem>
                                <SelectItem value="6">Kelas 6</SelectItem>
                            </SelectContent>
                        </Select>
                        <p className="mt-1 text-[11px] text-slate-400">Kosongkan jika belum ditempatkan ke kelas tertentu.</p>
                    </div>

                    <div>
                        <Label htmlFor="student_type" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                            Jenis Siswa / Kategori
                        </Label>
                        <Select value={data.student_type} onValueChange={(value) => setData('student_type', value as 'umum' | 'yatim' | 'piatu' | 'yatim_piatu')}>
                            <SelectTrigger className="mt-1.5 bg-white dark:bg-slate-900">
                                <SelectValue placeholder="Pilih jenis siswa" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="umum">Umum</SelectItem>
                                <SelectItem value="yatim">Yatim</SelectItem>
                                <SelectItem value="piatu">Piatu</SelectItem>
                                <SelectItem value="yatim_piatu">Yatim Piatu</SelectItem>
                            </SelectContent>
                        </Select>
                        <p className="mt-1 text-[11px] text-slate-400">Digunakan untuk penanda keringanan atau prioritas SPP.</p>
                    </div>
                </div>
            </div>

            {/* Bagian 3: Periode Pendaftaran & Argo SPP */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 transition-all dark:border-slate-800 dark:bg-slate-800/40">
                <div className="mb-3 flex items-center gap-2 border-b border-slate-200/60 pb-2.5 dark:border-slate-700/60">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
                        <Calendar className="h-4 w-4" />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Periode Masuk & Tagihan SPP</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Titik awal dimulainya tagihan bulanan siswa</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <Label htmlFor="entry_month" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                            Bulan Masuk <span className="text-rose-500">*</span>
                        </Label>
                        <Select value={data.entry_month} onValueChange={(value) => setData('entry_month', value)}>
                            <SelectTrigger className="mt-1.5 bg-white dark:bg-slate-900">
                                <SelectValue placeholder="Pilih bulan" />
                            </SelectTrigger>
                            <SelectContent>
                                {months.map((month) => (
                                    <SelectItem key={month.value} value={month.value}>
                                        {month.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.entry_month && <p className="mt-1 text-xs font-medium text-rose-600 dark:text-rose-400">{errors.entry_month}</p>}
                    </div>

                    <div>
                        <Label htmlFor="entry_year" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                            Tahun Masuk <span className="text-rose-500">*</span>
                        </Label>
                        <Select value={data.entry_year} onValueChange={(value) => setData('entry_year', value)}>
                            <SelectTrigger className="mt-1.5 bg-white dark:bg-slate-900">
                                <SelectValue placeholder="Pilih tahun" />
                            </SelectTrigger>
                            <SelectContent>
                                {years.map((year) => (
                                    <SelectItem key={year} value={year}>
                                        {year}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.entry_year && <p className="mt-1 text-xs font-medium text-rose-600 dark:text-rose-400">{errors.entry_year}</p>}
                    </div>
                </div>

                <div className="mt-3 flex items-start gap-2 rounded-lg border border-indigo-200/60 bg-indigo-50/50 p-2.5 text-xs text-indigo-900 dark:border-indigo-900/40 dark:bg-indigo-950/20 dark:text-indigo-300">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600 dark:text-indigo-400" />
                    <span>
                        Sistem Virtual Ledger akan otomatis mulai membuat tagihan SPP siswa secara berkala terhitung sejak bulan dan tahun yang dipilih di atas.
                    </span>
                </div>
            </div>

            {/* Bagian 4: Status Kesiswaan */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 transition-all dark:border-slate-800 dark:bg-slate-800/40">
                <div className="mb-3 flex items-center gap-2 border-b border-slate-200/60 pb-2.5 dark:border-slate-700/60">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400">
                        <GraduationCap className="h-4 w-4" />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Status Kesiswaan</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Status keaktifan santri di dayah</p>
                    </div>
                </div>

                <div>
                    <Label htmlFor="status" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Status Saat Ini <span className="text-rose-500">*</span>
                    </Label>
                    <Select value={data.status} onValueChange={(value) => setData('status', value)}>
                        <SelectTrigger className="mt-1.5 bg-white dark:bg-slate-900">
                            <SelectValue placeholder="Pilih status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="aktif">
                                <span className="flex items-center gap-2 font-medium text-emerald-600 dark:text-emerald-400">
                                    ● Aktif Belajar
                                </span>
                            </SelectItem>
                            <SelectItem value="lulus">
                                <span className="flex items-center gap-2 font-medium text-blue-600 dark:text-blue-400">
                                    ● Lulus (Alumni)
                                </span>
                            </SelectItem>
                            <SelectItem value="pindah">
                                <span className="flex items-center gap-2 font-medium text-amber-600 dark:text-amber-400">
                                    ● Pindah Sekolah
                                </span>
                            </SelectItem>
                            <SelectItem value="berhenti">
                                <span className="flex items-center gap-2 font-medium text-rose-600 dark:text-rose-400">
                                    ● Berhenti / Keluar
                                </span>
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {(data.status === 'lulus' || data.status === 'pindah' || data.status === 'berhenti') && (
                    <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-4 shadow-2xs dark:border-amber-900/60 dark:bg-amber-950/30">
                        <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold text-amber-800 dark:text-amber-300">
                            <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                            <span>
                                Siswa berstatus <span className="uppercase font-bold">{data.status}</span>. Wajib menentukan bulan dan tahun keluar agar sistem otomatis menghentikan penagihan SPP selanjutnya.
                            </span>
                        </p>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <Label htmlFor="exit_month" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                    Bulan Keluar <span className="text-rose-500">*</span>
                                </Label>
                                <Select value={data.exit_month} onValueChange={(value) => setData('exit_month', value === 'none' ? '' : value)}>
                                    <SelectTrigger className="mt-1 bg-white dark:bg-slate-900">
                                        <SelectValue placeholder="Pilih bulan keluar" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">- Pilih Bulan -</SelectItem>
                                        {months.map((month) => {
                                            const isSameYear = Number(data.exit_year) === Number(data.entry_year);
                                            const isBeforeEntry = isSameYear && Number(month.value) < Number(data.entry_month || 0);
                                            return (
                                                <SelectItem key={month.value} value={month.value} disabled={isBeforeEntry}>
                                                    {month.label} {isBeforeEntry ? '(Sebelum Bulan Masuk)' : ''}
                                                </SelectItem>
                                            );
                                        })}
                                    </SelectContent>
                                </Select>
                                {errors.exit_month && <p className="mt-1 text-xs font-medium text-rose-600 dark:text-rose-400">{errors.exit_month}</p>}
                            </div>

                            <div>
                                <Label htmlFor="exit_year" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                    Tahun Keluar <span className="text-rose-500">*</span>
                                </Label>
                                <Select
                                    value={data.exit_year}
                                    onValueChange={(value) => {
                                        const newYear = value === 'none' ? '' : value;
                                        setData((prev) => {
                                            const updated = { ...prev, exit_year: newYear };
                                            if (newYear && Number(newYear) === Number(prev.entry_year) && Number(prev.exit_month) < Number(prev.entry_month)) {
                                                updated.exit_month = prev.entry_month;
                                            }
                                            return updated;
                                        });
                                    }}
                                >
                                    <SelectTrigger className="mt-1 bg-white dark:bg-slate-900">
                                        <SelectValue placeholder="Pilih tahun keluar" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">- Pilih Tahun -</SelectItem>
                                        {years.map((year) => {
                                            const isBeforeEntryYear = Number(year) < Number(data.entry_year || 0);
                                            return (
                                                <SelectItem key={year} value={year} disabled={isBeforeEntryYear}>
                                                    {year} {isBeforeEntryYear ? '(Sebelum Tahun Masuk)' : ''}
                                                </SelectItem>
                                            );
                                        })}
                                    </SelectContent>
                                </Select>
                                {errors.exit_year && <p className="mt-1 text-xs font-medium text-rose-600 dark:text-rose-400">{errors.exit_year}</p>}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Action Buttons */}
            <div className={`flex items-center justify-end gap-3 pt-2 ${isSheet ? 'border-t border-slate-200/80 pt-4 dark:border-slate-800' : ''}`}>
                <Button type="submit" disabled={processing} className="w-full sm:w-auto shadow-sm">
                    <Save className="mr-2 h-4 w-4" />
                    {processing ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan Siswa' : 'Simpan Siswa Baru'}
                </Button>
            </div>
        </form>
    );
}
