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
}
