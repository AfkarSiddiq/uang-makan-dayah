import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, User, Wallet, Pencil, X, Check } from 'lucide-react'; // [DITAMBAHKAN]: Icon Pencil, X, dan Check
import { useState } from 'react'; // [DITAMBAHKAN]: Import useState dari React

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
    // [DITAMBAHKAN]: State untuk mengontrol apakah form edit terbuka atau tertutup
    const [isEditing, setIsEditing] = useState(false);

    // [DITAMBAHKAN]: Setup useForm dari Inertia untuk Update Biodata
    const { data, setData, put, processing, reset } = useForm({
        class: student.class || '',
        status: student.status,
    });

    // [DITAMBAHKAN]: Fungsi submit saat tombol simpan ditekan
    const submitEdit = (e: React.FormEvent) => {
        e.preventDefault();
        // Mengirim request PUT ke route siswa.update
        put(route('siswa.update', { id: student.id }), {
            onSuccess: () => {
                setIsEditing(false); // Tutup form jika berhasil simpan
            },
        });
    };

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
            { title: 'Data santriwati', href: '/santriwati' },
            { title: `Kelas ${student.class}`, href: `/santriwati/class/${student.class}` },
            { title: student.name, href: '#' }
        ]}>
            <Head title={`Profil - ${student.name}`} />
            
            <div className="p-6 max-w-5xl mx-auto space-y-6">
                
                {/* TOMBOL KEMBALI */}
                <Link href={`/santriwati/class/${student.class}`} className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white transition">
                    <ArrowLeft className="w-4 h-4 mr-1" /> Kembali ke Kelas
                </Link>

                {/* KARTU BIODATA SISWA */}
                {/* [DITAMBAHKAN]: Class 'relative' agar tombol edit bisa ditaruh di pojok */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm flex items-start gap-4 relative">
                    
                    {/* [DITAMBAHKAN]: Tombol Toggle Edit di Pojok Kanan Atas */}
                    <button 
                        onClick={() => {
                            setIsEditing(!isEditing);
                            reset(); // Kembalikan ke data asli di database jika batal
                        }}
                        className="absolute top-6 right-6 p-2 rounded-md bg-slate-50 text-slate-500 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 transition"
                        title={isEditing ? "Batal Edit" : "Edit Biodata"}
                    >
                        {isEditing ? <X className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
                    </button>

                    <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 shrink-0">
                        <User className="w-8 h-8" />
                    </div>
                    <div className="w-full pr-12"> {/* pr-12 agar teks tidak menabrak tombol edit */}
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{student.name}</h1>
                        
                        {/* [DITAMBAHKAN]: Logika Jika Sedang Edit vs Sedang Melihat */}
                        {isEditing ? (
                            <form onSubmit={submitEdit} className="mt-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                                <div className="grid gap-4 mb-4 sm:grid-cols-2">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 mb-1">Ubah Kelas</label>
                                        <select 
                                            value={data.class} 
                                            onChange={e => setData('class', e.target.value)}
                                            className="w-full rounded-md border-slate-300 text-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-900 dark:border-slate-700 dark:text-white"
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
                                        <label className="block text-xs font-medium text-slate-500 mb-1">Status Siswa</label>
                                        <select 
                                            value={data.status} 
                                            onChange={e => setData('status', e.target.value)}
                                            className="w-full rounded-md border-slate-300 text-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                                        >
                                            <option value="aktif">Aktif</option>
                                            <option value="lulus">Lulus</option>
                                            <option value="pindah">Pindah Sekolah</option>
                                            <option value="berhenti">Berhenti</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button type="submit" disabled={processing} className="flex items-center gap-1 bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition disabled:opacity-50">
                                        <Check className="w-4 h-4" /> Simpan Perubahan
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="mt-2 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600 dark:text-slate-400">
                                <p><span className="font-medium text-slate-900 dark:text-slate-300">NISN:</span> {student.nisn}</p>
                                <p><span className="font-medium text-slate-900 dark:text-slate-300">Kelas:</span> {student.class || 'Belum ada kelas'}</p>
                                <p><span className="font-medium text-slate-900 dark:text-slate-300">Status:</span> 
                                    <span className={`ml-1 uppercase font-semibold ${student.status === 'aktif' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                        {student.status}
                                    </span>
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* BAGIAN BAWAH: LAYOUT TERBAGI 2 */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* KIRI: DAFTAR TAGIHAN SPP */}
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
                                                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Terbayar: {formatRupiah(spp.paid_amount)}</span>
                                            </div>
                                        ) : (
                                            <span className="inline-block px-2 py-1 bg-rose-100 text-rose-700 text-xs font-bold rounded">BELUM BAYAR</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* KANAN: FORM PEMBAYARAN WATERFALL */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-5 h-fit sticky top-6">
                        <h3 className="font-bold text-slate-900 dark:text-white mb-4">Proses Pembayaran</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
                            Masukkan nominal uang yang diterima. Sistem akan otomatis melunasi tagihan dari bulan tertua (tunggakan) hingga uang habis.
                        </p>
                        
                        <form className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nominal Uang (Rp)</label>
                                <input 
                                    type="number" 
                                    className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
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