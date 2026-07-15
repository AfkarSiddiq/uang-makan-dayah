import AppLayout from '@/layouts/app-layout';
import { formatNumberToRupiah, parseRupiahToNumber } from '@/lib/utils';
import { Head, useForm } from '@inertiajs/react';
import { FileText, Pencil, Check, X, Calendar, AlertCircle, PlusCircle } from 'lucide-react';
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
    const [isGenerateModalOpen, setIsGenerateModalOpen] = useState<boolean>(false);

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

    const generateYearOptions = useMemo(() => {
        const currentYear = new Date().getFullYear();
        const minYear = dbYears.length > 0 ? Math.min(...dbYears, currentYear) - 1 : currentYear - 1;
        const maxYear = dbYears.length > 0 ? Math.max(...dbYears, currentYear) + 3 : currentYear + 3;

        const options = [];
        for (let y = minYear; y <= maxYear; y++) {
            // Cek apakah tahun ini sudah ter-generate di database (minimal 1 bulan)
            const isGenerated = ringkasanSPP.some(
                item => (item.month >= 7 && Number(item.year) === y) || (item.month < 7 && Number(item.year) === y + 1)
            );
            options.push({
                year: y,
                label: `${y}/${y + 1}`,
                isGenerated
            });
        }
        return options;
    }, [dbYears, ringkasanSPP]);

    const firstNewYear = useMemo(() => {
        return generateYearOptions.find(opt => !opt.isGenerated)?.year || (dbYears[0] ? dbYears[0] + 1 : new Date().getFullYear());
    }, [generateYearOptions, dbYears]);

    const { data: genData, setData: setGenData, post: genPost, processing: genProcessing } = useForm({
        start_year: firstNewYear,
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
    const openGenerateModal = () => {
        const targetYear = generateYearOptions.find(opt => !opt.isGenerated)?.year || (dbYears[0] ? dbYears[0] + 1 : new Date().getFullYear());
        setGenData('start_year', targetYear);
        setIsGenerateModalOpen(true);
    };

    const handleGenerate = (e: React.FormEvent) => {
        e.preventDefault();
        if (confirm(`Generate tagihan master untuk Tahun Ajaran ${genData.start_year}/${genData.start_year + 1} dengan harga dasar Rp ${formatRupiah(genData.base_amount)}?`)) {
            genPost(route('spp.generate_tahun'), { 
                preserveScroll: true,
                onSuccess: () => {
                    setSelectedYear(genData.start_year);
                    setIsGenerateModalOpen(false);
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
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <FileText className="w-6 h-6 text-indigo-600" /> Master Data SPP
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">
                            Kelola nominal tagihan bulanan. Data di sini akan menjadi acuan saat siswa melakukan pembayaran.
                        </p>
                    </div>
                    <button
                        onClick={openGenerateModal}
                        type="button"
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm shadow-sm transition transform active:scale-95 flex-shrink-0"
                    >
                        <PlusCircle className="w-4 h-4" />
                        <span>Generate Tahun Ajaran</span>
                    </button>
                </div>

                {/* Filter Tahun Data Tabel */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                        <Calendar className="w-5 h-5 text-indigo-500" />
                        <span>Filter Tabel Tahun Ajaran:</span>
                    </div>
                    
                    <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(Number(e.target.value))}
                        className="w-full sm:w-auto rounded-md border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-4 py-2 text-sm focus:ring-indigo-500 font-semibold text-indigo-700 dark:text-indigo-400 min-w-[200px]"
                    >
                        {dbYears.map(year => (
                            <option key={`opt-${year}`} value={year}>Tahun Ajaran {year}/{year + 1}</option>
                        ))}
                    </select>
                </div>

                {/* Tabel Master SPP - Desktop View */}
                <div className="hidden md:block bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden overflow-x-auto">
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
                                                            type="text" 
                                                            inputMode="numeric"
                                                            value={formatNumberToRupiah(editData.new_amount)}
                                                            onChange={e => setEditData('new_amount', parseRupiahToNumber(e.target.value))}
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

                {/* Tabel Master SPP - Mobile Card View */}
                <div className="md:hidden space-y-3">
                    {displayedSPP.map((item) => {
                        const key = `${item.month}-${item.year}`;
                        const isEditing = editingKey === key;

                        return (
                            <div 
                                key={key} 
                                className={`p-4 rounded-xl border transition-all shadow-sm bg-white dark:bg-slate-900 ${
                                    item.is_active 
                                        ? 'border-slate-200 dark:border-slate-800' 
                                        : 'border-dashed border-slate-300 dark:border-slate-700 opacity-75 bg-slate-50/50 dark:bg-slate-900/50'
                                }`}
                            >
                                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80 mb-3">
                                    <span className="font-bold text-slate-900 dark:text-slate-100 text-base">
                                        {getMonthName(item.month)} {item.year}
                                    </span>
                                    {item.is_active ? (
                                        <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2.5 py-1 rounded-md text-xs font-semibold">
                                            <Check className="w-3.5 h-3.5" /> Tersedia
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 text-slate-400 dark:text-slate-500 text-xs font-medium">
                                            <AlertCircle className="w-3.5 h-3.5" /> Belum di-generate
                                        </span>
                                    )}
                                </div>

                                <div className="space-y-3">
                                    {isEditing ? (
                                        <div className="space-y-2 bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                                            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block">Harga Baru (Rp):</label>
                                            <div className="flex items-center gap-2">
                                                <span className="text-slate-500 font-medium text-sm">Rp</span>
                                                <input 
                                                    type="text" 
                                                    inputMode="numeric"
                                                    value={formatNumberToRupiah(editData.new_amount)}
                                                    onChange={e => setEditData('new_amount', parseRupiahToNumber(e.target.value))}
                                                    className={`w-full rounded-md bg-white dark:bg-slate-900 px-3 py-2 text-sm font-semibold dark:text-white ${editErrors.new_amount ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 dark:border-slate-700 focus:ring-indigo-500'}`}
                                                />
                                            </div>
                                            {editErrors.new_amount && <span className="text-xs text-red-500 block">{editErrors.new_amount}</span>}
                                            <div className="flex items-center justify-end gap-2 pt-1">
                                                <button onClick={cancelEditing} className="flex-1 py-1.5 px-3 bg-slate-200 text-slate-700 rounded-md hover:bg-slate-300 transition text-xs font-medium dark:bg-slate-800 dark:text-slate-300 flex items-center justify-center gap-1">
                                                    <X className="w-3.5 h-3.5" /> Batal
                                                </button>
                                                <button onClick={submitEdit} disabled={editProcessing} className="flex-1 py-1.5 px-3 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition text-xs font-medium flex items-center justify-center gap-1">
                                                    <Check className="w-3.5 h-3.5" /> Simpan
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <span className="text-xs text-slate-500 dark:text-slate-400 block mb-0.5">Harga Master SPP:</span>
                                                <span className={`text-base font-bold ${item.is_active ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-600'}`}>
                                                    {item.is_active ? formatRupiah(item.current_amount) : '-'}
                                                </span>
                                            </div>

                                            {item.is_active && (
                                                <button onClick={() => startEditing(item)} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 font-medium text-xs dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition shadow-sm">
                                                    <Pencil className="w-3.5 h-3.5 text-indigo-500" /> Ubah Harga
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

            </div>

            {/* Modal Generate Tahun Ajaran Baru */}
            {isGenerateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                            <div className="flex items-center gap-2.5">
                                <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl text-indigo-600 dark:text-indigo-400">
                                    <PlusCircle className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Generate Tahun Ajaran</h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Buat otomatis 12 tagihan bulanan master</p>
                                </div>
                            </div>
                            <button 
                                type="button"
                                onClick={() => setIsGenerateModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg transition"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleGenerate} className="space-y-4">
                            <div>
                                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                                    Pilih Tahun Ajaran <span className="text-red-500">*</span>
                                </label>
                                <select 
                                    value={genData.start_year}
                                    onChange={e => setGenData('start_year', parseInt(e.target.value))}
                                    className="w-full rounded-xl border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-4 py-3 text-sm focus:ring-indigo-500 focus:border-indigo-500 font-semibold text-slate-900 dark:text-white"
                                    required
                                >
                                    {generateYearOptions.map(opt => (
                                        <option key={`modal-gen-${opt.year}`} value={opt.year}>
                                            Tahun Ajaran {opt.label} {opt.isGenerated ? '— (Sudah Ada Data)' : '— (Baru / Rekomendasi)'}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                                    Harga SPP per Bulan (Rp) <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-semibold text-sm">Rp</span>
                                    <input 
                                        type="text" 
                                        inputMode="numeric"
                                        required
                                        value={formatNumberToRupiah(genData.base_amount)}
                                        onChange={e => setGenData('base_amount', parseRupiahToNumber(e.target.value))}
                                        className="w-full pl-12 pr-4 py-3 rounded-xl border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-base font-bold focus:ring-indigo-500 focus:border-indigo-500 dark:text-white"
                                        placeholder="0"
                                    />
                                </div>
                            </div>

                            {/* Dynamic Info Box */}
                            {(() => {
                                const selectedOpt = generateYearOptions.find(o => o.year === genData.start_year);
                                if (selectedOpt?.isGenerated) {
                                    return (
                                        <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-300">
                                            <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                                            <div>
                                                <p className="font-semibold">Tahun Ajaran ini sudah memiliki data master.</p>
                                                <p className="mt-0.5 opacity-90">Jika digenerate ulang, bulan yang belum ada akan ditambahkan dan bulan yang sudah tersedia tidak akan tertimpa/rusak.</p>
                                            </div>
                                        </div>
                                    );
                                }
                                return (
                                    <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-xl flex items-start gap-2.5 text-xs text-indigo-800 dark:text-indigo-300">
                                        <PlusCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-semibold">Tahun Ajaran Baru (Rekomendasi)</p>
                                            <p className="mt-0.5 opacity-90">Sistem akan otomatis membuat 12 bulan tagihan (Juli {genData.start_year} - Juni {genData.start_year + 1}) dengan nominal Rp {formatNumberToRupiah(genData.base_amount)}.</p>
                                        </div>
                                    </div>
                                );
                            })()}

                            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                                <button 
                                    type="button"
                                    onClick={() => setIsGenerateModalOpen(false)}
                                    className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                                >
                                    Batal
                                </button>
                                <button 
                                    type="submit"
                                    disabled={genProcessing}
                                    className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-sm transition disabled:opacity-50 flex items-center gap-2"
                                >
                                    {genProcessing ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            <span>Memproses...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Check className="w-4 h-4" />
                                            <span>Generate Master Data</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}