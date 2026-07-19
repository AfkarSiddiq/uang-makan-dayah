import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Inbox } from 'lucide-react';

interface Alumni {
    id: number;
    nisn: string;
    name: string;
    gender: 'L' | 'P';
    status: string;
}

interface Props {
    tahun: number;
    alumni: Alumni[];
}

export default function DetailTahun({ tahun, alumni }: Props) {
    return (
        <AppLayout breadcrumbs={[
            { title: 'Arsip & Alumni', href: '/alumni' },
            { title: `Angkatan ${tahun}`, href: '#' }
        ]}>
            <Head title={`Alumni Angkatan ${tahun}`} />
            
            <div className="p-6 max-w-7xl mx-auto space-y-6">
                <div className="flex items-center gap-4 border-b border-black/5 dark:border-white/5 pb-4">
                    <Link href="/alumni" className="rounded-xl border border-black/5 dark:border-white/5 p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition">
                        <ArrowLeft className="h-5 w-5 text-slate-600 dark:text-muted-foreground" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground dark:text-white">Alumni Angkatan {tahun}</h1>
                        <p className="text-sm text-muted-foreground dark:text-muted-foreground mt-0.5">Menampilkan {alumni.length} orang yang lulus pada angkatan ini.</p>
                    </div>
                </div>

                {/* Tampilan Desktop: Table */}
                <div className="hidden md:block bg-card rounded-2xl shadow-lg shadow-primary/5 ring-1 ring-black/5 dark:ring-white/10 overflow-hidden overflow-x-auto border-transparent">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-slate-50/50 dark:bg-slate-800/30 font-semibold text-slate-600 border-b border-black/5 dark:border-white/5 dark:text-slate-300">
                            <tr>
                                <th className="w-16 px-6 py-4">No</th>
                                <th className="px-6 py-4">NISN</th>
                                <th className="px-6 py-4">Nama Lengkap</th>
                                <th className="px-6 py-4">Gender</th>
                                <th className="px-6 py-4">Status Terakhir</th>
                                <th className="px-6 py-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                            {alumni.length > 0 ? (
                                alumni.map((student, index) => (
                                    <tr key={student.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="px-6 py-4 text-muted-foreground dark:text-muted-foreground font-medium">{index + 1}</td>
                                        <td className="px-6 py-4 font-mono font-medium text-slate-800 dark:text-slate-300">{student.nisn}</td>
                                        <td className="px-6 py-4 font-bold text-foreground dark:text-white">{student.name}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ring-1 ring-inset ${
                                                student.gender === 'L' 
                                                ? 'bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-900/30 dark:text-blue-300'
                                                : 'bg-pink-50 text-pink-700 ring-pink-600/20 dark:bg-pink-900/30 dark:text-pink-300'
                                            }`}>
                                                {student.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600 ring-1 ring-inset ring-slate-500/20 dark:bg-slate-800 dark:text-muted-foreground">
                                                {student.status.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link
                                                href={student.gender === 'L' 
                                                    ? route('santriwan.show', { id: student.id }) 
                                                    : route('santriwati.show', { id: student.id })
                                                }
                                                className="inline-flex items-center justify-center rounded-lg bg-primary/5 px-3.5 py-1.5 text-xs font-semibold text-primary hover:bg-primary/10 transition dark:bg-primary/20 dark:text-primary/80 dark:hover:bg-primary/20"
                                            >
                                                Lihat Riwayat →
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                                            <Inbox className="h-10 w-10 mb-3 opacity-50" />
                                            <p className="text-base font-semibold text-foreground/90 dark:text-slate-300">Data alumni tidak ditemukan.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Tampilan Mobile: Kartu Responsif */}
                <div className="md:hidden space-y-3.5">
                    {alumni.length > 0 ? (
                        alumni.map((student) => (
                            <div key={student.id} className="bg-card p-4 rounded-2xl border-transparent shadow-lg shadow-primary/5 ring-1 ring-black/5 dark:ring-white/10 space-y-3">
                                <div className="flex items-center justify-between gap-2 border-b border-black/5 dark:border-white/5 pb-2.5">
                                    <span className="font-mono text-xs font-bold text-primary dark:text-primary bg-primary/5 dark:bg-primary/10 px-2.5 py-1 rounded-lg">
                                        NISN: {student.nisn}
                                    </span>
                                    <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-muted-foreground uppercase">
                                        {student.status}
                                    </span>
                                </div>

                                <div className="flex items-start justify-between gap-2">
                                    <div>
                                        <h3 className="font-extrabold text-base text-foreground dark:text-white leading-snug">
                                            {student.name}
                                        </h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${
                                                student.gender === 'L' 
                                                ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                                                : 'bg-pink-50 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300'
                                            }`}>
                                                {student.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-2 border-t border-black/5 dark:border-white/5 flex items-center justify-end">
                                    <Link
                                        href={student.gender === 'L' 
                                            ? route('santriwan.show', { id: student.id }) 
                                            : route('santriwati.show', { id: student.id })
                                        }
                                        className="inline-flex items-center justify-center rounded-xl bg-primary px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-primary/50 transition"
                                    >
                                        Lihat Riwayat →
                                    </Link>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-8 text-center bg-white dark:bg-card rounded-2xl border border-dashed border-slate-300 dark:border-slate-800">
                            <Inbox className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                            <p className="font-semibold text-sm text-foreground/90 dark:text-slate-300">Data alumni tidak ditemukan</p>
                        </div>
                    )}
                </div>

            </div>
        </AppLayout>
    );
}