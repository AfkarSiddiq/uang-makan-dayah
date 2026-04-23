import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { GraduationCap, Users } from 'lucide-react';

interface TahunItem {
    exit_year: number;
    total_alumni: number;
}

interface Props {
    tahunLulus: TahunItem[];
}

export default function Index({ tahunLulus }: Props) {
    return (
        <AppLayout breadcrumbs={[{ title: 'Data Alumni', href: '/alumni' }]}>
            <Head title="Data Alumni" />
            
            <div className="p-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <GraduationCap className="w-6 h-6 text-indigo-600" /> Data Alumni
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        Daftar seluruh siswa yang telah berstatus lulus, dikelompokkan berdasarkan tahun kelulusan.
                    </p>
                </div>

                {/* Grid Kartu Tahun Lulus */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {tahunLulus.length > 0 ? (
                        tahunLulus.map((item) => (
                            <Link 
                                key={item.exit_year} 
                                href={route('alumni.detail', { year: item.exit_year })}
                                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-xl shadow-sm hover:shadow-md hover:border-indigo-500 transition group"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-800 dark:text-white group-hover:text-indigo-600 transition">
                                            Angkatan Lulus {item.exit_year}
                                        </h2>
                                        <p className="text-sm text-slate-500 mt-1 flex items-center gap-1">
                                            <Users className="w-4 h-4" /> {item.total_alumni} Orang Alumni
                                        </p>
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition">
                                        →
                                    </div>
                                </div>
                            </Link>
                        ))
                    ) : (
                        <div className="col-span-full p-10 text-center bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                            <GraduationCap className="w-10 h-10 mx-auto text-slate-400 mb-3" />
                            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-200">Belum Ada Alumni</h3>
                            <p className="text-slate-500">Saat ini belum ada siswa yang berstatus lulus di dalam sistem.</p>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}