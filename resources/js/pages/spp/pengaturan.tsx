import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { FileText, Pencil, Check, X, Users, Calendar, AlertCircle } from 'lucide-react';
import { useState, useMemo } from 'react';

// 1. Interface bawaan dari Database
interface RingkasanSPP {
    month: number;
    year: number;
    current_amount: number;
    total_siswa: number;
}

// 2. Interface khusus untuk Baris Tabel yang ditampilkan
interface DisplayedMonth {
    month: number;
    year: number;
    current_amount: number;
    total_siswa: number;
    is_active: boolean;
}

interface Props {
    ringkasanSPP: RingkasanSPP[];
}

export default function Pengaturan({ ringkasanSPP }: Props) {
    const [editingKey, setEditingKey] = useState<string | null>(null);

    const { data, setData, post, processing, reset, errors, clearErrors } = useForm({
        month: 0,
        year: 0,
        new_amount: 0,
    });

    // =========================================================================
    // PERBAIKAN BUG: MEMAKSA SEMUA TAHUN MENJADI ANGKA (NUMBER)
    // =========================================================================
    
    const availableYears = useMemo(() => {
        // PERBAIKAN: Gunakan Number() agar "2025" (string) jadi 2025 (angka)
        const dbYears = ringkasanSPP.map(item => item.month >= 7 ? Number(item.year) : Number(item.year) - 1);
        
        const currentYear = new Date().getFullYear();
        const baseYears = [currentYear - 1, currentYear, currentYear + 1, currentYear + 2];
        
        // Gabungkan, pastikan semua elemen adalah angka, hapus duplikat, dan urutkan
        return Array.from(new Set([...dbYears, ...baseYears])).map(Number).sort((a, b) => b - a);
    }, [ringkasanSPP]);

    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

    const displayedSPP: DisplayedMonth[] = useMemo(() => {
        const bulanAjaran = [7, 8, 9, 10, 11, 12, 1, 2, 3, 4, 5, 6];
        
        return bulanAjaran.map(monthNum => {
            // PERBAIKAN: Pastikan targetYear adalah matematika, bukan teks yang ditempel
            const targetYear = monthNum >= 7 ? Number(selectedYear) : Number(selectedYear) + 1;
            
            // PERBAIKAN: Pencocokan database menggunakan Number() agar tipe datanya sama
            const dataDb = ringkasanSPP.find(item => Number(item.month) === monthNum && Number(item.year) === targetYear);

            return {
                month: monthNum,
                year: targetYear,
                current_amount: dataDb ? dataDb.current_amount : 0,
                total_siswa: dataDb ? dataDb.total_siswa : 0,
                is_active: Boolean(dataDb)
            };
        });
    }, [ringkasanSPP, selectedYear]);

    // =========================================================================

    const getMonthName = (monthNumber: number) => {
        const date = new Date();
        date.setMonth(monthNumber - 1);
        return date.toLocaleString('id-ID', { month: 'long' });
    };

    const formatRupiah = (angka: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(angka);
    };

    const startEditing = (item: DisplayedMonth) => {
        clearErrors(); 
        setEditingKey(`${item.month}-${item.year}`);
        setData({
            month: item.month,
            year: item.year,
            new_amount: item.current_amount,
        });
    };

    const submitEdit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (confirm(`Anda yakin ingin mengubah tagihan bulan ${getMonthName(data.month)} ${data.year} menjadi ${formatRupiah(data.new_amount)} untuk SELURUH SISWA?`)) {
            post(route('spp.bulk_update'), {
                preserveScroll: true,
                onSuccess: () => {
                    setEditingKey(null);
                    reset();
                },
            });
        }
    };

    const cancelEditing = () => {
        setEditingKey(null);
        clearErrors();
        reset();
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Dashboard', href: '/dashboard' },
            { title: 'Pengaturan SPP', href: '#' },
        ]}>
            <Head title="Pengaturan SPP Massal" />

            <div className="p-6 max-w-5xl mx-auto space-y-6">
                
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <FileText className="w-6 h-6 text-indigo-600" /> Master Data SPP
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        Kelola nominal tagihan bulanan untuk seluruh siswa.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                        <Calendar className="w-5 h-5 text-indigo-500" />
                        <span>Filter Tahun Ajaran:</span>
                    </div>
                    
                    <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(Number(e.target.value))}
                        className="rounded-md border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-4 py-2 text-sm focus:ring-indigo-500 font-semibold text-indigo-700 dark:text-indigo-400 min-w-[200px]"
                    >
                        {availableYears.map(year => (
                            <option key={`opt-${year}`} value={year}>Tahun Ajaran {year}/{year + 1}</option>
                        ))}
                    </select>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-slate-50/80 dark:bg-slate-800/50 text-slate-500 border-b border-slate-200 dark:border-slate-800">
                            <tr>
                                <th className="px-6 py-4 font-medium">Bulan & Tahun</th>
                                <th className="px-6 py-4 font-medium">Tagihan Beredar</th>
                                <th className="px-6 py-4 font-medium">Nominal (Per Siswa)</th>
                                <th className="px-6 py-4 font-medium text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                            {displayedSPP.map((item) => {
                                const key = `${item.month}-${item.year}`;
                                const isEditing = editingKey === key;

                                return (
                                    <tr key={key} className={`transition-colors ${item.is_active ? 'hover:bg-slate-50 dark:hover:bg-slate-800/30' : 'bg-slate-50/50 dark:bg-slate-900/50 opacity-75'}`}>
                                        <td className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-200">
                                            {getMonthName(item.month)} {item.year}
                                        </td>
                                        
                                        <td className="px-6 py-4">
                                            {item.is_active ? (
                                                <span className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-400">
                                                    <Users className="w-4 h-4" /> {item.total_siswa} Siswa
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-slate-400 dark:text-slate-500 text-xs">
                                                    <AlertCircle className="w-4 h-4" /> Belum ada data
                                                </span>
                                            )}
                                        </td>
                                        
                                        <td className="px-6 py-4">
                                            {isEditing ? (
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-slate-500">Rp</span>
                                                        <input 
                                                            type="number" 
                                                            value={data.new_amount}
                                                            onChange={e => setData('new_amount', parseInt(e.target.value) || 0)}
                                                            className={`w-32 rounded-md bg-white dark:bg-slate-950 px-3 py-1.5 text-sm dark:text-white ${errors.new_amount ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 dark:border-slate-700 focus:ring-indigo-500'}`}
                                                        />
                                                    </div>
                                                    {errors.new_amount && <span className="text-xs text-red-500">{errors.new_amount}</span>}
                                                </div>
                                            ) : (
                                                <span className={`font-medium ${item.is_active ? 'text-slate-900 dark:text-slate-300' : 'text-slate-400 dark:text-slate-600'}`}>
                                                    {item.is_active ? formatRupiah(item.current_amount) : '-'}
                                                </span>
                                            )}
                                        </td>

                                        <td className="px-6 py-4 text-right">
                                            {isEditing ? (
                                                <div className="flex items-center justify-end gap-2">
                                                    <button onClick={submitEdit} disabled={processing} className="p-2 bg-emerald-100 text-emerald-700 rounded-md hover:bg-emerald-200 transition">
                                                        <Check className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={cancelEditing} className="p-2 bg-rose-100 text-rose-700 rounded-md hover:bg-rose-200 transition">
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ) : (
                                                item.is_active ? (
                                                    <button onClick={() => startEditing(item)} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-md hover:bg-indigo-100 font-medium text-sm dark:bg-indigo-900/30 dark:text-indigo-400 transition">
                                                        <Pencil className="w-3.5 h-3.5" /> Ubah Harga
                                                    </button>
                                                ) : (
                                                    <span className="text-xs text-slate-400 dark:text-slate-500 italic">
                                                        Belum digenerate
                                                    </span>
                                                )
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

            </div>
        </AppLayout>
    );
}