<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Student extends Model
{
    use HasFactory;

    protected $fillable = [
        'nisn',
        'name',
        'gender',
        'class',
        'status',
        'student_type',
        'entry_month',
        'entry_year',
        'exit_month',
        'exit_year',
    ];

    // Relasi: 1 Siswa memiliki BANYAK tagihan SPP
    public function sppPayments(): HasMany
    {
        return $this->hasMany(SppPayment::class);
    }

    // Relasi: 1 Siswa memiliki BANYAK riwayat transaksi (Buku Kas)
    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }

    /**
     * Dapatkan tahun mulai dari tahun ajaran santri masuk (Juli = tahun itu, Jan-Jun = tahun sebelumnya)
     */
    public function getAcademicYearStart(): int
    {
        $month = (int) ($this->entry_month ?: 7);
        $year = (int) ($this->entry_year ?: date('Y'));

        return $month >= 7 ? $year : $year - 1;
    }

    /**
     * Hitung skor linier bulan masuk santri (Tahun * 12 + Bulan)
     */
    public function getEntryScore(): int
    {
        $year = (int) ($this->entry_year ?: ($this->created_at ? $this->created_at->format('Y') : date('Y')));
        $month = (int) ($this->entry_month ?: ($this->created_at ? $this->created_at->format('n') : 7));

        return ($year * 12) + $month;
    }

    /**
     * Hitung skor linier bulan keluar santri jika berstatus non-aktif.
     * Dilengkapi safety fallback jika exit_month/exit_year bernilai null.
     */
    public function getExitScore(): ?int
    {
        if ($this->exit_year && $this->exit_month) {
            return ((int) $this->exit_year * 12) + (int) $this->exit_month;
        }

        if ($this->status && $this->status !== 'aktif') {
            $year = (int) ($this->updated_at ? $this->updated_at->format('Y') : date('Y'));
            $month = (int) ($this->updated_at ? $this->updated_at->format('n') : date('n'));

            return ($year * 12) + $month;
        }

        return null;
    }

    /**
     * Periksa apakah suatu periode (tahun & bulan) wajib ditagihkan ke santri ini.
     */
    public function isMonthBillable(int $year, int $month): bool
    {
        $monthScore = ((int) $year * 12) + (int) $month;

        // 1. Abaikan bulan sebelum santri masuk
        if ($monthScore < $this->getEntryScore()) {
            return false;
        }

        // 2. Rem otomatis: Abaikan bulan setelah santri keluar
        $exitScore = $this->getExitScore();
        if ($exitScore !== null && $monthScore > $exitScore) {
            return false;
        }

        return true;
    }
}
