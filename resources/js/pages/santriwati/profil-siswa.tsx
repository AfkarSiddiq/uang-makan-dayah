import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, CalendarDays, ChevronDown, ChevronUp, Pencil, User, Wallet } from 'lucide-react';
import { useMemo, useState } from 'react';

// Tipe data yang dikirim dari Laravel
interface SppPayment {
    id: number;
    month: number;
    year: number;
    amount: number;
    paid_amount: number;
    status: 'unpaid' | 'partial' | 'paid';
}

interface Student {
    id: number;
    nisn: string;
    name: string;
    class: string;
    status: string;
    entry_month: number;
    entry_year: number;
    spp_payments: SppPayment[]; // Relasi dari Laravel otomatis masuk ke sini
}

interface Props {
    student: Student;
}

export default function ProfilSiswa({ student }: Props) {
    const {
        data: payData,
        setData: setPayData,
        post: payPost,
        processing: payProcessing,
        reset: payReset,
        errors: payErrors,
    } = useForm({
        amount: '',
    });

    const submitPayment = (e: React.FormEvent) => {
        e.preventDefault();
        payPost(route('siswa.pay', { id: student.id }), {
            preserveScroll: true, // Agar halaman tidak loncat ke atas saat bayar
            onSuccess: () => {
                payReset(); // Kosongkan input setelah sukses
                alert('Pembayaran berhasil diproses!'); // Opsional: Bisa diganti dengan toast notification
            },
        });
    };

    const getMonthName = (monthNumber: number) => {
        const date = new Date(2000, monthNumber - 1, 1);
        return date.toLocaleString('id-ID', { month: 'long' });
    };

    const formatRupiah = (angka: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(angka);
    };

    // LOGIKA BARU VIRTUAL WATERFALL LEDGER DI FRONTEND
    // Mengelompokkan tagihan berdasarkan Tahun Ajaran (Juli s.d Juni tahun berikutnya)
    const groupedPayments = useMemo(() => {
        const groups: { [key: string]: SppPayment[] } = {};

        student.spp_payments.forEach((p) => {
            const yearNum = Number(p.year);
            const monthNum = Number(p.month);
            // Jika bulan >= 7 (Juli-Desember), maka masuk tahun ajaran p.year / p.year + 1
            // Jika bulan < 7 (Januari-Juni), maka masuk tahun ajaran p.year - 1 / p.year
            const startYear = monthNum >= 7 ? yearNum : yearNum - 1;
            const endYear = startYear + 1;
            const groupName = `Tahun Ajaran ${startYear}/${endYear}`;

            if (!groups[groupName]) {
                groups[groupName] = [];
            }
            groups[groupName].push(p);
        });

        return groups;
    }, [student.spp_payments]);

    // Urutkan tahun ajaran dari yang terbaru ke terlama
    const sortedYears = Object.keys(groupedPayments).sort().reverse();

    // State untuk akordion tahun ajaran (default terbuka tahun terbaru)
    const [expandedYear, setExpandedYear] = useState<string | null>(sortedYears[0] || null);

    const toggleYear = (year: string) => {
        setExpandedYear(expandedYear === year ? null : year);
    };

    // Hitung ringkasan total tagihan
    const summary = useMemo(() => {
        let totalBill = 0;
        let totalPaid = 0;
        let totalUnpaid = 0;

        student.spp_payments.forEach((p) => {
            totalBill += p.amount;
            totalPaid += p.paid_amount;
            totalUnpaid += p.amount - p.paid_amount;
        });

        return { totalBill, totalPaid, totalUnpaid };
    }, [student.spp_payments]);

    return (
        <AppLayout breadcrumbs={[{ title: 'Daftar Siswa', href: '#' }, { title: student.name }]}>
            <Head title={`Profil - ${student.name}`} />

            <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
                {/* TOMBOL KEMBALI */}
                <Link
                    href={route('santriwati.detail', { kelas: student.class || 1 })}
                    className="inline-flex items-center text-sm font-medium text-slate-500 transition hover:text-slate-900 dark:hover:text-white"
                >
                    <ArrowLeft className="mr-1 h-4 w-4" /> Kembali ke Kelas
                </Link>

                {/* KARTU BIODATA SISWA */}
                <div className="relative flex items-start gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    {/* Tombol Link Edit ke halaman khusus /siswa/{id}/edit */}
                    <Link
                        href={route('siswa.edit', student.id)}
                        className="absolute top-6 right-6 rounded-md bg-slate-50 p-2 text-slate-500 transition hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
                        title="Edit Biodata"
                    >
                        <Pencil className="h-4 w-4" />
                    </Link>

                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50">
                        <User className="h-8 w-8" />
                    </div>
                    <div className="w-full pr-12">
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{student.name}</h1>

                        <div className="mt-2 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600 dark:text-slate-400">
                            <p>
                                <span className="font-medium text-slate-900 dark:text-slate-300">NISN:</span> {student.nisn}
                            </p>
                            <p>
                                <span className="font-medium text-slate-900 dark:text-slate-300">Kelas:</span>{' '}
                                {student.class || 'Belum ada kelas'}
                            </p>

                            <p>
                                <span className="font-medium text-slate-900 dark:text-slate-300">Masuk Sejak:</span>{' '}
                                {getMonthName(student.entry_month)} {student.entry_year}
                            </p>

                            <p>
                                <span className="font-medium text-slate-900 dark:text-slate-300">Status:</span>
                                <span
                                    className={`ml-1 font-semibold uppercase ${student.status === 'aktif' ? 'text-emerald-600' : 'text-rose-600'}`}
                                >
                                    {student.status}
                                </span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* BAGIAN BAWAH: LAYOUT TERBAGI 2 */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* KIRI: DAFTAR TAGIHAN SPP */}
                    <div className="h-fit overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm lg:col-span-2 dark:border-slate-800 dark:bg-slate-900">
                        <div className="border-b border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/50">
                            <h2 className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                                <Wallet className="h-5 w-5 text-indigo-600" /> Rincian Tagihan SPP
                            </h2>
                        </div>

                        <div className="flex flex-col">
                            {sortedYears.length > 0 ? (
                                sortedYears.map((year) => {
                                    const isExpanded = expandedYear === year;
                                    const monthsInYear = groupedPayments[year];

                                    // Hitung statistik untuk tahun ini (Untuk ditampilkan di header accordion)
                                    const totalTagihanTahunIni = monthsInYear.length;
                                    const lunasTahunIni = monthsInYear.filter((m) => m.status === 'paid').length;
                                    const statusTahun = lunasTahunIni === totalTagihanTahunIni ? 'lunas' : 'tunggakan';

                                    return (
                                        <div key={year} className="border-b border-slate-200 last:border-0 dark:border-slate-800">
                                            {/* HEADER TAHUN (BISA DIKLIK) */}
                                            <button
                                                onClick={() => setExpandedYear(isExpanded ? null : year)}
                                                className={`flex w-full items-center justify-between px-5 py-4 transition-colors ${isExpanded ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800/30'}`}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div
                                                        className={`rounded-lg p-2 ${isExpanded ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}
                                                    >
                                                        <CalendarDays className="h-5 w-5" />
                                                    </div>
                                                    <div className="text-left">
                                                        <h3 className="text-base font-bold text-slate-900 dark:text-white">Tahun {year}</h3>
                                                        <p className="mt-0.5 text-xs text-slate-500">
                                                            {lunasTahunIni} dari {totalTagihanTahunIni} Bulan Lunas
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-4">
                                                    {statusTahun === 'lunas' ? (
                                                        <span className="hidden rounded bg-emerald-100 px-2 py-1 text-xs font-bold text-emerald-700 sm:inline-block">
                                                            TAHUN LUNAS
                                                        </span>
                                                    ) : (
                                                        <span className="hidden rounded bg-amber-100 px-2 py-1 text-xs font-bold text-amber-700 sm:inline-block">
                                                            ADA TUNGGAKAN
                                                        </span>
                                                    )}

                                                    {isExpanded ? (
                                                        <ChevronUp className="h-5 w-5 text-slate-400" />
                                                    ) : (
                                                        <ChevronDown className="h-5 w-5 text-slate-400" />
                                                    )}
                                                </div>
                                            </button>

                                            {/* ISI BULAN (HANYA MUNCUL JIKA EXPANDED) */}
                                            {isExpanded && (
                                                <div className="divide-y divide-slate-100 bg-slate-50/30 dark:divide-slate-800/50 dark:bg-slate-900/20">
                                                    {monthsInYear.map((spp) => (
                                                        <div
                                                            key={spp.id}
                                                            className="flex flex-col justify-between p-4 pl-16 transition hover:bg-slate-50 sm:flex-row sm:items-center dark:hover:bg-slate-800/50"
                                                        >
                                                            <div className="mb-2 sm:mb-0">
                                                                <p className="font-semibold text-slate-900 dark:text-slate-200">
                                                                    {getMonthName(spp.month)}
                                                                </p>
                                                                <p className="text-xs text-slate-500">Tagihan: {formatRupiah(spp.amount)}</p>
                                                            </div>
                                                            <div className="text-left sm:text-right">
                                                                {spp.status === 'paid' ? (
                                                                    <span className="inline-block rounded bg-emerald-100 px-2 py-1 text-xs font-bold text-emerald-700">
                                                                        LUNAS
                                                                    </span>
                                                                ) : spp.status === 'partial' ? (
                                                                    <div className="flex flex-col sm:items-end">
                                                                        <span className="mb-1 inline-block w-fit rounded bg-amber-100 px-2 py-1 text-xs font-bold text-amber-700">
                                                                            MENCICIL
                                                                        </span>
                                                                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                                                                            Terbayar: {formatRupiah(spp.paid_amount)}
                                                                        </span>
                                                                    </div>
                                                                ) : (
                                                                    <span className="inline-block rounded bg-rose-100 px-2 py-1 text-xs font-bold text-rose-700">
                                                                        BELUM BAYAR
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="p-8 text-center text-slate-500 dark:text-slate-400">Belum ada tagihan SPP untuk siswi ini.</div>
                            )}
                        </div>
                    </div>

                    {/* KANAN: FORM PEMBAYARAN WATERFALL */}
                    <div className="sticky top-6 h-fit rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <h3 className="mb-4 font-bold text-slate-900 dark:text-white">Proses Pembayaran</h3>
                        <p className="mb-4 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                            Masukkan nominal uang yang diterima. Sistem akan otomatis melunasi tagihan dari bulan tertua (tunggakan) hingga uang
                            habis.
                        </p>

                        <form onSubmit={submitPayment} className="space-y-4">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Nominal Uang (Rp)</label>
                                <input
                                    type="number"
                                    value={payData.amount}
                                    onChange={(e) => setPayData('amount', e.target.value)}
                                    className={`w-full rounded-md border bg-white px-3 py-2 text-sm transition focus:ring-2 focus:outline-none dark:bg-slate-950 dark:text-white ${payErrors.amount ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-indigo-500 dark:border-slate-700'}`}
                                    placeholder="Contoh: 1500000"
                                    min="1"
                                    required
                                />
                                {payErrors.amount && <p className="mt-1 text-xs text-red-500">{payErrors.amount}</p>}
                            </div>
                            <button
                                type="submit"
                                disabled={payProcessing || !payData.amount}
                                className="flex w-full items-center justify-center rounded-md bg-indigo-600 px-4 py-2 font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {payProcessing ? 'Memproses...' : 'Terima Pembayaran'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
