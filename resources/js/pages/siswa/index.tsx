import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { Student } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowDown, ArrowUp, Plus, Search, Trash2, Upload } from 'lucide-react';

interface Props {
    students: {
        data: Student[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
    };
    filters: {
        search?: string;
        per_page?: string;
        sort_by?: string;
        sort_dir?: string;
    };
}

export default function Index({ students, filters }: Props) {
    const applyFilters = (newFilters: Record<string, string>) => {
        router.get(route('siswa.index'), { ...filters, ...newFilters }, { preserveState: true });
    };

    const handleDelete = (id: number) => {
        if (confirm('Yakin ingin menghapus siswa ini?')) {
            router.delete(route('siswa.destroy', id));
        }
    };

    const handleSort = (column: string) => {
        const newDir = filters.sort_by === column && filters.sort_dir === 'asc' ? 'desc' : 'asc';
        applyFilters({ sort_by: column, sort_dir: newDir, page: '1' });
    };

    const getSortButtonClass = (column: string) => {
        const isActive = filters.sort_by === column;
        return isActive
            ? 'flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-semibold'
            : 'flex items-center gap-1 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300';
    };

    const getStatusBadge = (status: string) => {
        const statusStyles: Record<string, string> = {
            aktif: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
            lulus: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
            pindah: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
            berhenti: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
        };
        return statusStyles[status] || 'bg-slate-100 text-slate-700';
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Siswa', href: '/siswa' }]}>
            <Head title="Siswa" />

            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Data Siswa</h1>
                        <p className="text-sm text-slate-500">Kelola data siswa</p>
                    </div>
                    <div className="flex gap-2">
                        <Link href={route('siswa.import.create')}>
                            <Button variant="outline">
                                <Upload className="mr-2 h-4 w-4" />
                                Import
                            </Button>
                        </Link>
                        <Link href={route('siswa.create')}>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Tambah Siswa
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <div className="border-b border-slate-200 p-4 dark:border-slate-800">
                        <div className="relative max-w-md">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <Input
                                placeholder="Cari nama atau NISN..."
                                className="pl-9"
                                defaultValue={filters.search}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        applyFilters({ search: (e.target as HTMLInputElement).value });
                                    }
                                }}
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/50">
                                    <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                                        <button onClick={() => handleSort('nisn')} className={getSortButtonClass('nisn')}>
                                            NISN
                                            {filters.sort_by === 'nisn' &&
                                                (filters.sort_dir === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
                                        </button>
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                                        <button onClick={() => handleSort('name')} className={getSortButtonClass('name')}>
                                            Nama
                                            {filters.sort_by === 'name' &&
                                                (filters.sort_dir === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
                                        </button>
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                                        <button onClick={() => handleSort('gender')} className={getSortButtonClass('gender')}>
                                            Jenis Kelamin
                                            {filters.sort_by === 'gender' &&
                                                (filters.sort_dir === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
                                        </button>
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                                        <button onClick={() => handleSort('class')} className={getSortButtonClass('class')}>
                                            Kelas
                                            {filters.sort_by === 'class' &&
                                                (filters.sort_dir === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
                                        </button>
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                                        <button onClick={() => handleSort('status')} className={getSortButtonClass('status')}>
                                            Status
                                            {filters.sort_by === 'status' &&
                                                (filters.sort_dir === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
                                        </button>
                                    </th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold tracking-wider text-slate-500 uppercase">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {students.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                                            <div className="flex flex-col items-center gap-2">
                                                <Search className="h-8 w-8 text-slate-300" />
                                                <p>Tidak ada siswa ditemukan</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    students.data.map((student) => (
                                        <tr key={student.id} className="transition hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                            <td className="px-4 py-3">
                                                <span className="font-mono text-sm font-medium text-slate-900 dark:text-white">{student.nisn}</span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-slate-900 dark:text-white">{student.name}</td>
                                            <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                                                {student.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                                                {student.class ? `Kelas ${student.class}` : '-'}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span
                                                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadge(student.status)}`}
                                                >
                                                    {student.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <div className="flex items-center justify-center gap-1">
                                                    <Link href={route('siswa.edit', student.id)}>
                                                        <Button variant="ghost" size="sm">
                                                            Edit
                                                        </Button>
                                                    </Link>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                                                        onClick={() => handleDelete(student.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                            <p className="text-sm text-slate-500">
                                Menampilkan {students.from} - {students.to} dari {students.total} siswa
                            </p>
                            <Select
                                value={String(filters.per_page || students.per_page)}
                                onValueChange={(value) => applyFilters({ per_page: value, page: '1' })}
                            >
                                <SelectTrigger className="h-8 w-[70px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent side="top">
                                    <SelectItem value="10">10</SelectItem>
                                    <SelectItem value="25">25</SelectItem>
                                    <SelectItem value="50">50</SelectItem>
                                    <SelectItem value="100">100</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {students.last_page > 1 && (
                            <div className="flex gap-1">
                                {students.current_page > 1 && (
                                    <Button variant="outline" size="sm" onClick={() => applyFilters({ page: String(students.current_page - 1) })}>
                                        Previous
                                    </Button>
                                )}
                                {students.current_page < students.last_page && (
                                    <Button variant="outline" size="sm" onClick={() => applyFilters({ page: String(students.current_page + 1) })}>
                                        Next
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
