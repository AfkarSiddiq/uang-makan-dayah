import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { GraduationCap, Users } from 'lucide-react';

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
                <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Data Santriwan</h1>
                        <p className="text-slate-500 dark:text-slate-400">Pilih kelas untuk melihat daftar santriwan.</p>
                    </div>

                    <Link
                        href={route('santriwati.kenaikan')}
                        className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none dark:focus:ring-offset-slate-900"
                    >
                        <GraduationCap className="mr-2 h-4 w-4" />
                        Proses Kenaikan Kelas
                    </Link>
                </div>

                {/* Grid Kartu Kelas */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
                    {kelasData.map((item) => (
                        <Link
                            key={item.class}
                            href={route('santriwati.detail', { kelas: item.class })}
                            className="group rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-indigo-500 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-800 transition group-hover:text-indigo-600 dark:text-white">
                                        Kelas {item.class}
                                    </h2>
                                    <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
                                        <Users className="h-4 w-4" /> {item.total_siswa} Santriwati
                                    </p>
                                </div>
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 transition group-hover:scale-110 dark:bg-indigo-900/30">
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
