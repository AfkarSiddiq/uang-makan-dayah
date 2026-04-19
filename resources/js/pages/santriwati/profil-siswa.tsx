import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, CalendarDays, Check, ChevronDown, ChevronUp, Pencil, User, Wallet, X } from 'lucide-react'; // [DITAMBAHKAN]: Icon CalendarDays
import { useMemo, useState } from 'react'; // [DITAMBAHKAN]: Import useMemo

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
    spp_payments: SppPayment[];
}

interface Props {
    student: Student;
}

export default function ProfilSiswa({ student }: Props) {
    const [isEditing, setIsEditing] = useState(false);
    

    const { data, setData, put, processing, reset } = useForm({
        class: student.class || '',
        status: student.status,
    });

    const submitEdit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('siswa.update', { id: student.id }), {
            onSuccess: () => {
                setIsEditing(false);
            },
        });
    };

    const getMonthName = (monthNumber: number) => {
        const date = new Date();
        date.setMonth(monthNumber - 1);
        return date.toLocaleString('id-ID', { month: 'long' });
    };

    const formatRupiah = (angka: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(angka);
    };

    // =========================================================================
    // [DITAMBAHKAN]: LOGIKA PENGELOMPOKAN TAGIHAN PER TAHUN BIASA
    // =========================================================================

    const groupedPayments = useMemo(() => {
        // Kelompokkan data SPP berdasarkan tahun
        const groups = student.spp_payments.reduce(
            (acc, payment) => {
                const year = payment.year;
                if (!acc[year]) acc[year] = [];
                acc[year].push(payment);
                return acc;
            },
            {} as Record<number, SppPayment[]>,
        );

        return groups;
    }, [student.spp_payments]);

    // Ambil daftar tahunnya saja dan urutkan (misal: 2025, lalu 2026)
    const sortedYears = Object.keys(groupedPayments)
        .map(Number)
        .sort((a, b) => a - b); // Ubah jadi (b - a) jika ingin tahun terbaru di atas

    const [expandedYear, setExpandedYear] = useState<number | null>(
        sortedYears.length > 0 ? sortedYears[sortedYears.length - 1] : null // Default buka tahun terbaru
    );

    // =========================================================================

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Data santriwati', href: '/santriwati' },
                { title: `Kelas ${student.class}`, href: `/santriwati/class/${student.class}` },
                { title: student.name, href: '#' },
            ]}
        >
            <Head title={`Profil - ${student.name}`} />

            <div className="mx-auto max-w-5xl space-y-6 p-6">
                {/* TOMBOL KEMBALI */}
                <Link
                    href={`/santriwati/class/${student.class}`}
                    className="inline-flex items-center text-sm font-medium text-slate-500 transition hover:text-slate-900 dark:hover:text-white"
                >
                    <ArrowLeft className="mr-1 h-4 w-4" /> Kembali ke Kelas
                </Link>

                {/* KARTU BIODATA SISWA */}
                <div className="relative flex items-start gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <button
                        onClick={() => {
                            setIsEditing(!isEditing);
                            reset();
                        }}
                        className="absolute top-6 right-6 rounded-md bg-slate-50 p-2 text-slate-500 transition hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
                        title={isEditing ? 'Batal Edit' : 'Edit Biodata'}
                    >
                        {isEditing ? <X className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
                    </button>

                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50">
                        <User className="h-8 w-8" />
                    </div>
                    <div className="w-full pr-12">
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{student.name}</h1>

                        {isEditing ? (
                            <form
                                onSubmit={submitEdit}
                                className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50"
                            >
                                <div className="mb-4 grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <label className="mb-1 block text-xs font-medium text-slate-500">Ubah Kelas</label>
                                        <select
                                            value={data.class}
                                            onChange={(e) => setData('class', e.target.value)}
                                            className="w-full rounded-md border-slate-300 text-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                                        >
                                            <option value="">-- Pilih Kelas --</option>
                                            <option value="1">Kelas 1</option>
                                            <option value="2">Kelas 2</option>
                                            <option value="3">Kelas 3</option>
                                            <option value="4">Kelas 4</option>
                                            <option value="5">Kelas 5</option>
                                            <option value="6">Kelas 6</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-xs font-medium text-slate-500">Status Siswa</label>
                                        <select
                                            value={data.status}
                                            onChange={(e) => setData('status', e.target.value)}
                                            className="w-full rounded-md border-slate-300 text-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                                        >
                                            <option value="aktif">Aktif</option>
                                            <option value="lulus">Lulus</option>
                                            <option value="pindah">Pindah Sekolah</option>
                                            <option value="berhenti">Berhenti</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="flex items-center gap-1 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:opacity-50"
                                    >
                                        <Check className="h-4 w-4" /> Simpan Perubahan
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="mt-2 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600 dark:text-slate-400">
                                <p>
                                    <span className="font-medium text-slate-900 dark:text-slate-300">NISN:</span> {student.nisn}
                                </p>
                                <p>
                                    <span className="font-medium text-slate-900 dark:text-slate-300">Kelas:</span>{' '}
                                    {student.class || 'Belum ada kelas'}
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
                        )}
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

                        <form className="space-y-4">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Nominal Uang (Rp)</label>
                                <input
                                    type="number"
                                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                                    placeholder="Contoh: 1500000"
                                />
                            </div>
                            <button
                                type="button"
                                className="w-full rounded-md bg-indigo-600 px-4 py-2 font-medium text-white transition hover:bg-indigo-700"
                            >
                                Terima Pembayaran
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
