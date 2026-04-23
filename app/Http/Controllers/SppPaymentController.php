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
            'ringkasanSPP' => $ringkasanSPP
        ]);
    }

    public function bulkUpdateAmount(Request $request)
    {
        // 1. Validasi Input
        $request->validate([
            'month' => 'required|integer',
            'year' => 'required|integer',
            'new_amount' => 'required|numeric|min:0',
        ]);

        // 2. Cari bulan di tabel master dan ubah harganya (Hanya 1 baris yang diubah!)
        $month = SppMonth::where('month', $request->month)
            ->where('year', $request->year)
            ->firstOrFail();

        $month->update(['amount' => $request->new_amount]);

        // 3. HITUNG ULANG STATUS SEMUA SISWA DI BULAN TERSEBUT

        // A. Jika uang yang sudah disetor >= harga baru -> LUNAS
        SppPayment::where('spp_month_id', $month->id)
            ->where('paid_amount', '>=', $request->new_amount)
            ->update(['status' => 'paid']);

        // B. Jika uang yang sudah disetor > 0 tapi masih kurang dari harga baru -> MENCICIL (PARTIAL)
        SppPayment::where('spp_month_id', $month->id)
            ->where('paid_amount', '>', 0)
            ->where('paid_amount', '<', $request->new_amount)
            ->update(['status' => 'partial']);

        // C. Jika belum bayar sama sekali (0) -> BELUM BAYAR (UNPAID)
        SppPayment::where('spp_month_id', $month->id)
            ->where('paid_amount', 0)
            ->update(['status' => 'unpaid']);

        return back()->with('success', 'Harga SPP berhasil diperbarui untuk seluruh siswa di bulan tersebut!');
    }
}
