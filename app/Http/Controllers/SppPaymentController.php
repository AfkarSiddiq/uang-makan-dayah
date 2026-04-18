<?php

namespace App\Http\Controllers;

use App\Models\SppPayment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SppPaymentController extends Controller
{
    public function pengaturanMassal()
    {
        // Mengelompokkan data tagihan berdasarkan Bulan dan Tahun
        // Kita ambil "max(amount)" sebagai perwakilan harga normal bulan tersebut
        $ringkasanSPP = SppPayment::selectRaw('month, year, max(amount) as current_amount, count(*) as total_siswa')
            ->groupBy('month', 'year')
            ->orderBy('year', 'desc')
            ->orderBy('month', 'asc')
            ->get();

        return \Inertia\Inertia::render('spp/pengaturan', [
            'ringkasanSPP' => $ringkasanSPP
        ]);
    }
    
    public function bulkUpdateAmount(Request $request)
    {
        // 1. Validasi input
        $request->validate([
            'month' => 'required|integer|between:1,12',
            'year' => 'required|integer',
            'new_amount' => 'required|numeric|min:0',
        ]);

        // 2. Gunakan Transaction agar aman
        DB::transaction(function () use ($request) {

            // Ambil SEMUA tagihan di bulan dan tahun yang dipilih
            $spps = SppPayment::where('month', $request->month)
                ->where('year', $request->year)
                ->get();

            // Lakukan perulangan untuk mengubah harga dan cek status
            foreach ($spps as $spp) {
                $spp->amount = $request->new_amount;

                // Hitung ulang status (Sangat penting!)
                if ($spp->amount == 0) {
                    $spp->status = 'paid'; // Jika digratiskan, otomatis lunas
                    if (!$spp->paid_at)
                        $spp->paid_at = now();
                } elseif ($spp->paid_amount >= $spp->amount) {
                    $spp->status = 'paid'; // Jika uang yang masuk ternyata cukup/lebih
                    if (!$spp->paid_at)
                        $spp->paid_at = now();
                } elseif ($spp->paid_amount > 0 && $spp->paid_amount < $spp->amount) {
                    $spp->status = 'partial'; // Masih kurang
                } else {
                    $spp->status = 'unpaid'; // Belum bayar sama sekali
                }

                $spp->save();
            }
        });

        return back()->with('success', "Berhasil! Tagihan bulan {$request->month}/{$request->year} untuk seluruh siswa telah diubah menjadi Rp " . number_format($request->new_amount, 0, ',', '.'));
    }
}
