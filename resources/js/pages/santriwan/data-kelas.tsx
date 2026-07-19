import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { Users, GraduationCap } from 'lucide-react'; // [DITAMBAHKAN]: Import icon GraduationCap

interface KelasItem {
    class: string;
    total_siswa: number;
}

interface Props {
    kelasData: KelasItem[];
}

export default function DataKelas({ kelasData }: Props) {
    return (
        <AppLayout breadcrumbs={[{ title: 'Data Santriwan', href: '/santriwan' }]}>
            <Head title="Pilih Kelas Santriwan" />
            
            <div className="p-6">
                
                {/* [DIPERBAIKI]: Mengubah div menjadi flex agar judul di kiri dan tombol di kanan */}
                <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground dark:text-white">Data Santriwan</h1>
                        <p className="text-muted-foreground dark:text-muted-foreground">Pilih kelas untuk melihat daftar santriwan.</p>
                    </div>
                    
                    {/* [DITAMBAHKAN]: Tombol Kenaikan Kelas */}
                    {/* Catatan: Nanti Anda perlu membuat route 'santriwan.kenaikan' di web.php */}
                    <Link 
                        href={route('santriwan.kenaikan')} 
                        className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-slate-900 shadow-sm"
                    >
                        <GraduationCap className="mr-2 h-4 w-4" />
                        Proses Kenaikan Kelas
                    </Link>
                </div>

                {/* Grid Kartu Kelas */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {kelasData.map((item) => (
                        <Link 
                            key={item.class} 
                            href={route('santriwan.detail', { kelas: item.class })}
                            className="bg-white dark:bg-card border border-border dark:border-slate-800 p-6 rounded-xl shadow-sm hover:shadow-md hover:border-primary transition group"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-800 dark:text-white group-hover:text-primary transition">
                                        Kelas {item.class}
                                    </h2>
                                    <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                                        <Users className="w-4 h-4" /> {item.total_siswa} Santriwan
                                    </p>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-primary/5 dark:bg-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition">
                                    →
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}