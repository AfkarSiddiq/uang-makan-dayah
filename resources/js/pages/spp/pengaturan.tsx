import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { FileText, Pencil, Check, X, Users, Calendar, AlertCircle, PlusCircle } from 'lucide-react';
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

    const { data: editData, setData: setEditData, post: editPost, processing: editProcessing, reset: editReset, errors: editErrors, clearErrors: editClearErrors } = useForm({
        month: 0,
        year: 0,
        new_amount: 0,
    });

    const dbYears = useMemo(() => {
        // Jika database masih kosong, berikan tahun saat ini sebagai pijakan
        if (!ringkasanSPP || ringkasanSPP.length === 0) {
            return [new Date().getFullYear()];
        }
        
        // Ekstrak Tahun Ajaran dari database (Juli-Des = Tahun itu, Jan-Jun = Tahun sebelumnya)
        const years = ringkasanSPP.map(item => item.month >= 7 ? Number(item.year) : Number(item.year) - 1);
        
        // Hapus duplikat dan urutkan dari tahun terbaru ke terlama (Desc)
        return Array.from(new Set(years)).sort((a, b) => b - a);
    }, [ringkasanSPP]);

    // State untuk Filter Tabel (Otomatis terpilih ke tahun paling baru di database)
    const [selectedYear, setSelectedYear] = useState<number>(dbYears[0]);

    const displayedSPP: DisplayedMonth[] = useMemo(() => {
        const bulanAjaran = [7, 8, 9, 10, 11, 12, 1, 2, 3, 4, 5, 6];
        
        return bulanAjaran.map(monthNum => {
            const targetYear = monthNum >= 7 ? Number(selectedYear) : Number(selectedYear) + 1;
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

    const nextYearOptions = useMemo(() => {
        const latestYearInDb = dbYears[0];
        // Sistem menyarankan tahun terakhir di DB, dan 2 tahun ke depan
        return [latestYearInDb, latestYearInDb + 1, latestYearInDb + 2].sort((a, b) => a - b);
    }, [dbYears]);

    const { data: genData, setData: setGenData, post: genPost, processing: genProcessing } = useForm({
        start_year: dbYears[0] + 1, // Default langsung menyarankan tahun depannya
        base_amount: 500000,
    });

    
    // HELPER & HANDLER
    const getMonthName = (monthNumber: number) => {
        const date = new Date(2000, monthNumber - 1, 1);
        return date.toLocaleString('id-ID', { month: 'long' });
    };

    const formatRupiah = (angka: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(angka);
    };

    // --- Handler Edit ---
    const startEditing = (item: DisplayedMonth) => {
        editClearErrors(); 
        setEditingKey(`${item.month}-${item.year}`);
        setEditData({
            month: item.month,
            year: item.year,
            new_amount: item.current_amount,
        });
    };

    const submitEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (confirm(`Anda yakin ingin mengubah tagihan bulan ${getMonthName(editData.month)} ${editData.year} menjadi ${formatRupiah(editData.new_amount)} untuk SELURUH SISWA?`)) {
            editPost(route('spp.bulk_update'), {
                preserveScroll: true,
                onSuccess: () => {
                    setEditingKey(null);
                    editReset();
                },
            });
        }
    };

    const cancelEditing = () => {
        setEditingKey(null);
        editClearErrors();
        editReset();
    };

    // --- Handler Generate ---
    const handleGenerate = () => {
        if (confirm(`Generate tagihan master untuk Tahun Ajaran ${genData.start_year}/${genData.start_year + 1} dengan harga dasar Rp ${formatRupiah(genData.base_amount)}?`)) {
            genPost(route('spp.generate_tahun'), { 
                preserveScroll: true,
                onSuccess: () => {
                    // Opsional: Langsung ubah filter ke tahun yang baru digenerate
                    setSelectedYear(genData.start_year);
                }
            });
        }
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Dashboard', href: '/dashboard' },
            { title: 'Pengaturan SPP', href: '#' },
        ]}>
            <Head title="Pengaturan SPP Massal" />

            <div className="p-6 max-w-5xl mx-auto space-y-6">
                
                {/* Header Section */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <FileText className="w-6 h-6 text-indigo-600" /> Master Data SPP
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        Kelola nominal tagihan bulanan. Data di sini akan menjadi acuan saat siswa melakukan pembayaran.
                    </p>
                </div>

                {/* UX: Panel Generate Tahun Ajaran Baru */}
                <div className="bg-indigo-50 dark:bg-indigo-900/20 p-5 rounded-xl border border-indigo-100 dark:border-indigo-800 shadow-sm flex flex-col md:flex-row md:items-end gap-4">
                        <div className="flex-1">
                            <h2 className="text-sm font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-2 mb-1">
                                <PlusCircle className="w-4 h-4" /> Generate Tahun Ajaran Baru
                            </h2>
                            <p className="text-xs text-indigo-700 dark:text-indigo-400">
                                Buat otomatis 12 bulan (Juli - Juni) ke dalam database master.
                            </p>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row items-end gap-3">
                            <div>
                                <label className="text-xs font-semibold text-indigo-800 dark:text-indigo-300 block mb-1">Pilih Tahun Ajaran</label>
                                {/* SEKARANG MENJADI DROPDOWN DINAMIS */}
                                <select 
                                    value={genData.start_year}
                                    onChange={e => setGenData('start_year', parseInt(e.target.value))}
                                    className="w-full sm:w-auto rounded-md border-indigo-200 dark:border-indigo-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus:ring-indigo-500 font-medium"
                                >
                                    {nextYearOptions.map(year => (
                                        <option key={`gen-${year}`} value={year}>
                                            {year}/{year + 1}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-indigo-800 dark:text-indigo-300 block mb-1">Harga SPP (Rp)</label>
                                <input 
                                    type="number" 
                                    value={genData.base_amount}
                                    onChange={e => setGenData('base_amount', parseInt(e.target.value))}
                                    className="w-full sm:w-36 rounded-md border-indigo-200 dark:border-indigo-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus:ring-indigo-500"
                                />
                            </div>
                            <button 
                                onClick={handleGenerate}
                                disabled={genProcessing}
                                className="w-full sm:w-auto px-5 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition"
                            >
                                {genProcessing ? 'Memproses...' : 'Generate'}
                            </button>
                        </div>
                    </div>

                {/* Filter Tahun Data Tabel */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                        <Calendar className="w-5 h-5 text-indigo-500" />
                        <span>Filter Tabel Tahun Ajaran:</span>
                    </div>
                    
                    <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(Number(e.target.value))}
                        className="rounded-md border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-4 py-2 text-sm focus:ring-indigo-500 font-semibold text-indigo-700 dark:text-indigo-400 min-w-[200px]"
                    >
                        {dbYears.map(year => (
                            <option key={`opt-${year}`} value={year}>Tahun Ajaran {year}/{year + 1}</option>
                        ))}
                    </select>
                </div>

                {/* Tabel Master SPP */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-slate-50/80 dark:bg-slate-800/50 text-slate-500 border-b border-slate-200 dark:border-slate-800">
                            <tr>
                                <th className="px-6 py-4 font-medium">Bulan & Tahun</th>
                                <th className="px-6 py-4 font-medium">Status Data</th>
                                <th className="px-6 py-4 font-medium">Harga Master (Rp)</th>
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
                                                <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2.5 py-1 rounded-md text-xs font-semibold">
                                                    <Check className="w-3.5 h-3.5" /> Tersedia
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-slate-400 dark:text-slate-500 text-xs font-medium">
                                                    <AlertCircle className="w-3.5 h-3.5" /> Belum di-generate
                                                </span>
                                            )}
                                        </td>
                                        
                                        <td className="px-6 py-4">
                                            {isEditing ? (
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-slate-500 font-medium">Rp</span>
                                                        <input 
                                                            type="number" 
                                                            value={editData.new_amount}
                                                            onChange={e => setEditData('new_amount', parseInt(e.target.value) || 0)}
                                                            className={`w-32 rounded-md bg-white dark:bg-slate-950 px-3 py-1.5 text-sm dark:text-white ${editErrors.new_amount ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 dark:border-slate-700 focus:ring-indigo-500'}`}
                                                        />
                                                    </div>
                                                    {editErrors.new_amount && <span className="text-xs text-red-500">{editErrors.new_amount}</span>}
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
                                                    <button onClick={submitEdit} disabled={editProcessing} className="p-2 bg-emerald-100 text-emerald-700 rounded-md hover:bg-emerald-200 transition" title="Simpan">
                                                        <Check className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={cancelEditing} className="p-2 bg-rose-100 text-rose-700 rounded-md hover:bg-rose-200 transition" title="Batal">
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ) : (
                                                item.is_active && (
                                                    <button onClick={() => startEditing(item)} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-md hover:bg-slate-200 font-medium text-sm dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition">
                                                        <Pencil className="w-3.5 h-3.5" /> Ubah Harga
                                                    </button>
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