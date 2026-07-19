import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, Download, Upload, FileSpreadsheet } from 'lucide-react';
import { useState } from 'react';
import * as XLSX from 'xlsx';

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

    const [previewData, setPreviewData] = useState<any[]>([]);
    const [previewError, setPreviewError] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('file', file);
            setPreviewError(null);
            setPreviewData([]);
            
            try {
                const reader = new FileReader();
                reader.onload = (event) => {
                    try {
                        const buffer = event.target?.result;
                        const workbook = XLSX.read(buffer, { type: 'array' });
                        const firstSheetName = workbook.SheetNames[0];
                        const worksheet = workbook.Sheets[firstSheetName];
                        const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                        
                        const validRows = json.filter((row: any) => Array.isArray(row) && row.length > 0);
                        setPreviewData(validRows.slice(0, 6));
                    } catch (err) {
                        setPreviewError("Gagal membaca file Excel. Pastikan formatnya benar (.xlsx atau .xls).");
                    }
                };
                reader.readAsArrayBuffer(file);
            } catch (err) {
                setPreviewError("Gagal memproses file.");
            }
        } else {
            setData('file', null);
            setPreviewData([]);
            setPreviewError(null);
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

            <div className="mx-auto w-full min-w-0 max-w-2xl space-y-4 sm:space-y-6 p-4 sm:p-6">
                <Link
                    href={route('siswa.index')}
                    className="inline-flex items-center text-sm font-medium text-muted-foreground transition hover:text-foreground dark:hover:text-white"
                >
                    <ArrowLeft className="mr-1 h-4 w-4" />
                    Kembali ke Data Siswa
                </Link>

                <div className="overflow-hidden rounded-xl border border-border bg-white shadow-sm dark:border-slate-800 dark:bg-card">
                    <div className="border-b border-border p-5 sm:p-6 dark:border-slate-800">
                        <h2 className="text-base sm:text-lg font-semibold text-foreground dark:text-white">Import Data Siswa</h2>
                        <p className="mt-1 text-xs sm:text-sm text-muted-foreground">Import siswa dari file Excel (.xlsx, .xls, .csv)</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6 p-5 sm:p-6">
                        <div>
                            <Label htmlFor="file" className="text-foreground/90 dark:text-slate-300">
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
                            <h3 className="text-sm font-semibold text-foreground dark:text-white">Format Kolom:</h3>
                            <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-slate-600 dark:text-muted-foreground">
                                <li><strong>Kolom A:</strong> NISN (wajib)</li>
                                <li><strong>Kolom B:</strong> Nama (wajib)</li>
                                <li><strong>Kolom C:</strong> Jenis Kelamin (L/P)</li>
                                <li><strong>Kolom D:</strong> Kelas (1-6)</li>
                                <li><strong>Kolom E:</strong> Status (aktif/lulus/pindah/berhenti)</li>
                                <li><strong>Kolom F:</strong> Bulan Masuk (1-12)</li>
                                <li><strong>Kolom G:</strong> Tahun Masuk (numeric)</li>
                            </ul>
                        </div>
                        
                        {previewError && (
                            <div className="rounded-lg bg-rose-50 p-4 text-sm text-rose-600 border border-rose-100 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900/50">
                                {previewError}
                            </div>
                        )}

                        {previewData.length > 1 && (
                            <div className="space-y-2 sm:space-y-3">
                                <h3 className="text-xs sm:text-sm font-semibold flex items-center gap-2 text-foreground dark:text-white">
                                    <FileSpreadsheet className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                    Preview Data (5 Baris Pertama):
                                </h3>
                                <div className="w-full overflow-hidden rounded-xl border border-border bg-white shadow-sm dark:border-slate-800 dark:bg-card">
                                    <div className="overflow-x-auto w-full">
                                        <table className="w-full text-left text-xs sm:text-sm">
                                        <thead className="bg-slate-50 text-slate-700 dark:bg-slate-800/50 dark:text-slate-300">
                                            <tr>
                                                <th className="px-4 py-2.5 w-10 text-center font-semibold text-muted-foreground border-r border-border dark:border-slate-800">#</th>
                                                {previewData[0].map((cell: any, i: number) => (
                                                    <th key={i} className="whitespace-nowrap px-4 py-2.5 font-semibold">
                                                        {cell !== undefined && cell !== null ? String(cell) : `Kolom ${i+1}`}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border dark:divide-slate-800">
                                            {previewData.slice(1).map((row: any, rowIndex: number) => (
                                                <tr key={rowIndex} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                                    <td className="px-4 py-2 text-center text-xs font-medium text-muted-foreground border-r border-border dark:border-slate-800">
                                                        {rowIndex + 1}
                                                    </td>
                                                    {previewData[0].map((_: any, cellIndex: number) => (
                                                        <td key={cellIndex} className="whitespace-nowrap px-4 py-2.5 text-muted-foreground">
                                                            {row[cellIndex] !== undefined && row[cellIndex] !== null ? String(row[cellIndex]) : '-'}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 border-t border-border pt-5 dark:border-slate-800">
                            {/* <Link href="/storage/template_import_siswa.xlsx"> */}
                            {/*     <Button variant="outline" type="button" className="w-full sm:w-auto"> */}
                            {/*         <Download className="mr-2 h-4 w-4" /> */}
                            {/*         Download Template */}
                            {/*     </Button> */}
                            {/* </Link> */}
                            <a href={route('siswa.import.template')} download className="w-full sm:w-auto">
                                <Button variant="outline" type="button" className="w-full">
                                    <Download className="mr-2 h-4 w-4" />
                                    Download Template
                                </Button>
                            </a>
                            <Button type="submit" disabled={processing || !data.file} className="w-full sm:w-auto">
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
