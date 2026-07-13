import { Button } from '@/components/ui/button';
import { SearchInput } from '@/components/ui/search-input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import AppLayout from '@/layouts/app-layout';
import { Student } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowDown,
    ArrowUp,
    Download,
    Eye,
    Filter,
    GraduationCap,
    Grid,
    LayoutList,
    Plus,
    Search,
    Trash2,
    Upload,
    UserCheck,
    UserPlus,
    Users,
} from 'lucide-react';
import { useState } from 'react';
import StudentForm from './Form';

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
    stats?: {
        total_aktif: number;
        santriwan_aktif: number;
        santriwati_aktif: number;
        total_non_aktif: number;
    };
    classBreakdown?: {
        all: number;
        '1': number;
        '2': number;
        '3': number;
        '4': number;
        '5': number;
        '6': number;
        none: number;
    };
    filters: {
        search?: string;
        class?: string;
        status?: string;
        gender?: string;
        student_type?: string;
        per_page?: string;
        sort_by?: string;
        sort_dir?: string;
    };
}

export default function Index({ students, stats, classBreakdown, filters }: Props) {
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
    const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);

    const applyFilters = (newFilters: Record<string, string>) => {
        router.get(route('siswa.index'), { ...filters, ...newFilters }, { preserveState: true, preserveScroll: true });
    };

    const handleDelete = (id: number, name: string) => {
        if (confirm(`Yakin ingin menghapus data siswa "${name}"?`)) {
            router.delete(route('siswa.destroy', id));
        }
    };

    const handleSort = (column: string) => {
        const newDir = filters.sort_by === column && filters.sort_dir === 'asc' ? 'desc' : 'asc';
        applyFilters({ sort_by: column, sort_dir: newDir, page: '1' });
    };

    const getSortIcon = (column: string) => {
        if (filters.sort_by !== column) return null;
        return filters.sort_dir === 'asc' ? <ArrowUp className="ml-1 h-3.5 w-3.5" /> : <ArrowDown className="ml-1 h-3.5 w-3.5" />;
    };

    const getStatusBadge = (status: string) => {
        const statusStyles: Record<string, string> = {
            aktif: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/60',
            lulus: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800/60',
            pindah: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/60',
            berhenti: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/60',
        };
        return statusStyles[status] || 'bg-slate-100 text-slate-700 border-slate-200';
    };

    const getProfileRoute = (student: Student) => {
        if (student.gender === 'L') {
            return route('santriwan.show', student.id);
        } else if (student.gender === 'P') {
            return route('santriwati.show', student.id);
        }
        return route('siswa.show', student.id);
    };

    const currentClassTab = filters.class || 'all';
    const currentStatusFilter = filters.status || 'aktif';

    const classTabs = [
        { id: 'all', label: 'Semua Kelas', count: classBreakdown?.all || 0 },
        { id: '1', label: 'Kelas 1', count: classBreakdown?.['1'] || 0 },
        { id: '2', label: 'Kelas 2', count: classBreakdown?.['2'] || 0 },
        { id: '3', label: 'Kelas 3', count: classBreakdown?.['3'] || 0 },
        { id: '4', label: 'Kelas 4', count: classBreakdown?.['4'] || 0 },
        { id: '5', label: 'Kelas 5', count: classBreakdown?.['5'] || 0 },
        { id: '6', label: 'Kelas 6', count: classBreakdown?.['6'] || 0 },
        { id: 'none', label: 'Belum Kelas', count: classBreakdown?.none || 0 },
    ];

    return (
        <AppLayout breadcrumbs={[{ title: 'Data & Input Siswa', href: '/siswa' }]}>
            <Head title="Manajemen & Input Siswa" />

            <div className="space-y-6 p-6">
                {/* Header & Quick Actions */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Pusat Data & Registrasi Siswa</h1>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            Kelola data santriwan & santriwati per kelas, riwayat keaktifan, dan pendaftaran siswa baru.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <a href={route('siswa.export')} download>
                            <Button variant="outline" size="sm" className="h-9">
                                <Download className="mr-1.5 h-4 w-4 text-slate-500" />
                                Export
                            </Button>
                        </a>
                        <Link href={route('siswa.import.create')}>
                            <Button variant="outline" size="sm" className="h-9">
                                <Upload className="mr-1.5 h-4 w-4 text-slate-500" />
                                Import Excel
                            </Button>
                        </Link>
                        <Button onClick={() => setIsAddSheetOpen(true)} size="sm" className="h-9 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm">
                            <Plus className="mr-1.5 h-4 w-4" />
                            Tambah Siswa Cepat
                        </Button>
                        <Link href={route('siswa.create')} title="Buka form di halaman penuh">
                            <Button variant="outline" size="sm" className="h-9 px-2.5 text-indigo-600 hover:text-indigo-700 dark:text-indigo-400">
                                <UserPlus className="h-4 w-4" />
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Statistics Grid */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br from-white via-slate-50/50 to-indigo-50/30 p-5 shadow-xs dark:border-slate-800/80 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/20">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Santri Aktif</span>
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400">
                                <Users className="h-5 w-5" />
                            </div>
                        </div>
                        <div className="mt-2 flex items-baseline gap-2">
                            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{stats?.total_aktif || 0}</span>
                            <span className="text-xs font-medium text-slate-500">Siswa</span>
                        </div>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Siswa aktif menimba ilmu di dayah</p>
                    </div>

                    <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br from-white via-slate-50/50 to-blue-50/30 p-5 shadow-xs dark:border-slate-800/80 dark:from-slate-900 dark:via-slate-900 dark:to-blue-950/20">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Santriwan (Putra)</span>
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
                                <UserCheck className="h-5 w-5" />
                            </div>
                        </div>
                        <div className="mt-2 flex items-baseline gap-2">
                            <span className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">{stats?.santriwan_aktif || 0}</span>
                            <span className="text-xs font-medium text-slate-500">Siswa</span>
                        </div>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Remaja putra berstatus aktif</p>
                    </div>

                    <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br from-white via-slate-50/50 to-pink-50/30 p-5 shadow-xs dark:border-slate-800/80 dark:from-slate-900 dark:via-slate-900 dark:to-pink-950/20">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Santriwati (Putri)</span>
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-500/10 text-pink-600 dark:bg-pink-500/20 dark:text-pink-400">
                                <Users className="h-5 w-5" />
                            </div>
                        </div>
                        <div className="mt-2 flex items-baseline gap-2">
                            <span className="text-3xl font-extrabold text-pink-600 dark:text-pink-400">{stats?.santriwati_aktif || 0}</span>
                            <span className="text-xs font-medium text-slate-500">Siswa</span>
                        </div>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Remaja putri berstatus aktif</p>
                    </div>

                    <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br from-white via-slate-50/50 to-amber-50/30 p-5 shadow-xs dark:border-slate-800/80 dark:from-slate-900 dark:via-slate-900 dark:to-amber-950/20">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Alumni & Non-Aktif</span>
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
                                <GraduationCap className="h-5 w-5" />
                            </div>
                        </div>
                        <div className="mt-2 flex items-baseline gap-2">
                            <span className="text-3xl font-extrabold text-slate-700 dark:text-slate-300">{stats?.total_non_aktif || 0}</span>
                            <span className="text-xs font-medium text-slate-500">Siswa</span>
                        </div>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Status lulus, pindah, atau keluar</p>
                    </div>
                </div>

                {/* Main Content Card */}
                <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs dark:border-slate-800/80 dark:bg-slate-900">
                    {/* Class Navigation Tabs */}
                    <div className="border-b border-slate-200/80 px-4 pt-4 dark:border-slate-800/80">
                        <div className="flex items-center justify-between pb-3">
                            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                                {classTabs.map((tab) => {
                                    const isActive = currentClassTab === tab.id;
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => applyFilters({ class: tab.id, page: '1' })}
                                            className={`flex items-center gap-2 whitespace-nowrap rounded-xl px-3.5 py-2 text-xs font-semibold transition-all ${
                                                isActive
                                                    ? 'bg-indigo-600 text-white shadow-sm dark:bg-indigo-500'
                                                    : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/80 dark:bg-slate-800/60 dark:text-slate-400 dark:hover:bg-slate-800'
                                            }`}
                                        >
                                            <span>{tab.label}</span>
                                            <span
                                                className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                                                    isActive
                                                        ? 'bg-white/20 text-white'
                                                        : 'bg-white text-slate-700 shadow-2xs dark:bg-slate-900 dark:text-slate-300'
                                                }`}
                                            >
                                                {tab.count}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Filter & View Control Bar */}
                    <div className="flex flex-col gap-3 border-b border-slate-200/80 bg-slate-50/50 p-4 dark:border-slate-800/80 dark:bg-slate-800/30 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex flex-1 flex-wrap items-center gap-2.5">
                            <div className="relative min-w-[240px] flex-1 max-w-sm">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                <Input
                                    placeholder="Cari nama siswa atau NISN..."
                                    className="pl-9 h-9 text-sm bg-white dark:bg-slate-900"
                                    defaultValue={filters.search}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            applyFilters({ search: (e.target as HTMLInputElement).value, page: '1' });
                                        }
                                    }}
                                />
                            </div>

                            <div className="flex items-center gap-1.5">
                                <Filter className="h-3.5 w-3.5 text-slate-400 hidden sm:inline" />
                                <Select
                                    value={currentStatusFilter}
                                    onValueChange={(value) => applyFilters({ status: value, page: '1' })}
                                >
                                    <SelectTrigger className="h-9 w-[135px] bg-white text-xs dark:bg-slate-900">
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="aktif">Status: Aktif</SelectItem>
                                        <SelectItem value="lulus">Status: Lulus</SelectItem>
                                        <SelectItem value="pindah">Status: Pindah</SelectItem>
                                        <SelectItem value="berhenti">Berhenti</SelectItem>
                                        <SelectItem value="all">Semua Status</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Select
                                    value={filters.gender || 'all'}
                                    onValueChange={(value) => applyFilters({ gender: value, page: '1' })}
                                >
                                    <SelectTrigger className="h-9 w-[140px] bg-white text-xs dark:bg-slate-900">
                                        <SelectValue placeholder="Gender" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Gender</SelectItem>
                                        <SelectItem value="L">♂ Santriwan</SelectItem>
                                        <SelectItem value="P">♀ Santriwati</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Select
                                    value={filters.student_type || 'all'}
                                    onValueChange={(value) => applyFilters({ student_type: value, page: '1' })}
                                >
                                    <SelectTrigger className="h-9 w-[140px] bg-white text-xs dark:bg-slate-900">
                                        <SelectValue placeholder="Kategori" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Kategori</SelectItem>
                                        <SelectItem value="umum">Umum</SelectItem>
                                        <SelectItem value="yatim">Yatim</SelectItem>
                                        <SelectItem value="piatu">Piatu</SelectItem>
                                        <SelectItem value="yatim_piatu">Yatim Piatu</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Toggle Table vs Grid View */}
                        <div className="flex items-center justify-end gap-1 border-l border-slate-200/80 pl-2 dark:border-slate-700/80">
                            <button
                                onClick={() => setViewMode('table')}
                                className={`flex h-8 w-8 items-center justify-center rounded-lg transition ${
                                    viewMode === 'table'
                                        ? 'bg-indigo-600 text-white shadow-2xs dark:bg-indigo-500'
                                        : 'text-slate-500 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                                }`}
                                title="Tampilan Tabel"
                            >
                                <LayoutList className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`flex h-8 w-8 items-center justify-center rounded-lg transition ${
                                    viewMode === 'grid'
                                        ? 'bg-indigo-600 text-white shadow-2xs dark:bg-indigo-500'
                                        : 'text-slate-500 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                                }`}
                                title="Tampilan Kartu"
                            >
                                <Grid className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    {/* Data Display */}
                    {students.data.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
                                <Search className="h-8 w-8" />
                            </div>
                            <h3 className="mt-4 text-base font-semibold text-slate-900 dark:text-white">Tidak ada data siswa ditemukan</h3>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 max-w-sm">
                                Coba ubah kata kunci pencarian, atau ganti filter status/kelas yang dipilih saat ini.
                            </p>
                            <Button onClick={() => setIsAddSheetOpen(true)} className="mt-5 bg-indigo-600 hover:bg-indigo-700 text-white">
                                <Plus className="mr-2 h-4 w-4" />
                                Masukkan Siswa Baru
                            </Button>
                        </div>
                    ) : viewMode === 'table' ? (
                        /* Mode Tabel */
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-200/80 bg-slate-50/70 text-xs font-semibold tracking-wider text-slate-600 uppercase dark:border-slate-800/80 dark:bg-slate-800/40 dark:text-slate-400">
                                        <th className="px-5 py-3.5">
                                            <button onClick={() => handleSort('nisn')} className="flex items-center gap-1 hover:text-indigo-600">
                                                NISN {getSortIcon('nisn')}
                                            </button>
                                        </th>
                                        <th className="px-5 py-3.5">
                                            <button onClick={() => handleSort('name')} className="flex items-center gap-1 hover:text-indigo-600">
                                                Nama Lengkap {getSortIcon('name')}
                                            </button>
                                        </th>
                                        <th className="px-5 py-3.5">
                                            <button onClick={() => handleSort('gender')} className="flex items-center gap-1 hover:text-indigo-600">
                                                Gender {getSortIcon('gender')}
                                            </button>
                                        </th>
                                        <th className="px-5 py-3.5">
                                            <button onClick={() => handleSort('class')} className="flex items-center gap-1 hover:text-indigo-600">
                                                Kelas {getSortIcon('class')}
                                            </button>
                                        </th>
                                        <th className="px-5 py-3.5">Kategori</th>
                                        <th className="px-5 py-3.5">
                                            <button onClick={() => handleSort('status')} className="flex items-center gap-1 hover:text-indigo-600">
                                                Status {getSortIcon('status')}
                                            </button>
                                        </th>
                                        <th className="px-5 py-3.5 text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-sm">
                                    {students.data.map((student) => (
                                        <tr key={student.id} className="transition-colors hover:bg-indigo-50/30 dark:hover:bg-slate-800/50">
                                            <td className="px-5 py-3.5">
                                                <span className="font-mono font-medium text-slate-900 dark:text-white">{student.nisn}</span>
                                                <span className="block text-[11px] text-slate-400">Masuk: {student.entry_year}</span>
                                            </td>
                                            <td className="px-5 py-3.5 font-medium text-slate-900 dark:text-white">
                                                {student.name}
                                            </td>
                                            <td className="px-5 py-3.5">
                                                {student.gender === 'L' ? (
                                                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400">
                                                        <span>♂</span> Santriwan
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-pink-600 dark:text-pink-400">
                                                        <span>♀</span> Santriwati
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-5 py-3.5 text-slate-700 dark:text-slate-300">
                                                {student.class ? (
                                                    <span className="inline-flex rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-400">
                                                        Kelas {student.class}
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-400 italic text-xs">Belum Kelas</span>
                                                )}
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <span className="capitalize text-xs font-medium text-slate-600 dark:text-slate-400">
                                                    {student.student_type ? student.student_type.replace('_', ' ') : 'Umum'}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${getStatusBadge(student.status)}`}>
                                                    {student.status}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5 text-center">
                                                <div className="flex items-center justify-center gap-1">
                                                    <Link href={getProfileRoute(student)} title="Lihat Profil & Buku SPP">
                                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 dark:text-indigo-400 dark:hover:bg-indigo-950/50">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <Link href={route('siswa.edit', student.id)} title="Edit Siswa">
                                                        <Button variant="ghost" size="sm" className="h-8 px-2 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">
                                                            Edit
                                                        </Button>
                                                    </Link>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        title="Hapus Siswa"
                                                        className="h-8 w-8 p-0 text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-950/40"
                                                        onClick={() => handleDelete(student.id, student.name)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        /* Mode Kartu (Grid View) */
                        <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 md:grid-cols-3">
                            {students.data.map((student) => (
                                <div
                                    key={student.id}
                                    className="flex flex-col justify-between rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs transition-all hover:border-indigo-500/50 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
                                >
                                    <div>
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-lg font-bold ${
                                                        student.gender === 'L'
                                                            ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400'
                                                            : 'bg-pink-50 text-pink-600 dark:bg-pink-950/60 dark:text-pink-400'
                                                    }`}
                                                >
                                                    {student.gender === 'L' ? '♂' : '♀'}
                                                </div>
                                                <div className="overflow-hidden">
                                                    <h3 className="truncate text-base font-bold text-slate-900 dark:text-white" title={student.name}>
                                                        {student.name}
                                                    </h3>
                                                    <p className="font-mono text-xs text-slate-500 dark:text-slate-400">NISN: {student.nisn}</p>
                                                </div>
                                            </div>
                                            <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase ${getStatusBadge(student.status)}`}>
                                                {student.status}
                                            </span>
                                        </div>

                                        <div className="mt-4 flex flex-wrap items-center gap-2">
                                            <span className="rounded-md bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400">
                                                {student.class ? `Kelas ${student.class}` : 'Belum Kelas'}
                                            </span>
                                            <span className="rounded-md bg-slate-100 px-2 py-1 text-xs capitalize text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                                {student.student_type ? student.student_type.replace('_', ' ') : 'Umum'}
                                            </span>
                                            <span className="text-[11px] text-slate-400 ml-auto">
                                                Masuk {student.entry_year}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
                                        <Link href={getProfileRoute(student)} className="text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400">
                                            Buka Buku SPP →
                                        </Link>
                                        <div className="flex items-center gap-1">
                                            <Link href={route('siswa.edit', student.id)}>
                                                <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                                                    Edit
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-7 w-7 p-0 text-rose-600 hover:bg-rose-50"
                                                onClick={() => handleDelete(student.id, student.name)}
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Pagination Bar */}
                    <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-200/80 px-5 py-3.5 dark:border-slate-800/80 sm:flex-row">
                        <div className="flex items-center gap-2">
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Menampilkan <span className="font-semibold text-slate-700 dark:text-slate-200">{students.from || 0}</span> -{' '}
                                <span className="font-semibold text-slate-700 dark:text-slate-200">{students.to || 0}</span> dari{' '}
                                <span className="font-semibold text-slate-700 dark:text-slate-200">{students.total}</span> siswa
                            </p>
                            <Select
                                value={String(filters.per_page || students.per_page)}
                                onValueChange={(value) => applyFilters({ per_page: value, page: '1' })}
                            >
                                <SelectTrigger className="h-8 w-[70px] text-xs bg-white dark:bg-slate-900">
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
                            <div className="flex gap-1.5">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={students.current_page <= 1}
                                    onClick={() => applyFilters({ page: String(students.current_page - 1) })}
                                    className="h-8 text-xs"
                                >
                                    Sebelumnya
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={students.current_page >= students.last_page}
                                    onClick={() => applyFilters({ page: String(students.current_page + 1) })}
                                    className="h-8 text-xs"
                                >
                                    Selanjutnya
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Quick Add Slide-Over Drawer */}
            <Sheet open={isAddSheetOpen} onOpenChange={setIsAddSheetOpen}>
                <SheetContent className="w-full sm:max-w-xl overflow-y-auto max-h-screen p-6 shadow-2xl">
                    <SheetHeader className="pb-4 border-b border-slate-200/80 dark:border-slate-800">
                        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                            <UserPlus className="h-5 w-5" />
                            <SheetTitle className="text-xl font-bold">Tambah Siswa & Santri Baru</SheetTitle>
                        </div>
                        <SheetDescription className="text-xs text-slate-500">
                            {currentClassTab !== 'all' && currentClassTab !== 'none'
                                ? `Formulir akan otomatis menempatkan siswa ke Kelas ${currentClassTab}.`
                                : 'Lengkapi identitas siswa dan periode masuk untuk memulai pencatatan SPP.'}
                        </SheetDescription>
                    </SheetHeader>

                    <div className="mt-6">
                        <StudentForm
                            defaultClass={currentClassTab}
                            defaultStatus={currentStatusFilter === 'all' ? 'aktif' : currentStatusFilter}
                            isSheet={true}
                            onSuccess={() => setIsAddSheetOpen(false)}
                        />
                    </div>
                </SheetContent>
            </Sheet>
        </AppLayout>
    );
}
