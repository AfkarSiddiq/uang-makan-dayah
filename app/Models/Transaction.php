<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Transaction extends Model
{
    protected $fillable = [
        'transaction_id',
        'student_id',
        'type',
        'category',
        'amount',
        'note',
        'transaction_date',
        'user_id'
    ];

    protected $casts = [
        'transaction_date' => 'date',
    ];

    // Relasi: Uang ini dari Siswa siapa? (Bisa null jika ini uang keluar sekolah)
    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    // Relasi: Siapa Admin/Bendahara yang mencatat uang ini?
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
