import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { Users } from 'lucide-react';

interface KelasItem {
    class: string;
    total_siswa: number;
}

interface Props {
    kelasData: KelasItem[];
}

export default function DataKelas({ kelasData }: Props) {
    return (
        <AppLayout breadcrumbs={[{ title: 'Data Santriwati', href: '/santriwati' }]}>
            <Head title="Pilih Kelas Santriwati" />
            
            <div className="p-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Data Santriwati</h1>
                    <p className="text-slate-500">Pilih kelas untuk melihat daftar santriwati.</p>
                </div>

                {/* Grid Kartu Kelas */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {kelasData.map((item) => (
                        <Link 
                            key={item.class} 
                            href={route('santriwati.detail', { kelas: item.class })}
                            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-xl shadow-sm hover:shadow-md hover:border-indigo-500 transition group"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-800 dark:text-white group-hover:text-indigo-600 transition">
                                        Kelas {item.class}
                                    </h2>
                                    <p className="text-sm text-slate-500 mt-1 flex items-center gap-1">
                                        <Users className="w-4 h-4" /> {item.total_siswa} Santriwati
                                    </p>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition">
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