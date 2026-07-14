import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, CalendarDays, ChevronDown, ChevronUp, Edit, User, Wallet } from 'lucide-react';
import React, { useMemo, useState } from 'react';

interface SppPayment {
    id: number | string;
    spp_month_id?: number;
    month: number;
    year: number;
    amount: number;
    paid_amount: number;
    status: 'unpaid' | 'partial' | 'paid' | string;
}

interface Student {
    id: number;
    nisn: string;
    name: string;
    gender?: string;
    class?: string | number | null;
    status: string;
    student_type?: string;
    entry_month?: number;
    entry_year?: number;
    exit_month?: number | null;
    exit_year?: number | null;
    spp_payments?: SppPayment[];
}

interface Props {
    student: Student;
}

const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

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
            preserveScroll: true,
            onSuccess: () => {
                payReset();
                alert('Pembayaran berhasil diproses!');
            },
        });
    };

    const getStatusBadge = (status: string) => {
        const statusStyles: Record<string, string> = {
            aktif: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
            lulus: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
            pindah: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
            berhenti: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
        };
        return statusStyles[status] || 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
    };

    const getMonthName = (monthNumber?: number) => {
        if (!monthNumber || monthNumber < 1 || monthNumber > 12) return '-';
        return months[monthNumber - 1];
    };

    const formatRupiah = (angka: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(angka);
    };

    const groupedPayments = useMemo(() => {
        const groups: { [key: string]: SppPayment[] } = {};
        if (!student.spp_payments) return groups;

        student.spp_payments.forEach((p) => {
            const yearNum = Number(p.year);
            const monthNum = Number(p.month);
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

    const sortedYears = Object.keys(groupedPayments).sort().reverse();
    const [expandedYear, setExpandedYear] = useState<string | null>(sortedYears[0] || null);

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Remaja Putra', href: '/santriwan' },
                { title: student.name, href: '#' },
            ]}
        >
            <Head title={`Profil - ${student.name}`} />

            <div className="space-y-6 p-6">
                <Link
                    href={route('santriwan.detail', { kelas: student.class || 'none' })}
                    className="inline-flex items-center text-sm font-medium text-slate-500 transition hover:text-slate-900 dark:hover:text-white"
                >
                    <ArrowLeft className="mr-1 h-4 w-4" /> Kembali ke Kelas Putra
                </Link>

                {/* BAGIAN ATAS: INFORMASI BIODATA SISWA (DISAMAKAN DENGAN SISWA/SHOW) */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    <div className="col-span-1 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex flex-col items-center text-center">
                            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/30">
                                <User className="h-12 w-12 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <h3 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">{student.name}</h3>
                            <p className="text-sm text-slate-500">NISN: {student.nisn}</p>
                            <span className={`mt-2 inline-flex rounded-full px-3 py-1 text-sm font-medium uppercase ${getStatusBadge(student.status)}`}>
                                {student.status}
                            </span>
                        </div>
                    </div>

                    <div className="col-span-2 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Informasi Siswa</h3>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-slate-500">Nama Lengkap</p>
                                    <p className="font-medium text-slate-900 dark:text-white">{student.name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">NISN</p>
                                    <p className="font-medium text-slate-900 dark:text-white">{student.nisn}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">Jenis Kelamin</p>
                                    <p className="font-medium text-slate-900 dark:text-white">Laki-laki (Putra)</p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">Kelas</p>
                                    <p className="font-medium text-slate-900 dark:text-white">{student.class ? `Kelas ${student.class}` : '-'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">Status</p>
                                    <p className="font-medium uppercase text-slate-900 dark:text-white">{student.status}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">Tanggal Masuk</p>
                                    <p className="font-medium text-slate-900 dark:text-white">
                                        {student.entry_month && student.entry_year ? `${getMonthName(student.entry_month)} ${student.entry_year}` : '-'}
                                    </p>
                                </div>
                                {student.exit_month && student.exit_year && (
                                    <div>
                                        <p className="text-sm text-slate-500">Tanggal Keluar</p>
                                        <p className="font-medium text-slate-900 dark:text-white">
                                            {`${getMonthName(student.exit_month)} ${student.exit_year}`}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end border-t border-slate-200 pt-4 dark:border-slate-800">
                            <Link href={route('siswa.edit', student.id)}>
                                <Button>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit Siswa
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* BAGIAN BAWAH: RINCIAN TAGIHAN & FORM PEMBAYARAN */}
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
                                                        <h3 className="text-base font-bold text-slate-900 dark:text-white">{year}</h3>
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
                                                                    {getMonthName(spp.month)} {spp.year}
                                                                </p>
                                                                <p className="text-xs text-slate-500">Tagihan: {formatRupiah(spp.amount)}</p>
                                                            </div>
                                                            <div className="text-left sm:text-right">
                                                                {spp.status === 'paid' ? (
                                                                    <span className="inline-block rounded bg-emerald-100 px-2 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                                                                        LUNAS
                                                                    </span>
                                                                ) : spp.status === 'partial' ? (
                                                                    <div className="flex flex-col sm:items-end">
                                                                        <span className="mb-1 inline-block w-fit rounded bg-amber-100 px-2 py-1 text-xs font-bold text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                                                                            MENCICIL
                                                                        </span>
                                                                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                                                                            Terbayar: {formatRupiah(spp.paid_amount)}
                                                                        </span>
                                                                    </div>
                                                                ) : (
                                                                    <span className="inline-block rounded bg-rose-100 px-2 py-1 text-xs font-bold text-rose-700 dark:bg-rose-950 dark:text-rose-300">
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
                                <div className="p-8 text-center text-slate-500 dark:text-slate-400">Belum ada tagihan SPP untuk santri ini.</div>
                            )}
                        </div>
                    </div>

                    {/* KANAN: FORM PEMBAYARAN WATERFALL */}
                    <div className="sticky top-6 h-fit rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <h3 className="mb-4 font-bold text-slate-900 dark:text-white">Proses Pembayaran</h3>
                        <p className="mb-4 text-sm leading-relaxed text-slate-500">
                            Masukkan nominal uang yang diterima. Sistem akan otomatis melunasi tagihan dari bulan tertua (tunggakan) hingga uang habis.
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
