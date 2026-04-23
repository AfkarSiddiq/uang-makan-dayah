<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SppPayment extends Model
{
    protected $fillable = [
        'student_id',
        'spp_month_id',
        'amount',
        'paid_amount',
        'status',
        'paid_at'
    ];

    // Casting agar tipe data tanggal otomatis dibaca dengan benar oleh Laravel/React
    protected $casts = [
        'paid_at' => 'datetime',
    ];

    // Relasi: Tagihan ini MILIK 1 Siswa
    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    // Tagihan ini merujuk ke 1 Periode Bulan
    public function sppMonth()
    {
        return $this->belongsTo(SppMonth::class);
    }

    public function getAmountAttribute()
    {
        // Mengambil harga dari relasi sppMonth
        return $this->sppMonth->amount;
    }

    // Pastikan sppMonth di-load agar tidak lambat (Eager Loading)
    protected $with = ['sppMonth'];
}
