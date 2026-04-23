<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SppPayment extends Model
{
    protected $fillable = [
        'student_id',
        'month',
        'year',
        'amount',
        'paid_amount',
        'status',
        'paid_at',
    ];

    // Casting agar tipe data tanggal otomatis dibaca dengan benar oleh Laravel/React
    protected $casts = [
        'paid_at' => 'datetime',
    ];

    // Relasi: Tagihan ini MILIK 1 Siswa
    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }
}
