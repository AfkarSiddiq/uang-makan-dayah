import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Check, AlertTriangle } from 'lucide-react';

interface Props {
    kelasAktif: { class: string }[];
}

export default function KenaikanKelas({ kelasAktif }: Props) {
    const currentYear = new Date().getFullYear();

    const { data, setData, post, processing, errors } = useForm({
        old_class: '',
        is_graduating: false,
        new_class: '',
        new_spp_amount: 500000, // Default 500rb
        start_year: currentYear,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (confirm('Apakah Anda yakin ingin memproses ini? Aksi ini akan mengubah data banyak siswa sekaligus.')) {
            post(route('santriwan.kenaikan.proses'));
        }
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Data Santriwan', href: '/santriwan' },
            { title: 'Kenaikan Kelas', href: '#' }
        ]}>
            <Head title="Proses Kenaikan Kelas" />
            
            <div className="p-6 max-w-3xl mx-auto space-y-6">
                
                <Link href="/santriwan" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition">
                    <ArrowLeft className="w-4 h-4 mr-1" /> Kembali
                </Link>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
                    <div className="mb-6 pb-6 border-b border-slate-200 dark:border-slate-800">
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Proses Kenaikan Kelas & SPP</h1>
                        <p className="text-sm text-slate-500 mt-1">
                            Pindahkan seluruh siswa di satu kelas ke kelas baru, dan otomatis buatkan 12 bulan tagihan SPP untuk tahun ajaran yang baru.
                        </p>
                    </div>

                    <form onSubmit={submit} className="space-y-6">
                        
                        {/* 1. KELAS ASAL */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Pilih Kelas Asal</label>
                            <select 
                                value={data.old_class} 
                                onChange={e => setData('old_class', e.target.value)}
                                className="w-full rounded-md border-slate-300 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-950 dark:border-slate-700 dark:text-white"
                                required
                            >
                                <option value="">-- Pilih Kelas --</option>
                                {kelasAktif.map(k => (
                                    <option key={k.class} value={k.class}>Kelas {k.class}</option>
                                ))}
                            </select>
                            {errors.old_class && <p className="text-red-500 text-xs mt-1">{errors.old_class}</p>}
                        </div>

                        {/* 2. OPSI KELULUSAN ATAU KENAIKAN */}
                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 space-y-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    checked={data.is_graduating}
                                    onChange={e => {
                                        setData('is_graduating', e.target.checked);
                                        if (e.target.checked) setData('new_class', ''); // Kosongkan kelas baru jika lulus
                                    }}
                                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                <span className="text-sm font-medium text-slate-900 dark:text-slate-200">Luluskan semua siswa di kelas ini (Menjadi Alumni)</span>
                            </label>

                            {!data.is_graduating && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Naik Ke Kelas Tujuan</label>
                                    <select 
                                        value={data.new_class} 
                                        onChange={e => setData('new_class', e.target.value)}
                                        className="w-full rounded-md border-slate-300 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-950 dark:border-slate-700 dark:text-white"
                                        required={!data.is_graduating}
                                    >
                                        <option value="">-- Pilih Kelas Tujuan --</option>
                                        <option value="1">Kelas 1</option>
                                        <option value="2">Kelas 2</option>
                                        <option value="3">Kelas 3</option>
                                        <option value="4">Kelas 4</option>
                                        <option value="5">Kelas 5</option>
                                        <option value="6">Kelas 6</option>
                                    </select>
                                    {errors.new_class && <p className="text-red-500 text-xs mt-1">{errors.new_class}</p>}
                                </div>
                            )}
                        </div>

                        {/* 3. SETTING SPP BARU (Hanya muncul jika tidak lulus) */}
                        {!data.is_graduating && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tahun Ajaran Baru Dimulai</label>
                                    <input 
                                        type="number" 
                                        value={data.start_year}
                                        onChange={e => setData('start_year', parseInt(e.target.value))}
                                        className="w-full rounded-md border-slate-300 focus:ring-indigo-500 dark:bg-slate-950 dark:border-slate-700 dark:text-white"
                                        required
                                    />
                                    <p className="text-xs text-slate-500 mt-1">Sistem akan membuat tagihan mulai Juli {data.start_year}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nominal SPP per Bulan (Rp)</label>
                                    <input 
                                        type="number" 
                                        value={data.new_spp_amount}
                                        onChange={e => setData('new_spp_amount', parseInt(e.target.value))}
                                        className="w-full rounded-md border-slate-300 focus:ring-indigo-500 dark:bg-slate-950 dark:border-slate-700 dark:text-white"
                                        required
                                    />
                                </div>
                            </div>
                        )}

                        <div className="pt-4 flex items-center justify-end border-t border-slate-200 dark:border-slate-800">
                            <button 
                                type="submit" 
                                disabled={processing} 
                                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-6 rounded-md transition disabled:opacity-50"
                            >
                                <Check className="w-4 h-4" /> Proses Sekarang
                            </button>
                        </div>
                    </form>

                </div>
            </div>
        </AppLayout>
    );
}