import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, Download, Upload } from 'lucide-react';

export default function Import() {
    const { data, setData, post, processing, errors } = useForm({
        file: null as File | null,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!data.file) {
            alert('Silakan pilih file terlebih dahulu');
            return;
        }

        post(route('siswa.import.store'), {
            onSuccess: () => {
                router.visit(route('siswa.index'));
            },
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('file', file);
        }
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Siswa', href: '/siswa' },
                { title: 'Import', href: '#' },
            ]}
        >
            <Head title="Import Siswa" />

            <div className="mx-auto max-w-2xl space-y-6 p-6">
                <Link
                    href={route('siswa.index')}
                    className="inline-flex items-center text-sm font-medium text-slate-500 transition hover:text-slate-900 dark:hover:text-white"
                >
                    <ArrowLeft className="mr-1 h-4 w-4" />
                    Kembali ke Data Siswa
                </Link>

                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <div className="border-b border-slate-200 p-6 dark:border-slate-800">
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Import Data Siswa</h2>
                        <p className="mt-1 text-sm text-slate-500">Import siswa dari file Excel (.xlsx, .xls, .csv)</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6 p-6">
                        <div>
                            <Label htmlFor="file" className="text-slate-700 dark:text-slate-300">
                                Pilih File <span className="text-rose-500">*</span>
                            </Label>
                            <Input
                                id="file"
                                type="file"
                                accept=".xlsx,.xls,.csv"
                                onChange={handleFileChange}
                                className="mt-1"
                            />
                            {errors.file && <p className="mt-1 text-sm text-rose-600">{errors.file}</p>}
                        </div>

                        <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-800/50">
                            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Format Kolom:</h3>
                            <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-slate-600 dark:text-slate-400">
                                <li><strong>Kolom A:</strong> NISN (wajib)</li>
                                <li><strong>Kolom B:</strong> Nama (wajib)</li>
                                <li><strong>Kolom C:</strong> Jenis Kelamin (L/P)</li>
                                <li><strong>Kolom D:</strong> Kelas (1-6)</li>
                                <li><strong>Kolom E:</strong> Status (aktif/lulus/pindah/berhenti)</li>
                                <li><strong>Kolom F:</strong> Bulan Masuk (1-12)</li>
                                <li><strong>Kolom G:</strong> Tahun Masuk (numeric)</li>
                            </ul>
                        </div>

                        <div className="flex justify-end gap-3 border-t border-slate-200 pt-4 dark:border-slate-800">
                            {/* <Link href="/storage/template_import_siswa.xlsx"> */}
                            {/*     <Button variant="outline" type="button"> */}
                            {/*         <Download className="mr-2 h-4 w-4" /> */}
                            {/*         Download Template */}
                            {/*     </Button> */}
                            {/* </Link> */}
                            <a href={route('siswa.import.template')} download>
                                <Button variant="outline" type="button">
                                    <Download className="mr-2 h-4 w-4" />
                                    Download Template
                                </Button>
                            </a>
                            <Button type="submit" disabled={processing || !data.file}>
                                <Upload className="mr-2 h-4 w-4" />
                                {processing ? 'Mengimport...' : 'Import'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
