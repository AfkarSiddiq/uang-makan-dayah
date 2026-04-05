import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, User, Wallet } from 'lucide-react';

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
    spp_payments: SppPayment[]; // Relasi dari Laravel otomatis masuk ke sini
}

interface Props {
    student: Student;
}

export default function ProfilSiswa({ student }: Props) {
    // Helper untuk mengubah angka bulan menjadi nama bulan
    const getMonthName = (monthNumber: number) => {
        const date = new Date();
        date.setMonth(monthNumber - 1);
        return date.toLocaleString('id-ID', { month: 'long' });
    };

    // Helper untuk format Rupiah
    const formatRupiah = (angka: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(angka);
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Data Santriwan', href: '/santriwan' },
            { title: `Kelas ${student.class}`, href: `/santriwan/kelas/${student.class}` },
            { title: student.name, href: '#' }
        ]}>
            <Head title={`Profil - ${student.name}`} />
            
            <div className="p-6 max-w-5xl mx-auto space-y-6">
                
                {/* TOMBOL KEMBALI */}
                <Link href={`/santriwan/kelas/${student.class}`} className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white transition">
                    <ArrowLeft className="w-4 h-4 mr-1" /> Kembali ke Kelas
                </Link>

                {/* KARTU BIODATA SISWA */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm flex items-start gap-4">
                    <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 shrink-0">
                        <User className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{student.name}</h1>
                        <div className="mt-2 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600 dark:text-slate-400">
                            <p><span className="font-medium text-slate-900 dark:text-slate-300">NISN:</span> {student.nisn}</p>
                            <p><span className="font-medium text-slate-900 dark:text-slate-300">Kelas:</span> {student.class}</p>
                            <p><span className="font-medium text-slate-900 dark:text-slate-300">Status:</span> <span className="uppercase text-emerald-600 font-semibold">{student.status}</span></p>
                        </div>
                    </div>
                </div>

                {/* BAGIAN BAWAH: LAYOUT TERBAGI 2 */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* KIRI: DAFTAR TAGIHAN SPP (Ambil tempat lebih luas) */}
                    <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
                        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                            <h2 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Wallet className="w-5 h-5 text-indigo-600" /> Rincian Tagihan SPP
                            </h2>
                        </div>
                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                            {student.spp_payments.map((spp) => (
                                <div key={spp.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                                    <div>
                                        <p className="font-semibold text-slate-900 dark:text-slate-200">
                                            {getMonthName(spp.month)} {spp.year}
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            Tagihan: {formatRupiah(spp.amount)}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        {/* Status Lunas / Belum */}
                                        {spp.status === 'paid' ? (
                                            <span className="inline-block px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded">LUNAS</span>
                                        ) : spp.status === 'partial' ? (
                                            <div className="flex flex-col items-end">
                                                <span className="inline-block px-2 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded mb-1">MENCICIL</span>
                                                <span className="text-xs font-medium text-slate-600">Terbayar: {formatRupiah(spp.paid_amount)}</span>
                                            </div>
                                        ) : (
                                            <span className="inline-block px-2 py-1 bg-rose-100 text-rose-700 text-xs font-bold rounded">BELUM BAYAR</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* KANAN: FORM PEMBAYARAN WATERFALL (Nanti kita fungsikan) */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-5 h-fit sticky top-6">
                        <h3 className="font-bold text-slate-900 dark:text-white mb-4">Proses Pembayaran</h3>
                        <p className="text-sm text-slate-500 mb-4 leading-relaxed">
                            Masukkan nominal uang yang diterima. Sistem akan otomatis melunasi tagihan dari bulan tertua (tunggakan) hingga uang habis.
                        </p>
                        
                        <form className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nominal Uang (Rp)</label>
                                <input 
                                    type="number" 
                                    className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Contoh: 1500000"
                                />
                            </div>
                            <button 
                                type="button" 
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md transition"
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