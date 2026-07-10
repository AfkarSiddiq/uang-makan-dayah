import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { AlertTriangle, ArrowLeft, Download, FileSpreadsheet, Search, User, Wallet, X, Check, GraduationCap, Users, BookOpen, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import React, { useState, Fragment } from 'react';

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
    class: number | string | null;
    gender: string;
    status: string;
    entry_month: number;
    entry_year: number;
    arrears_count: number;
    total_arrears: number;
    unpaid_months: UnpaidMonth[];
}

interface Props {
    students: Student[];
    summary: {
        total_students: number;
        total_arrears: number;
        active_students_count?: number;
        inactive_students_count?: number;
    };
    availableMonths: { id: number; month: number; year: number; label: string }[];
    selectedMonth: string | null;
}

export default function Index({ students, summary, availableMonths, selectedMonth }: Props) {
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState<'active' | 'inactive'>('active');
    
    // Filter State
    const [selectedClass, setSelectedClass] = useState<string>('all');
    const [selectedGender, setSelectedGender] = useState<string>('all');
    const [selectedInactiveStatus, setSelectedInactiveStatus] = useState<string>('all');
    
    const [expandedStudent, setExpandedStudent] = useState<number | null>(null);

    // Dynamic Collapsible Sections State (bisa ditutup/buka dinamis)
    const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

    const toggleSectionCollapse = (key: string) => {
        setCollapsedSections((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    // =========================================================================
    // STATE & FORM UNTUK EXPORT MODAL
    // =========================================================================
    const [showExportModal, setShowExportModal] = useState(false);
    const [exportCategory, setExportCategory] = useState<'all' | 'class' | 'month'>('all');
    const [exportStatus, setExportStatus] = useState<'all' | 'active' | 'inactive'>('all');
    const [exportClass, setExportClass] = useState<string>('1');
    const [exportMonthId, setExportMonthId] = useState<string>('');

    // =========================================================================
    // STATE & FORM UNTUK MODAL PEMBAYARAN
    // =========================================================================
    const [paymentModal, setPaymentModal] = useState<{ isOpen: boolean; student: Student | null }>({ isOpen: false, student: null });
    const [displayAmount, setDisplayAmount] = useState<string>('0');
    
    const { data: payData, setData: setPayData, post: payPost, processing: payProcessing, reset: payReset } = useForm({
        amount: 0,
    });

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

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\./g, '');
        if (value.length > 1 && value.startsWith('0')) {
            value = value.substring(1);
        }
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
        if (paymentModal.student && payData.amount > 0) {
            payPost(`/siswa/${paymentModal.student.id}/pay`, { 
                preserveScroll: true,
                onSuccess: () => {
                    closePaymentModal();
                },
            });
        }
    };

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

    const handleExportSubmit = () => {
        if (exportCategory === 'all') {
            window.open(`/tuition-arrears/export-all?status=${exportStatus}`, '_blank');
        } else if (exportCategory === 'class') {
            const classParam = exportClass || 'all';
            const statusParam = exportStatus === 'all' ? 'aktif' : (exportStatus === 'active' ? 'aktif' : 'nonaktif');
            window.open(`/tuition-arrears/export-class?class=${classParam}&status=${statusParam}`, '_blank');
        } else if (exportCategory === 'month') {
            if (exportMonthId) {
                window.open(`/tuition-arrears/export-month?spp_month_id=${exportMonthId}&status=${exportStatus}`, '_blank');
            }
        }
        setShowExportModal(false);
    };

    // Filter students for Active vs Inactive Tab
    const filteredTabStudents = students.filter((student) => {
        const matchesSearch = student.name.toLowerCase().includes(search.toLowerCase()) ||
            student.nisn.includes(search);
        const matchesGender = selectedGender === 'all' || student.gender === selectedGender;
        
        if (activeTab === 'active') {
            const matchesTab = student.status === 'aktif';
            const matchesClass = selectedClass === 'all' || String(student.class) === selectedClass;
            return matchesTab && matchesSearch && matchesGender && matchesClass;
        } else {
            const matchesTab = student.status !== 'aktif';
            const matchesStatus = selectedInactiveStatus === 'all' || student.status === selectedInactiveStatus;
            return matchesTab && matchesSearch && matchesGender && matchesStatus;
        }
    });

    // Grouping Active Students by Class for informative per-class display
    const activeClassesList = ['1', '2', '3', '4', '5', '6'];
    const getStudentsByClass = (cls: string) => {
        return filteredTabStudents.filter((s) => String(s.class) === cls);
    };

    // Grouping Inactive Students by Status
    const inactiveStatusList = [
        { key: 'lulus', label: 'Alumni / Lulus', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300', icon: GraduationCap },
        { key: 'pindah', label: 'Pindah Sekolah', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300', icon: Clock },
        { key: 'berhenti', label: 'Berhenti / Keluar', color: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300', icon: X },
    ];

    const getStudentsByInactiveStatus = (statusKey: string) => {
        return filteredTabStudents.filter((s) => s.status === statusKey);
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Tunggakan SPP', href: '/tuition-arrears' }]}>
            <Head title="Tunggakan SPP" />

            {/* MODAL PEMBAYARAN */}
            {paymentModal.isOpen && paymentModal.student && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                    <div className="w-full max-w-md rounded-2xl bg-white shadow-xl dark:bg-slate-900 overflow-hidden border border-slate-200 dark:border-slate-800">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-6 py-4 bg-slate-50/50 dark:bg-slate-800/50">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Wallet className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> Terima Pembayaran
                            </h3>
                            <button onClick={closePaymentModal} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <form onSubmit={submitPayment} className="p-6">
                            <div className="mb-6 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Siswa</p>
                                        <p className="font-bold text-slate-900 dark:text-white text-base">{paymentModal.student.name}</p>
                                        <p className="text-xs text-slate-500">NISN: {paymentModal.student.nisn} {paymentModal.student.class ? `• Kelas ${paymentModal.student.class}` : ''}</p>
                                    </div>
                                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${paymentModal.student.status === 'aktif' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300'}`}>
                                        {paymentModal.student.status.toUpperCase()}
                                    </span>
                                </div>
                                
                                <div className="mt-3 flex justify-between items-center pt-3 border-t border-slate-200 dark:border-slate-700">
                                    <p className="text-sm text-slate-600 dark:text-slate-400">Total Tunggakan ({paymentModal.student.arrears_count} bulan)</p>
                                    <p className="font-bold text-rose-600 dark:text-rose-400 text-base">{formatRupiahText(paymentModal.student.total_arrears)}</p>
                                </div>
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Jumlah Uang Diterima (Rp)</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">Rp</span>
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

            {/* MODAL EXPORT DATA */}
            {showExportModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                    <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-5">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <FileSpreadsheet className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> Export Data Tunggakan SPP
                            </h3>
                            <button onClick={() => setShowExportModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">1. Pilih Kategori Export</label>
                                <div className="grid grid-cols-3 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setExportCategory('all')}
                                        className={`px-4 py-3 rounded-xl border text-sm font-medium transition flex flex-col items-center gap-1.5 ${exportCategory === 'all' ? 'border-indigo-600 bg-indigo-50/80 text-indigo-700 dark:border-indigo-500 dark:bg-indigo-950/40 dark:text-indigo-300' : 'border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'}`}
                                    >
                                        <Users className="w-5 h-5" />
                                        <span>Semua Siswa</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setExportCategory('class')}
                                        className={`px-4 py-3 rounded-xl border text-sm font-medium transition flex flex-col items-center gap-1.5 ${exportCategory === 'class' ? 'border-indigo-600 bg-indigo-50/80 text-indigo-700 dark:border-indigo-500 dark:bg-indigo-950/40 dark:text-indigo-300' : 'border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'}`}
                                    >
                                        <BookOpen className="w-5 h-5" />
                                        <span>Per Kelas</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setExportCategory('month')}
                                        className={`px-4 py-3 rounded-xl border text-sm font-medium transition flex flex-col items-center gap-1.5 ${exportCategory === 'month' ? 'border-indigo-600 bg-indigo-50/80 text-indigo-700 dark:border-indigo-500 dark:bg-indigo-950/40 dark:text-indigo-300' : 'border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'}`}
                                    >
                                        <Clock className="w-5 h-5" />
                                        <span>Per Bulan</span>
                                    </button>
                                </div>
                            </div>

                            {exportCategory === 'class' && (
                                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-3">
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Pilih Kelas yang Ingin Di-export</label>
                                    <select
                                        className="w-full rounded-xl border border-slate-300 px-4 py-2.5 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                                        value={exportClass}
                                        onChange={(e) => setExportClass(e.target.value)}
                                    >
                                        <option value="all">Semua Kelas</option>
                                        <option value="1">Kelas 1</option>
                                        <option value="2">Kelas 2</option>
                                        <option value="3">Kelas 3</option>
                                        <option value="4">Kelas 4</option>
                                        <option value="5">Kelas 5</option>
                                        <option value="6">Kelas 6</option>
                                    </select>
                                </div>
                            )}

                            {exportCategory === 'month' && (
                                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-3">
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Pilih Bulan Tagihan SPP</label>
                                    <select
                                        className="w-full rounded-xl border border-slate-300 px-4 py-2.5 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                                        value={exportMonthId}
                                        onChange={(e) => setExportMonthId(e.target.value)}
                                    >
                                        <option value="">-- Pilih Bulan --</option>
                                        {availableMonths.map((m) => (
                                            <option key={m.id} value={m.id}>
                                                {m.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">2. Pilih Status Siswa</label>
                                <div className="grid grid-cols-3 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setExportStatus('all')}
                                        className={`px-3 py-2 rounded-lg border text-xs font-semibold transition ${exportStatus === 'all' ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:border-indigo-500 dark:bg-indigo-950/50 dark:text-indigo-300' : 'border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'}`}
                                    >
                                        Semua Status
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setExportStatus('active')}
                                        className={`px-3 py-2 rounded-lg border text-xs font-semibold transition ${exportStatus === 'active' ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:border-indigo-500 dark:bg-indigo-950/50 dark:text-indigo-300' : 'border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'}`}
                                    >
                                        Siswa Aktif Saja
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setExportStatus('inactive')}
                                        className={`px-3 py-2 rounded-lg border text-xs font-semibold transition ${exportStatus === 'inactive' ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:border-indigo-500 dark:bg-indigo-950/50 dark:text-indigo-300' : 'border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'}`}
                                    >
                                        Non-Aktif / Alumni
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-slate-100 dark:border-slate-800">
                            <button
                                onClick={() => setShowExportModal(false)}
                                className="rounded-xl px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleExportSubmit}
                                disabled={exportCategory === 'month' && !exportMonthId}
                                className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 shadow-sm transition"
                            >
                                <Download className="w-4 h-4" /> Export Excel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="space-y-6 p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <a href="/dashboard">
                            <button className="rounded-xl p-2.5 border border-slate-200 hover:bg-slate-100 dark:border-slate-800 dark:hover:bg-slate-800 transition">
                                <ArrowLeft className="h-5 w-5 text-slate-700 dark:text-slate-300" />
                            </button>
                        </a>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Tunggakan SPP</h1>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Monitoring & pengelolaan tunggakan siswa per kelas maupun non-aktif</p>
                        </div>
                    </div>
                    <div>
                        <button
                            onClick={() => setShowExportModal(true)}
                            className="flex items-center gap-2.5 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 transition active:scale-95"
                        >
                            <Download className="h-4 w-4" />
                            <span>Export Data Tunggakan</span>
                        </button>
                    </div>
                </div>

                {/* 2 SUMMARY CARDS */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div className="rounded-2xl border border-rose-200/80 bg-gradient-to-br from-rose-50 to-white p-6 shadow-sm dark:border-rose-900/50 dark:from-rose-950/30 dark:to-slate-900 transition hover:shadow-md">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400">
                                    <Users className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-rose-600/90 dark:text-rose-400">Total Siswa Menunggak</p>
                                    <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-0.5">{summary.total_students} <span className="text-base font-medium text-slate-500">Siswa</span></h3>
                                </div>
                            </div>
                        </div>
                        <div className="mt-4 pt-3 border-t border-rose-100 dark:border-rose-900/40 flex items-center gap-4 text-xs font-medium text-slate-600 dark:text-slate-400">
                            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-500"></span> {summary.active_students_count ?? 0} Siswa Aktif</span>
                            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500"></span> {summary.inactive_students_count ?? 0} Non-Aktif / Alumni</span>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-amber-200/80 bg-gradient-to-br from-amber-50 to-white p-6 shadow-sm dark:border-amber-900/50 dark:from-amber-950/30 dark:to-slate-900 transition hover:shadow-md">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
                                    <Wallet className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-amber-600/90 dark:text-amber-400">Total Nominal Tunggakan</p>
                                    <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-0.5">{formatRupiahText(summary.total_arrears)}</h3>
                                </div>
                            </div>
                        </div>
                        <div className="mt-4 pt-3 border-t border-amber-100 dark:border-amber-900/40 text-xs font-medium text-slate-600 dark:text-slate-400">
                            Akumulasi seluruh tagihan SPP dari siswa aktif maupun non-aktif
                        </div>
                    </div>
                </div>

                {/* TABS SELECTOR (AKTIF VS NON-AKTIF/ALUMNI) */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-2">
                    <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl w-fit">
                        <button
                            onClick={() => {
                                setActiveTab('active');
                                setSelectedClass('all');
                            }}
                            className={`flex items-center gap-2.5 px-5 py-2.5 rounded-lg text-sm font-semibold transition ${activeTab === 'active' ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white' : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'}`}
                        >
                            <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            <span>Siswa Aktif Menunggak</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${activeTab === 'active' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'}`}>
                                {summary.active_students_count ?? 0}
                            </span>
                        </button>

                        <button
                            onClick={() => {
                                setActiveTab('inactive');
                                setSelectedClass('all');
                            }}
                            className={`flex items-center gap-2.5 px-5 py-2.5 rounded-lg text-sm font-semibold transition ${activeTab === 'inactive' ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white' : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'}`}
                        >
                            <GraduationCap className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                            <span>Siswa Non-Aktif / Alumni Menunggak</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${activeTab === 'inactive' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300' : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'}`}>
                                {summary.inactive_students_count ?? 0}
                            </span>
                        </button>
                    </div>
                </div>

                {/* FILTER CONTROLS */}
                <div className="flex flex-col gap-3 sm:flex-row">
                    <div className="relative flex-1">
                        <Search className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Cari nama siswa atau NISN..."
                            className="w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-4 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    {activeTab === 'active' ? (
                        <select
                            className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                            value={selectedClass}
                            onChange={(e) => setSelectedClass(e.target.value)}
                        >
                            <option value="all">Semua Kelas (Tampilan Per Kelas)</option>
                            <option value="1">Khusus Kelas 1</option>
                            <option value="2">Khusus Kelas 2</option>
                            <option value="3">Khusus Kelas 3</option>
                            <option value="4">Khusus Kelas 4</option>
                            <option value="5">Khusus Kelas 5</option>
                            <option value="6">Khusus Kelas 6</option>
                        </select>
                    ) : (
                        <select
                            className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                            value={selectedInactiveStatus}
                            onChange={(e) => setSelectedInactiveStatus(e.target.value)}
                        >
                            <option value="all">Semua Status Non-Aktif (Alumni/Pindah/Berhenti)</option>
                            <option value="lulus">Alumni / Lulus</option>
                            <option value="pindah">Pindah Sekolah</option>
                            <option value="berhenti">Berhenti / Keluar</option>
                        </select>
                    )}

                    <select
                        className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                        value={selectedGender}
                        onChange={(e) => setSelectedGender(e.target.value)}
                    >
                        <option value="all">Semua Gender</option>
                        <option value="L">Laki-laki (Putra)</option>
                        <option value="P">Perempuan (Putri)</option>
                    </select>
                </div>

                {/* TAB SISWA AKTIF: DYNAMIC COLLAPSIBLE PER KELAS */}
                {activeTab === 'active' && (
                    <div className="space-y-6">
                        {(selectedClass === 'all' ? activeClassesList : [selectedClass]).map((cls) => {
                            const classStudents = getStudentsByClass(cls);
                            const totalClassArrears = classStudents.reduce((acc, curr) => acc + curr.total_arrears, 0);
                            const totalClassMonths = classStudents.reduce((acc, curr) => acc + curr.arrears_count, 0);
                            const isCollapsed = collapsedSections[`class-${cls}`] ?? false;

                            return (
                                <div key={cls} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 transition">
                                    {/* COLLAPSIBLE HEADER BOX */}
                                    <div
                                        onClick={() => toggleSectionCollapse(`class-${cls}`)}
                                        className="bg-gradient-to-r from-slate-50 via-slate-50/80 to-white dark:from-slate-800/80 dark:via-slate-800/50 dark:to-slate-900 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 cursor-pointer select-none hover:bg-slate-100/60 dark:hover:bg-slate-800/80 transition"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white font-bold text-lg shadow-sm shrink-0">
                                                {cls}
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                                    {`Kelas ${cls}`}
                                                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${classStudents.length > 0 ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'}`}>
                                                        {classStudents.length} Siswa Menunggak
                                                    </span>
                                                </h3>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                                    {classStudents.length > 0 ? `Total ${totalClassMonths} bulan tagihan belum terbayar di kelas ini` : 'Kelas ini bersih dari tunggakan SPP'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 justify-between sm:justify-end">
                                            <div className="text-left sm:text-right">
                                                <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">Total Tunggakan</p>
                                                <p className={`text-lg font-extrabold ${classStudents.length > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                                                    {formatRupiahText(totalClassArrears)}
                                                </p>
                                            </div>
                                            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                                {isCollapsed ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
                                            </div>
                                        </div>
                                    </div>

                                    {/* COLLAPSIBLE BODY (TABLE / EMPTY STATE) */}
                                    {!isCollapsed && (
                                        classStudents.length === 0 ? (
                                            <div className="p-8 text-center bg-slate-50/40 dark:bg-slate-800/20 border-t border-slate-200/60 dark:border-slate-800/60">
                                                <Check className="mx-auto h-8 w-8 text-emerald-500 mb-2" />
                                                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Kelas Ini Bersih dari Tunggakan</p>
                                                <p className="text-xs text-slate-500 mt-0.5">Tidak ada siswa aktif di {`Kelas ${cls}`} yang memiliki tagihan SPP tertunggak.</p>
                                            </div>
                                        ) : (
                                            <div className="overflow-x-auto border-t border-slate-200/60 dark:border-slate-800/60">
                                                <table className="w-full whitespace-nowrap min-w-[750px]">
                                                    <thead>
                                                        <tr className="border-b border-slate-100 bg-slate-50/50 dark:border-slate-800/80 dark:bg-slate-800/30 text-slate-500 dark:text-slate-400 text-xs uppercase font-semibold">
                                                            <th className="px-6 py-3.5 text-left">Nama Siswa / NISN</th>
                                                            <th className="px-6 py-3.5 text-center">Gender</th>
                                                            <th className="px-6 py-3.5 text-center">Lama Tunggakan</th>
                                                            <th className="px-6 py-3.5 text-right">Total Nominal</th>
                                                            <th className="px-6 py-3.5 text-center">Aksi</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                                        {classStudents.map((student) => (
                                                            <Fragment key={student.id}>
                                                                <tr className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                                                                    <td className="px-6 py-4">
                                                                        <div className="flex items-center gap-3">
                                                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${student.gender === 'L' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' : 'bg-pink-100 text-pink-700 dark:bg-pink-900/50 dark:text-pink-300'}`}>
                                                                                {student.name.charAt(0).toUpperCase()}
                                                                            </div>
                                                                            <div>
                                                                                <p className="font-bold text-slate-900 dark:text-white">{student.name}</p>
                                                                                <p className="text-xs text-slate-500">NISN: {student.nisn}</p>
                                                                            </div>
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-6 py-4 text-center">
                                                                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${student.gender === 'L' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300' : 'bg-pink-50 text-pink-600 dark:bg-pink-900/30 dark:text-pink-300'}`}>
                                                                            {student.gender === 'L' ? 'Putra (L)' : 'Putri (P)'}
                                                                        </span>
                                                                    </td>
                                                                    <td className="px-6 py-4 text-center">
                                                                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-3 py-1 text-xs font-bold text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-900">
                                                                            <AlertTriangle className="w-3 h-3" /> {student.arrears_count} Bulan
                                                                        </span>
                                                                    </td>
                                                                    <td className="px-6 py-4 text-right">
                                                                        <span className="text-base font-extrabold text-rose-600 dark:text-rose-400">
                                                                            {formatRupiahText(student.total_arrears)}
                                                                        </span>
                                                                    </td>
                                                                    <td className="px-6 py-4 text-center">
                                                                        <button
                                                                            onClick={() => toggleExpand(student.id)}
                                                                            className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all flex items-center gap-1 mx-auto ${expandedStudent === student.id ? 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900 shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'}`}
                                                                        >
                                                                            <span>{expandedStudent === student.id ? 'Tutup Rincian' : 'Lihat Rincian'}</span>
                                                                            {expandedStudent === student.id ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                                                        </button>
                                                                    </td>
                                                                </tr>
                                                                {expandedStudent === student.id && (
                                                                    <tr>
                                                                        <td colSpan={5} className="bg-slate-50/70 dark:bg-slate-800/30 px-6 py-5 border-y border-slate-100 dark:border-slate-800">
                                                                            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900 border-l-4 border-l-rose-500">
                                                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                                                                                    <div>
                                                                                        <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                                                                            <AlertTriangle className="w-4 h-4 text-rose-500" /> Rincian Bulan Belum Dibayar ({student.unpaid_months.length} Bulan):
                                                                                        </h4>
                                                                                        <p className="text-xs text-slate-500 mt-0.5">Sistem memprioritaskan pelunasan pada bulan paling lama/tertua.</p>
                                                                                    </div>
                                                                                    <div className="flex gap-2">
                                                                                        <a
                                                                                            href={`/siswa/${student.id}`}
                                                                                            className="flex items-center gap-1.5 rounded-xl border border-slate-300 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition"
                                                                                        >
                                                                                            <User className="w-3.5 h-3.5" /> Buka Profil Siswa
                                                                                        </a>
                                                                                        <button
                                                                                            onClick={() => openPaymentModal(student)}
                                                                                            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 shadow-sm transition transform active:scale-95"
                                                                                        >
                                                                                            <Wallet className="w-3.5 h-3.5" /> Bayar Sekarang
                                                                                        </button>
                                                                                    </div>
                                                                                </div>

                                                                                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                                                                                    {student.unpaid_months.map((month) => (
                                                                                        <div
                                                                                            key={month.id}
                                                                                            className="rounded-xl border border-rose-100 bg-rose-50/80 px-3 py-2 text-xs dark:border-rose-900/50 dark:bg-rose-950/30 flex justify-between items-center"
                                                                                        >
                                                                                            <span className="font-semibold text-rose-900 dark:text-rose-300">{month.month_name}</span>
                                                                                            <span className="text-rose-700 dark:text-rose-400 font-bold bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded shadow-2xs"> {month.year}</span>
                                                                                        </div>
                                                                                    ))}
                                                                                </div>
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                )}
                                                            </Fragment>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* TAB SISWA NON-AKTIF / ALUMNI: DYNAMIC COLLAPSIBLE */}
                {activeTab === 'inactive' && (
                    <div className="space-y-6">
                        <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4 dark:border-amber-900/50 dark:bg-amber-950/20 flex items-start gap-3">
                            <GraduationCap className="w-6 h-6 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                            <div>
                                <h4 className="font-bold text-amber-900 dark:text-amber-300 text-sm">Bagian Khusus Siswa Non-Aktif & Alumni Menunggak</h4>
                                <p className="text-xs text-amber-800/80 dark:text-amber-400/80 mt-0.5">
                                    Siswa di bawah ini sudah berstatus Lulus (Alumni), Pindah Sekolah, atau Berhenti namun masih menyisakan kewajiban tagihan SPP tertunggak yang belum diselesaikan.
                                </p>
                            </div>
                        </div>

                        {(selectedInactiveStatus === 'all' ? inactiveStatusList : inactiveStatusList.filter(s => s.key === selectedInactiveStatus)).map((statusObj) => {
                            const statusStudents = getStudentsByInactiveStatus(statusObj.key);
                            const totalStatusArrears = statusStudents.reduce((acc, curr) => acc + curr.total_arrears, 0);
                            const totalStatusMonths = statusStudents.reduce((acc, curr) => acc + curr.arrears_count, 0);
                            const StatusIcon = statusObj.icon;
                            const isCollapsed = collapsedSections[`status-${statusObj.key}`] ?? false;

                            return (
                                <div key={statusObj.key} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 transition">
                                    {/* COLLAPSIBLE HEADER BOX */}
                                    <div
                                        onClick={() => toggleSectionCollapse(`status-${statusObj.key}`)}
                                        className="bg-gradient-to-r from-slate-50 via-slate-50/80 to-white dark:from-slate-800/80 dark:via-slate-800/50 dark:to-slate-900 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 cursor-pointer select-none hover:bg-slate-100/60 dark:hover:bg-slate-800/80 transition"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-600 text-white font-bold text-lg shadow-sm shrink-0">
                                                <StatusIcon className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                                    {statusObj.label}
                                                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${statusStudents.length > 0 ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-200 dark:border-amber-800' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'}`}>
                                                        {statusStudents.length} Siswa Menunggak
                                                    </span>
                                                </h3>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                                    {statusStudents.length > 0 ? `Total ${totalStatusMonths} bulan tagihan belum diselesaikan oleh kategori ini` : 'Kategori ini bersih dari tunggakan SPP'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 justify-between sm:justify-end">
                                            <div className="text-left sm:text-right">
                                                <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">Total Tunggakan</p>
                                                <p className={`text-lg font-extrabold ${statusStudents.length > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                                                    {formatRupiahText(totalStatusArrears)}
                                                </p>
                                            </div>
                                            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                                {isCollapsed ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
                                            </div>
                                        </div>
                                    </div>

                                    {/* COLLAPSIBLE BODY */}
                                    {!isCollapsed && (
                                        statusStudents.length === 0 ? (
                                            <div className="p-8 text-center bg-slate-50/40 dark:bg-slate-800/20 border-t border-slate-200/60 dark:border-slate-800/60">
                                                <Check className="mx-auto h-8 w-8 text-emerald-500 mb-2" />
                                                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Kategori Ini Bersih dari Tunggakan</p>
                                                <p className="text-xs text-slate-500 mt-0.5">Alhamdulillah, tidak ada siswa dengan status {statusObj.label.toLowerCase()} yang menyisakan tagihan SPP.</p>
                                            </div>
                                        ) : (
                                            <div className="overflow-x-auto border-t border-slate-200/60 dark:border-slate-800/60">
                                                <table className="w-full whitespace-nowrap min-w-[750px]">
                                                    <thead>
                                                        <tr className="border-b border-slate-100 bg-slate-50/50 dark:border-slate-800/80 dark:bg-slate-800/30 text-slate-500 dark:text-slate-400 text-xs uppercase font-semibold">
                                                            <th className="px-6 py-3.5 text-left">Nama Siswa / NISN</th>
                                                            <th className="px-6 py-3.5 text-center">Status & Kelas Terakhir</th>
                                                            <th className="px-6 py-3.5 text-center">Lama Tunggakan</th>
                                                            <th className="px-6 py-3.5 text-right">Total Nominal</th>
                                                            <th className="px-6 py-3.5 text-center">Aksi</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                                        {statusStudents.map((student) => (
                                                            <Fragment key={student.id}>
                                                                <tr className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                                                                    <td className="px-6 py-4">
                                                                        <div className="flex items-center gap-3">
                                                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${student.gender === 'L' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' : 'bg-pink-100 text-pink-700 dark:bg-pink-900/50 dark:text-pink-300'}`}>
                                                                                {student.name.charAt(0).toUpperCase()}
                                                                            </div>
                                                                            <div>
                                                                                <p className="font-bold text-slate-900 dark:text-white">{student.name}</p>
                                                                                <p className="text-xs text-slate-500">NISN: {student.nisn}</p>
                                                                            </div>
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-6 py-4 text-center">
                                                                        <div className="flex flex-col items-center gap-1">
                                                                            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full uppercase ${statusObj.color}`}>
                                                                                {student.status}
                                                                            </span>
                                                                            <span className="text-[11px] text-slate-500 dark:text-slate-400">
                                                                                {student.class ? `Kelas Terakhir: ${student.class}` : 'Tanpa Kelas'}
                                                                            </span>
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-6 py-4 text-center">
                                                                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-3 py-1 text-xs font-bold text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-900">
                                                                            <AlertTriangle className="w-3 h-3" /> {student.arrears_count} Bulan
                                                                        </span>
                                                                    </td>
                                                                    <td className="px-6 py-4 text-right">
                                                                        <span className="text-base font-extrabold text-rose-600 dark:text-rose-400">
                                                                            {formatRupiahText(student.total_arrears)}
                                                                        </span>
                                                                    </td>
                                                                    <td className="px-6 py-4 text-center">
                                                                        <button
                                                                            onClick={() => toggleExpand(student.id)}
                                                                            className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all flex items-center gap-1 mx-auto ${expandedStudent === student.id ? 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900 shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'}`}
                                                                        >
                                                                            <span>{expandedStudent === student.id ? 'Tutup Rincian' : 'Lihat Rincian'}</span>
                                                                            {expandedStudent === student.id ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                                                        </button>
                                                                    </td>
                                                                </tr>
                                                                {expandedStudent === student.id && (
                                                                    <tr>
                                                                        <td colSpan={5} className="bg-slate-50/70 dark:bg-slate-800/30 px-6 py-5 border-y border-slate-100 dark:border-slate-800">
                                                                            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900 border-l-4 border-l-amber-500">
                                                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                                                                                    <div>
                                                                                        <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                                                                            <AlertTriangle className="w-4 h-4 text-rose-500" /> Rincian Bulan Belum Dibayar ({student.unpaid_months.length} Bulan):
                                                                                        </h4>
                                                                                        <p className="text-xs text-slate-500 mt-0.5">Meskipun siswa sudah non-aktif/lulus, tagihan masa lalu tetap dapat dilunasi di sini.</p>
                                                                                    </div>
                                                                                    <div className="flex gap-2">
                                                                                        <a
                                                                                            href={`/siswa/${student.id}`}
                                                                                            className="flex items-center gap-1.5 rounded-xl border border-slate-300 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition"
                                                                                        >
                                                                                            <User className="w-3.5 h-3.5" /> Buka Profil Siswa
                                                                                        </a>
                                                                                        <button
                                                                                            onClick={() => openPaymentModal(student)}
                                                                                            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 shadow-sm transition transform active:scale-95"
                                                                                        >
                                                                                            <Wallet className="w-3.5 h-3.5" /> Bayar Sekarang
                                                                                        </button>
                                                                                    </div>
                                                                                </div>

                                                                                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                                                                                    {student.unpaid_months.map((month) => (
                                                                                        <div
                                                                                            key={month.id}
                                                                                            className="rounded-xl border border-rose-100 bg-rose-50/80 px-3 py-2 text-xs dark:border-rose-900/50 dark:bg-rose-950/30 flex justify-between items-center"
                                                                                        >
                                                                                            <span className="font-semibold text-rose-900 dark:text-rose-300">{month.month_name}</span>
                                                                                            <span className="text-rose-700 dark:text-rose-400 font-bold bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded shadow-2xs"> {month.year}</span>
                                                                                        </div>
                                                                                    ))}
                                                                                </div>
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                )}
                                                            </Fragment>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}