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

            <div className="p-4 sm:p-6">
                <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground dark:text-white">Data Santriwati</h1>
                        <p className="text-muted-foreground dark:text-muted-foreground">Pilih kelas untuk melihat daftar santriwati.</p>
                    </div>

                    <Link
                        href={route('santriwati.kenaikan')}
                        className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700 focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:outline-none dark:focus:ring-offset-slate-900"
                    >
                        <GraduationCap className="mr-2 h-4 w-4" />
                        Proses Kenaikan Kelas
                    </Link>
                </div>

                {/* Grid Kartu Kelas */}
                <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {kelasData.map((item) => (
                        <Link
                            key={item.class}
                            href={route('santriwati.detail', { kelas: item.class })}
                            className="group rounded-xl border border-border bg-white p-6 shadow-sm transition hover:border-primary hover:shadow-md dark:border-slate-800 dark:bg-card"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-800 transition group-hover:text-primary dark:text-white">
                                        Kelas {item.class}
                                    </h2>
                                    <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                                        <Users className="h-4 w-4" /> {item.total_siswa} Santriwati
                                    </p>
                                </div>
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/5 text-primary transition group-hover:scale-110 dark:bg-primary/20">
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
