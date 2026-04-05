import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

interface Student {
    id: number;
    nisn: string;
    name: string;
    status: string;
}

interface Props {
    namaKelas: string;
    students: Student[];
}

export default function DetailKelas({ namaKelas, students }: Props) {
    return (
        <AppLayout breadcrumbs={[
            { title: 'Data Santriwati', href: '/santriwati' },
            { title: `Kelas ${namaKelas}`, href: '#' }
        ]}>
            <Head title={`Santriwati Kelas ${namaKelas}`} />
            
            <div className="p-6">
                <div className="flex items-center gap-4 mb-6">
                    <Link href="/santriwan" className="p-2 border rounded-md hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Santriwan Kelas {namaKelas}</h1>
                        <p className="text-slate-500">Menampilkan {students.length} santri aktif.</p>
                    </div>
                </div>

                {/* Tabel Data Siswa ditaruh di sini (Sama seperti tabel sebelumnya) */}
                <div className="bg-white dark:bg-slate-900 border rounded-lg overflow-hidden shadow-sm">
                    {/* ... (Masukkan tag <table> ... </table> Anda di sini) ... */}
                </div>
            </div>
        </AppLayout>
    );
}