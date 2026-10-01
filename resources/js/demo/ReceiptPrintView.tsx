import React, { useEffect } from 'react';
import { DemoStore, loadDb } from './demo-store';
import { ArrowLeft, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
    paymentId: number;
    onBack: () => void;
}

export function ReceiptPrintView({ paymentId, onBack }: Props) {
    const db = loadDb();
    const tx = db.transactions.find((t) => t.id === Number(paymentId));
    const student = tx?.student_id ? db.students.find((s) => s.id === tx.student_id) : null;
    const user = tx?.user_id ? db.users.find((u) => u.id === tx.user_id) : null;

    const formatRupiah = (val?: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val || 0);
    };

    if (!tx) {
        return (
            <div className="p-8 text-center">
                <p className="text-red-500 font-semibold mb-4">Transaksi tidak ditemukan.</p>
                <Button onClick={onBack}>Kembali</Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-100 p-4 sm:p-8 dark:bg-slate-950">
            {/* Top Bar for screen only */}
            <div className="max-w-2xl mx-auto mb-6 flex items-center justify-between print:hidden">
                <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" /> Kembali
                </Button>
                <Button onClick={() => window.print()} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
                    <Printer className="w-4 h-4" /> Cetak / Print Bukti Transaksi
                </Button>
            </div>

            {/* Receipt Box */}
            <div className="max-w-2xl mx-auto bg-white p-8 sm:p-12 rounded-xl shadow-lg border border-slate-200 text-slate-800 print:border-none print:shadow-none print:p-0">
                {/* Header */}
                <div className="flex items-center gap-4 border-b-4 border-double border-slate-800 pb-4 mb-6">
                    <img src="/minhajussalam.png" alt="Logo" className="w-16 h-16 object-contain" />
                    <div>
                        <p className="text-xs uppercase tracking-widest text-slate-600 font-bold">Pondok Pesantren / Dayah</p>
                        <h1 className="text-2xl font-black text-emerald-800 tracking-wider">MINHAJUSSALAM</h1>
                        <p className="text-xs text-slate-500">Sistem Informasi Pengelolaan Keuangan & Uang Makan Santri</p>
                    </div>
                </div>

                {/* Title */}
                <div className="text-center my-6">
                    <h2 className="text-xl font-bold uppercase tracking-wider underline">BUKTI RESMI TRANSAKSI KAS</h2>
                    <p className="text-xs text-slate-500 mt-1">Nomor: {tx.transaction_id}</p>
                </div>

                {/* Details */}
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-5 mb-6 text-sm space-y-3">
                    <div className="flex justify-between border-b border-slate-200 pb-2">
                        <span className="font-semibold text-slate-600">Tanggal Transaksi:</span>
                        <span className="font-bold text-slate-900">{tx.transaction_date}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200 pb-2">
                        <span className="font-semibold text-slate-600">Jenis Transaksi:</span>
                        <span className={`font-bold uppercase ${tx.type === 'in' ? 'text-emerald-700' : 'text-rose-700'}`}>
                            {tx.type === 'in' ? 'Kas Masuk (Penerimaan)' : 'Kas Keluar (Pengeluaran)'}
                        </span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200 pb-2">
                        <span className="font-semibold text-slate-600">Kategori:</span>
                        <span className="font-bold text-slate-900">{tx.category}</span>
                    </div>
                    {student && (
                        <div className="flex justify-between border-b border-slate-200 pb-2">
                            <span className="font-semibold text-slate-600">Nama Santri:</span>
                            <span className="font-bold text-slate-900">{student.name} (Kelas {student.class || '-'} / NISN {student.nisn})</span>
                        </div>
                    )}
                    <div className="flex justify-between border-b border-slate-200 pb-2">
                        <span className="font-semibold text-slate-600">Keterangan:</span>
                        <span className="text-slate-800 italic">{tx.note || '-'}</span>
                    </div>
                    <div className="flex justify-between pt-2">
                        <span className="font-semibold text-slate-600">Petugas Kasir:</span>
                        <span className="text-slate-800">{user?.name || 'Admin Dayah'}</span>
                    </div>
                </div>

                {/* Amount Highlight */}
                <div className="border-2 border-emerald-600 bg-emerald-50 rounded-xl p-4 text-center mb-8">
                    <p className="text-xs uppercase font-bold text-emerald-800 tracking-wider">Jumlah Total Pembayaran</p>
                    <p className="text-3xl font-extrabold text-emerald-900 mt-1">{formatRupiah(tx.amount)}</p>
                </div>

                {/* Signature */}
                <div className="flex justify-between text-xs text-center mt-12 pt-6">
                    <div>
                        <p className="text-slate-600">Penyetor / Walisantri,</p>
                        <div className="h-16"></div>
                        <p className="font-bold underline text-slate-800">{student ? student.name : '( ............................ )'}</p>
                    </div>
                    <div>
                        <p className="text-slate-600">Petugas Keuangan Dayah,</p>
                        <div className="h-16"></div>
                        <p className="font-bold underline text-slate-800">{user?.name || 'Admin Dayah'}</p>
                    </div>
                </div>

                <div className="mt-8 text-center text-[10px] text-slate-400 border-t border-slate-100 pt-3">
                    Simpan bukti pembayaran ini sebagai tanda bukti sah transaksi di lingkungan Dayah Minhajussalam.
                </div>
            </div>
        </div>
    );
}
