import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { Student } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';

interface Props {
    student: Student;
}

export default function Edit({ student }: Props) {
    const { data, setData, patch, processing, errors } = useForm({
        nisn: student.nisn,
        name: student.name,
        gender: student.gender as 'L' | 'P',
        class: student.class || '',
        status: student.status,
        entry_month: String(student.entry_month),
        entry_year: String(student.entry_year),
        exit_month: student.exit_month ? String(student.exit_month) : '',
        exit_year: student.exit_year ? String(student.exit_year) : '',
    });

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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.put(route('siswa.update', student.id), data, {
            onSuccess: () => {
                router.visit(route('siswa.index'));
            },
        });
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Siswa', href: '/siswa' },
                { title: student.name, href: '#' },
            ]}
        >
            <Head title={`Edit ${student.name}`} />

            <div className="mx-auto max-w-2xl space-y-6 p-6">
                <Link
                    href={route('siswa.index')}
                    className="inline-flex items-center text-sm font-medium text-slate-500 transition hover:text-slate-900 dark:hover:text-white"
                >
                    <ArrowLeft className="mr-1 h-4 w-4" />
                    Kembali ke Data Siswa
                </Link>

                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <div className="border-b border-slate-200 p-6 dark:border-slate-800">
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Edit Siswa</h2>
                        <p className="mt-1 text-sm text-slate-500">Edit data siswa</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6 p-6">
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

                        <div>
                            <Label className="text-slate-700 dark:text-slate-300">
                                Jenis Kelamin <span className="text-rose-500">*</span>
                            </Label>
                            <div className="mt-1 flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setData('gender', 'L')}
                                    className={`flex-1 rounded-lg border-2 px-4 py-3 text-sm font-medium transition ${
                                        data.gender === 'L'
                                            ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400'
                                            : 'border-slate-200 text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:text-slate-400'
                                    }`}
                                >
                                    Laki-laki
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setData('gender', 'P')}
                                    className={`flex-1 rounded-lg border-2 px-4 py-3 text-sm font-medium transition ${
                                        data.gender === 'P'
                                            ? 'border-pink-500 bg-pink-50 text-pink-700 dark:bg-pink-950/30 dark:text-pink-400'
                                            : 'border-slate-200 text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:text-slate-400'
                                    }`}
                                >
                                    Perempuan
                                </button>
                            </div>
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
                                        <SelectItem value="none">Belum Kelas</SelectItem>
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

                        {(data.status === 'lulus' || data.status === 'pindah' || data.status === 'berhenti') && (
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

                        <div className="flex justify-end gap-3 border-t border-slate-200 pt-4 dark:border-slate-800">
                            <Link href={route('siswa.index')}>
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
