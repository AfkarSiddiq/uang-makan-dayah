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
            { title: 'Data Alumni', href: '/alumni' },
            { title: `Angkatan ${tahun}`, href: '#' }
        ]}>
            <Head title={`Alumni Angkatan ${tahun}`} />
            
            <div className="p-6">
                
                <div className="mb-6 flex items-center gap-4">
                    <Link href="/alumni" className="rounded-md border border-slate-200 dark:border-slate-800 p-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition">
                        <ArrowLeft className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Alumni Angkatan {tahun}</h1>
                        <p className="text-slate-500">Menampilkan {alumni.length} orang yang lulus pada tahun ajaran ini.</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm overflow-hidden overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-slate-50/80 dark:bg-slate-800/50 text-slate-500 border-b border-slate-200 dark:border-slate-800">
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
                                    <tr key={student.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                        <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{index + 1}</td>
                                        <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-300">{student.nisn}</td>
                                        <td className="px-6 py-4 font-semibold text-slate-800 dark:text-slate-200">{student.name}</td>
                                        <td className="px-6 py-4">
                                            {/* Badge Gender */}
                                            <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                                                student.gender === 'L' 
                                                ? 'bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-400/10 dark:text-blue-400'
                                                : 'bg-fuchsia-50 text-fuchsia-700 ring-fuchsia-600/20 dark:bg-fuchsia-400/10 dark:text-fuchsia-400'
                                            }`}>
                                                {student.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-500/20 dark:bg-slate-800 dark:text-slate-400">
                                                {student.status.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {/* Link dinamis tergantung gender */}
                                            <Link
                                                href={student.gender === 'L' 
                                                    ? route('santriwan.show', { id: student.id }) 
                                                    : route('santriwati.show', { id: student.id }) // Sesuaikan dengan route santriwati Anda
                                                }
                                                className="inline-flex items-center justify-center rounded-md bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-600 hover:bg-indigo-100 transition dark:bg-indigo-900/50 dark:text-indigo-400"
                                            >
                                                Lihat Riwayat
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center justify-center text-slate-400">
                                            <Inbox className="h-10 w-10 mb-3 opacity-50" />
                                            <p className="text-base font-medium">Data alumni tidak ditemukan.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

            </div>
        </AppLayout>
    );
}