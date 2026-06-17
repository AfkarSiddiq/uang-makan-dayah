<?php

namespace App\Http\Controllers;

use App\Models\SppMonth;
use App\Models\SppPayment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class SppPaymentController extends Controller
{
    public function pengaturanMassal()
    {
        // KARENA DB BARU: Kita ambil data dari tabel master SppMonth.
        // withCount('payments') akan otomatis menghitung berapa siswa yang punya tagihan di bulan itu.
        $ringkasanSPP = SppMonth::withCount('payments as total_siswa')
            ->orderBy('year', 'desc')
            ->orderBy('month', 'asc')
            ->get()
            ->map(function ($item) {
                return [
                    'month' => $item->month,
                    'year' => $item->year,
                    'current_amount' => $item->amount, // Kita ubah namanya agar cocok dengan interface React
                    'total_siswa' => $item->total_siswa,
                ];
            });

        return Inertia::render('spp/pengaturan', [
            'ringkasanSPP' => $ringkasanSPP,
        ]);
    }

    public function generateTahunAjaran(Request $request)
    {
        $request->validate([
            'start_year' => 'required|integer|min:2000',
            'base_amount' => 'required|numeric|min:0',
        ]);

        $tahunMulai = $request->start_year;
        $hargaDefault = $request->base_amount;

        // Urutan bulan ajaran baru (Juli s.d. Juni)
        $bulanAjaran = [7, 8, 9, 10, 11, 12, 1, 2, 3, 4, 5, 6];

        foreach ($bulanAjaran as $bulan) {
            // Jika bulannya 7-12, gunakan tahun mulai. Jika 1-6, gunakan tahun depan.
            $tahunAktual = ($bulan >= 7) ? $tahunMulai : $tahunMulai + 1;

            // firstOrCreate mencegah terjadinya error (duplikat) jika bulan tersebut sudah pernah dibuat
            SppMonth::firstOrCreate(
                [
                    'month' => $bulan,
                    'year' => $tahunAktual,
                ],
                [
                    'amount' => $hargaDefault,
                ]
            );
        }

        return back()->with('success', "Tahun Ajaran $tahunMulai/".($tahunMulai + 1).' berhasil digenerate ke Master SPP!');
    }

    public function bulkUpdateAmount(Request $request)
    {
        $request->validate([
            'month' => 'required|integer',
            'year' => 'required|integer',
            'new_amount' => 'required|numeric|min:0',
        ]);

        // 1. Update harga di tabel master
        $month = SppMonth::where('month', $request->month)
            ->where('year', $request->year)
            ->firstOrFail();

        $month->update(['amount' => $request->new_amount]);

        // 2. Kalkulasi ulang status bagi siswa yang SUDAH PERNAH BAYAR di bulan tersebut
        // Karena sistem Virtual Ledger, kita hanya perlu mengupdate baris yang ada di database saja
        $payments = SppPayment::where('spp_month_id', $month->id)->get();

        foreach ($payments as $payment) {
            if ($payment->paid_amount >= $request->new_amount) {
                // Jika uang yang pernah disetor ternyata masih cukup/lebih dari harga baru
                $payment->update(['status' => 'paid']);
            } elseif ($payment->paid_amount > 0) {
                // Jika uang yang pernah disetor ternyata kurang dari harga baru (Harganya naik)
                $payment->update(['status' => 'partial']);
            }
        }

        return back()->with('success', 'Harga SPP berhasil diperbarui secara global!');
    }
}
