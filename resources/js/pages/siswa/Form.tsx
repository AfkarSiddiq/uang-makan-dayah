import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Student } from '@/types';
import { router, useForm } from '@inertiajs/react';
import { Save } from 'lucide-react';
import { useState } from 'react';

interface StudentFormProps {
    student?: Student;
    onSuccess: () => void;
}

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 10 }, (_, i) => String(currentYear - 5 + i));
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

export default function StudentForm({ student, onSuccess }: StudentFormProps) {
    const isEdit = !!student;
    const [processing, setProcessing] = useState(false);

    const { data, setData, errors } = useForm({
        nisn: student?.nisn || '',
        name: student?.name || '',
        gender: (student?.gender as 'L' | 'P') || ('' as 'L' | 'P' | ''),
        class: student?.class || '',
        status: student?.status || 'aktif',
        student_type: (student?.student_type as 'umum' | 'yatim' | 'piatu' | 'yatim_piatu') || 'umum',
        entry_month: student ? String(student.entry_month) : '',
        entry_year: student ? String(student.entry_year) : '',
        exit_month: student?.exit_month ? String(student.exit_month) : '',
        exit_year: student?.exit_year ? String(student.exit_year) : '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);

        if (isEdit) {
            router.put(route('siswa.update', student!.id), data, {
                onFinish: () => setProcessing(false),
                onSuccess,
            });
        } else {
            router.post(route('siswa.store'), data, {
                onFinish: () => setProcessing(false),
                onSuccess,
            });
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-1 flex flex-col">
            <div className="flex flex-row space-x-2">
                <div>
                    <Label htmlFor="nisn" className="text-slate-700 dark:text-slate-300">
                        NISN <span className="text-rose-500">*</span>
                    </Label>
                    <Input
                        id="nisn"
                        type="text"
                        placeholder="Masukkan NISN"
                        value={data.nisn}
                        onChange={(e) => setData('nisn', e.target.value)}
                        className="mt-1"
                    />
                    {errors.nisn && <p className="mt-1 text-sm text-rose-600">{errors.nisn}</p>}
                </div>

                <div>
                    <Label htmlFor="name" className="text-slate-700 dark:text-slate-300">
                        Nama Lengkap <span className="text-rose-500">*</span>
                    </Label>
                    <Input
                        id="name"
                        type="text"
                        placeholder="Masukkan nama lengkap"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        className="mt-1"
                    />
                    {errors.name && <p className="mt-1 text-sm text-rose-600">{errors.name}</p>}
                </div>
            </div>

            <div>
                <Label htmlFor="gender" className="text-slate-700 dark:text-slate-300">
                    Jenis Kelamin <span className="text-rose-500">*</span>
                </Label>
                <Select value={data.gender} onValueChange={(value) => setData('gender', value as 'L' | 'P')}>
                    <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Pilih jenis kelamin" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="L">Laki-laki</SelectItem>
                        <SelectItem value="P">Perempuan</SelectItem>
                    </SelectContent>
                </Select>
                {errors.gender && <p className="mt-1 text-sm text-rose-600">{errors.gender}</p>}
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                    <Label htmlFor="class" className="text-slate-700 dark:text-slate-300">
                        Kelas
                    </Label>
                    <Select value={data.class} onValueChange={(value) => setData('class', value)}>
                        <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Pilih kelas" />
                        </SelectTrigger>
                        <SelectContent>
                            {/* <SelectItem value="none">Belum Kelas</SelectItem> */}
                            <SelectItem value="1">Kelas 1</SelectItem>
                            <SelectItem value="2">Kelas 2</SelectItem>
                            <SelectItem value="3">Kelas 3</SelectItem>
                            <SelectItem value="4">Kelas 4</SelectItem>
                            <SelectItem value="5">Kelas 5</SelectItem>
                            <SelectItem value="6">Kelas 6</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div>
                    <Label htmlFor="status" className="text-slate-700 dark:text-slate-300">
                        Status
                    </Label>
                    <Select value={data.status} onValueChange={(value) => setData('status', value)}>
                        <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Pilih status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="aktif">Aktif</SelectItem>
                            <SelectItem value="lulus">Lulus</SelectItem>
                            <SelectItem value="pindah">Pindah</SelectItem>
                            <SelectItem value="berhenti">Berhenti</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div>
                <Label htmlFor="student_type" className="text-slate-700 dark:text-slate-300">
                    Jenis Siswa
                </Label>
                <Select value={data.student_type} onValueChange={(value) => setData('student_type', value as 'umum' | 'yatim' | 'piatu' | 'yatim_piatu')}>
                    <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Pilih jenis siswa" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="umum">Umum</SelectItem>
                        <SelectItem value="yatim">Yatim</SelectItem>
                        <SelectItem value="piatu">Piatu</SelectItem>
                        <SelectItem value="yatim_piatu">Yatim Piatu</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                    <Label htmlFor="entry_month" className="text-slate-700 dark:text-slate-300">
                        Bulan Masuk <span className="text-rose-500">*</span>
                    </Label>
                    <Select value={data.entry_month} onValueChange={(value) => setData('entry_month', value)}>
                        <SelectTrigger className="mt-1">
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
                    {errors.entry_month && <p className="mt-1 text-sm text-rose-600">{errors.entry_month}</p>}
                </div>

                <div>
                    <Label htmlFor="entry_year" className="text-slate-700 dark:text-slate-300">
                        Tahun Masuk <span className="text-rose-500">*</span>
                    </Label>
                    <Select value={data.entry_year} onValueChange={(value) => setData('entry_year', value)}>
                        <SelectTrigger className="mt-1">
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
                    {errors.entry_year && <p className="mt-1 text-sm text-rose-600">{errors.entry_year}</p>}
                </div>
            </div>

            {isEdit && (data.status === 'lulus' || data.status === 'pindah' || data.status === 'berhenti') && (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                        <Label htmlFor="exit_month" className="text-slate-700 dark:text-slate-300">
                            Bulan Keluar
                        </Label>
                        <Select value={data.exit_month} onValueChange={(value) => setData('exit_month', value === 'none' ? '' : value)}>
                            <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Pilih bulan" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">-</SelectItem>
                                {months.map((month) => (
                                    <SelectItem key={month.value} value={month.value}>
                                        {month.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label htmlFor="exit_year" className="text-slate-700 dark:text-slate-300">
                            Tahun Keluar
                        </Label>
                        <Select value={data.exit_year} onValueChange={(value) => setData('exit_year', value === 'none' ? '' : value)}>
                            <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Pilih tahun" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">-</SelectItem>
                                {years.map((year) => (
                                    <SelectItem key={year} value={year}>
                                        {year}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
                <Button type="submit" disabled={processing}>
                    <Save className="mr-2 h-4 w-4" />
                    {isEdit ? 'Simpan Perubahan' : 'Simpan Siswa'}
                </Button>
            </div>
        </form>
    );
}
