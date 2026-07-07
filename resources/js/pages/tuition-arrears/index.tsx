import { SearchInput } from '@/components/ui/search-input';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { AlertTriangle, ArrowLeft, Download, FileSpreadsheet, Search, User, Wallet, X, Check } from 'lucide-react';
import { useState } from 'react';

interface UnpaidMonth {
    id: number;
    month: number;
    year: number;
    month_name: string;
}

interface Student {
    id: number;
    name: string;
    nisn: string;
    class: number | null;
    gender: string;
    entry_month: number;
    entry_year: number;
    arrears_count: number;
    total_expected: number;
    paid_count: number;
    total_arrears: number;
    unpaid_months: UnpaidMonth[];
}

interface Props {
    students: Student[];
    summary: {
        total_students: number;
        total_arrears: number;
    };
    availableMonths: { id: number; month: number; year: number; label: string }[];
    selectedMonth: string | null;
}

export default function Index({ students, summary, availableMonths, selectedMonth }: Props) {
    const [search, setSearch] = useState('');
    const [selectedExportMonth, setSelectedExportMonth] = useState<string>('');
    const [showExportModal, setShowExportModal] = useState(false);
    
    // Filter State
    const [selectedClass, setSelectedClass] = useState<string>('all');
    const [selectedGender, setSelectedGender] = useState<string>('all'); // BARU: Filter Jenis Kelamin
    
    const [expandedStudent, setExpandedStudent] = useState<number | null>(null);

    // =========================================================================
    // STATE & FORM UNTUK MODAL PEMBAYARAN
    // =========================================================================
    const [paymentModal, setPaymentModal] = useState<{ isOpen: boolean; student: Student | null }>({ isOpen: false, student: null });
    const [displayAmount, setDisplayAmount] = useState<string>('0'); // State terpisah untuk tampilan Rupiah
    
    const { data: payData, setData: setPayData, post: payPost, processing: payProcessing, reset: payReset } = useForm({
        amount: 0,
    });

    // Helper untuk mengubah angka jadi format Rupiah (ex: 500000 -> "500.000")
    const formatNumberToRupiah = (value: number | string) => {
        const numberString = String(value).replace(/[^,\d]/g, '').toString();
        const split = numberString.split(',');
        const sisa = split[0].length % 3;
        let rupiah = split[0].substr(0, sisa);
        const ribuan = split[0].substr(sisa).match(/\d{3}/gi);

        if (ribuan) {
            const separator = sisa ? '.' : '';
            rupiah += separator + ribuan.join('.');
        }

        rupiah = split[1] != undefined ? rupiah + ',' + split[1] : rupiah;
        return rupiah;
    };

    // Handler saat user mengetik nominal di modal
    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\./g, ''); // Hilangkan titik dulu
        
        // Hilangkan angka 0 di depan jika user mulai mengetik angka lain
        if (value.length > 1 && value.startsWith('0')) {
            value = value.substring(1);
        }
        // Jika dihapus sampai habis, kembalikan ke 0
        if (value === '') {
            value = '0';
        }

        const numericValue = parseInt(value, 10);
        
        if (!isNaN(numericValue)) {
            setDisplayAmount(formatNumberToRupiah(numericValue));
            setPayData('amount', numericValue);
        }
    };

    const openPaymentModal = (student: Student) => {
        setPaymentModal({ isOpen: true, student });
        // Set ke default 0 (sesuai permintaan, angka awalan 0)
        setDisplayAmount('0');
        setPayData('amount', 0); 
    };

    const closePaymentModal = () => {
        setPaymentModal({ isOpen: false, student: null });
        setDisplayAmount('0');
        payReset();
    };

    const submitPayment = (e: React.FormEvent) => {
        e.preventDefault();
        if (paymentModal.student && payData.amount > 0) { // Pastikan nominal lebih dari 0
            // PERMINTAAN: Route disesuaikan menjadi /siswa/{id}/pay
            payPost(`/siswa/${paymentModal.student.id}/pay`, { 
                preserveScroll: true,
                onSuccess: () => {
                    closePaymentModal();
                },
            });
        }
    };
    // =========================================================================

    // Logika Filter (Ditambah Filter Gender)
    const filteredStudents = students.filter((student) => {
        const matchesSearch = student.name.toLowerCase().includes(search.toLowerCase()) ||
            student.nisn.includes(search);
        const matchesClass = selectedClass === 'all' || String(student.class) === selectedClass;
        const matchesGender = selectedGender === 'all' || student.gender === selectedGender;
        
        return matchesSearch && matchesClass && matchesGender;
    });

    const classes = [...new Set(students.map((s) => s.class).filter(Boolean))].sort((a, b) => a - b);

    const formatRupiahText = (angka: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(angka);
    };

    const toggleExpand = (id: number) => {
        setExpandedStudent(expandedStudent === id ? null : id);
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Tunggakan SPP', href: '/tuition-arrears' }]}>
            <Head title="Tunggakan SPP" />

            {/* MODAL PEMBAYARAN */}
            {paymentModal.isOpen && paymentModal.student && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                    <div className="w-full max-w-md rounded-2xl bg-white shadow-xl dark:bg-slate-900 overflow-hidden">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-6 py-4">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Wallet className="w-5 h-5 text-indigo-600" /> Terima Pembayaran
                            </h3>
                            <button onClick={closePaymentModal} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <form onSubmit={submitPayment} className="p-6">
                            <div className="mb-6 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                                <p className="text-sm text-slate-500 mb-1">Siswa</p>
                                <p className="font-semibold text-slate-900 dark:text-white">{paymentModal.student.name} <span className="text-sm font-normal text-slate-500">({paymentModal.student.nisn})</span></p>
                                
                                <div className="mt-3 flex justify-between items-center pt-3 border-t border-slate-200 dark:border-slate-700">
                                    <p className="text-sm text-slate-500">Total Tunggakan</p>
                                    <p className="font-bold text-rose-600 dark:text-rose-400">{formatRupiahText(paymentModal.student.total_arrears)}</p>
                                </div>
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Jumlah Uang Diterima (Rp)</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">Rp</span>
                                    {/* INPUT RUPIAH DINAMIS */}
                                    <input 
                                        type="text" 
                                        required
                                        value={displayAmount}
                                        onChange={handleAmountChange}
                                        className="w-full pl-12 pr-4 py-3 rounded-xl border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xl font-bold focus:ring-indigo-500 focus:border-indigo-500 dark:text-white text-right tracking-wider"
                                    />
                                </div>
                                <div className="flex justify-between items-center mt-2">
                                    <p className="text-xs text-slate-500">
                                        *Sistem akan melunasi bulan tertua lebih dulu.
                                    </p>
                                    {/* Tombol Cepat: Lunas Semua */}
                                    <button 
                                        type="button"
                                        onClick={() => {
                                            setDisplayAmount(formatNumberToRupiah(paymentModal.student!.total_arrears));
                                            setPayData('amount', paymentModal.student!.total_arrears);
                                        }}
                                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                                    >
                                        Isi Lunas Semua
                                    </button>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3">
                                <button type="button" onClick={closePaymentModal} className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition">
                                    Batal
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={payProcessing || payData.amount <= 0} 
                                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition"
                                >
                                    <Check className="w-4 h-4" /> {payProcessing ? 'Memproses...' : 'Proses Pembayaran'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <a href="/dashboard">
                            <button className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800">
                                <ArrowLeft className="h-5 w-5" />
                            </button>
                        </a>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Tunggakan SPP</h1>
                            <p className="text-sm text-slate-500">Daftar siswa dengan tunggakan pembayaran SPP</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => window.open('/tuition-arrears/export-all', '_blank')}
                            className="flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                        >
                            <Download className="h-4 w-4" />
                            <span className="hidden sm:inline">Export Semua</span>
                        </button>
                        <button
                            onClick={() => setShowExportModal(true)}
                            className="flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                        >
                            <FileSpreadsheet className="h-4 w-4" />
                            <span className="hidden sm:inline">Export per Bulan</span>
                        </button>
                    </div>
                </div>

                {showExportModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                        <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg dark:bg-slate-900">
                            <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Export Tunggakan per Bulan</h3>
                            <select
                                className="mb-4 w-full rounded-lg border border-slate-300 px-4 py-2 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                                value={selectedExportMonth}
                                onChange={(e) => setSelectedExportMonth(e.target.value)}
                            >
                                <option value="">Pilih Bulan</option>
                                {availableMonths.map((m) => (
                                    <option key={m.id} value={m.id}>
                                        {m.label}
                                    </option>
                                ))}
                            </select>
                            <div className="flex justify-end gap-2">
                                <button
                                    onClick={() => setShowExportModal(false)}
                                    className="rounded-lg px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={() => {
                                        if (selectedExportMonth) {
                                            window.open(`/tuition-arrears/export-month?spp_month_id=${selectedExportMonth}`, '_blank');
                                            setShowExportModal(false);
                                        }
                                    }}
                                    disabled={!selectedExportMonth}
                                    className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Export
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="rounded-xl border border-rose-200 bg-rose-50 p-5 dark:border-rose-900 dark:bg-rose-950/30">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-900/50">
                                <User className="h-5 w-5 text-rose-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-rose-600 dark:text-rose-400">Total Siswa Menunggak</p>
                                <p className="text-2xl font-bold text-rose-700 dark:text-rose-300">{summary.total_students}</p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-900 dark:bg-amber-950/30">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/50">
                                <Wallet className="h-5 w-5 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-amber-600 dark:text-amber-400">Total Tunggakan</p>
                                <p className="text-xl font-bold text-amber-700 dark:text-amber-300">{formatRupiahText(summary.total_arrears)}</p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-800">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700">
                                <AlertTriangle className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Rata-rata Tunggakan</p>
                                <p className="text-xl font-bold text-slate-700 dark:text-slate-300">
                                    {summary.total_students > 0 ? formatRupiahText(Math.round(summary.total_arrears / summary.total_students)) : 'Rp 0'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                    <div className="relative flex-1">
                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Cari nama atau NISN..."
                            className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-4 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    {/* FILTER KELAS */}
                    <select
                        className="rounded-lg border border-slate-300 px-4 py-2 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                        value={selectedClass}
                        onChange={(e) => setSelectedClass(e.target.value)}
                    >
                        <option value="all">Semua Kelas</option>
                        {classes.map((cls) => (
                            <option key={cls} value={String(cls)}>
                                Kelas {cls}
                            </option>
                        ))}
                    </select>
                    {/* FILTER JENIS KELAMIN */}
                    <select
                        className="rounded-lg border border-slate-300 px-4 py-2 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                        value={selectedGender}
                        onChange={(e) => setSelectedGender(e.target.value)}
                    >
                        <option value="all">Semua Gender</option>
                        <option value="L">Laki-laki (Putra)</option>
                        <option value="P">Perempuan (Putri)</option>
                    </select>
                </div>

                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <div className="overflow-x-auto">
                        <table className="w-full whitespace-nowrap min-w-[800px]">
                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/50">
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Siswa</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase text-slate-500">Kelas / Gender</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase text-slate-500">Tunggakan</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-slate-500">Total</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase text-slate-500">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {filteredStudents.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                                            {students.length === 0 ? 'Tidak ada data tunggakan' : 'Tidak ada siswa yang cocok dengan pencarian/filter'}
                                        </td>
                                    </tr>
                                ) : (
                                    filteredStudents.map((student) => (
                                        <>
                                            <tr key={student.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                <td className="px-4 py-3">
                                                    <div>
                                                        <p className="font-medium text-slate-900 dark:text-white truncate max-w-[250px]">{student.name}</p>
                                                        <p className="text-sm text-slate-500">NISN: {student.nisn}</p>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <div className="flex flex-col items-center gap-1">
                                                        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                                            {student.class ? `Kelas ${student.class}` : '-'}
                                                        </span>
                                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${student.gender === 'L' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30' : 'bg-pink-50 text-pink-600 dark:bg-pink-900/30'}`}>
                                                            {student.gender === 'L' ? 'Putra' : 'Putri'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className="rounded-full bg-rose-100 px-2 py-1 text-sm font-bold text-rose-700 dark:bg-rose-900/50 dark:text-rose-400">
                                                        {student.arrears_count} bulan
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <span className="font-bold text-rose-600 dark:text-rose-400">
                                                        {formatRupiahText(student.total_arrears)}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <button
                                                        onClick={() => toggleExpand(student.id)}
                                                        className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${expandedStudent === student.id ? 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-white' : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'}`}
                                                    >
                                                        {expandedStudent === student.id ? 'Tutup' : 'Lihat Detail'}
                                                    </button>
                                                </td>
                                            </tr>
                                            {expandedStudent === student.id && (
                                                <tr>
                                                    <td colSpan={5} className="bg-slate-50/50 px-4 py-4 dark:bg-slate-800/20">
                                                        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900 ml-8 border-l-4 border-l-rose-500">
                                                            <h4 className="mb-3 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                                                <AlertTriangle className="w-4 h-4 text-rose-500" /> Rincian Bulan Menunggak:
                                                            </h4>
                                                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                                                                {student.unpaid_months.map((month) => (
                                                                    <div
                                                                        key={month.id}
                                                                        className="rounded-lg border border-rose-100 bg-rose-50 px-3 py-2 text-sm dark:border-rose-900/50 dark:bg-rose-950/30 flex justify-between items-center"
                                                                    >
                                                                        <span className="font-semibold text-rose-900 dark:text-rose-300">{month.month_name}</span>
                                                                        <span className="text-rose-700/70 dark:text-rose-400/80 text-xs font-bold bg-white/50 dark:bg-black/20 px-1.5 rounded"> {month.year}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                            <div className="mt-5 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800 pt-4">
                                                                <a
                                                                    href={`/siswa/${student.id}`}
                                                                    className="flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800 transition"
                                                                >
                                                                    <User className="w-4 h-4" /> Profil Siswa
                                                                </a>
                                                                <button
                                                                    onClick={() => openPaymentModal(student)}
                                                                    className="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700 shadow-sm transition transform active:scale-95"
                                                                >
                                                                    <Wallet className="w-4 h-4" /> Bayar Sekarang
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}