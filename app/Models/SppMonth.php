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
}
