<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SppMonth extends Model
{
    use HasFactory;

    protected $fillable = ['month', 'year', 'amount'];

    protected $appends = ['name'];

    public function getNameAttribute(): string
    {
        $months = [
            1 => 'Januari', 2 => 'Februari', 3 => 'Maret', 4 => 'April',
            5 => 'Mei', 6 => 'Juni', 7 => 'Juli', 8 => 'Agustus',
            9 => 'September', 10 => 'Oktober', 11 => 'November', 12 => 'Desember',
        ];

        return $months[(int) $this->month] ?? (string) $this->month;
    }

    // 1 Bulan memiliki banyak Tagihan Siswa
    public function payments()
    {
        return $this->hasMany(SppPayment::class);
    }

    /**
     * Pastikan master SPP untuk tahun ajaran tertentu (dari tahun $fromYear hingga $toYear)
     * sudah terbuat di tabel spp_months.
     */
    public static function ensureAcademicYearsExist(int $fromYear, ?int $toYear = null): void
    {
        $currentMonth = (int) date('n');
        $currentCalendarYear = (int) date('Y');
        $currentAcademicYear = ($currentMonth >= 7) ? $currentCalendarYear : $currentCalendarYear - 1;

        $targetEndYear = $toYear ?: max($fromYear, $currentAcademicYear);

        // Ambil nominal dasar terakhir dari database (default Rp 500.000 jika belum ada sama sekali)
        $latestAmount = static::orderBy('year', 'desc')
            ->orderBy('month', 'desc')
            ->value('amount') ?? 500000;

        $bulanAjaran = [7, 8, 9, 10, 11, 12, 1, 2, 3, 4, 5, 6];

        for ($year = $fromYear; $year <= $targetEndYear; $year++) {
            $exists = static::where('month', 7)->where('year', $year)->exists();
            if (! $exists) {
                foreach ($bulanAjaran as $month) {
                    $actualYear = ($month >= 7) ? $year : $year + 1;
                    static::firstOrCreate(
                        [
                            'month' => $month,
                            'year' => $actualYear,
                        ],
                        [
                            'amount' => $latestAmount,
                        ]
                    );
                }
            }
        }
    }
}
