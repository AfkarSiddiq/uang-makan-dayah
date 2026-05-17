<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Auth;

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
        'user_id',
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

    public function logs()
    {
        // Kita urutkan dari yang terbaru agar log terakhir muncul di atas
        return $this->hasMany(TransactionLog::class)->orderBy('created_at', 'desc');
    }

    protected static function booted()
    {
        // 1. Dijalankan OTOMATIS sesaat setelah transaksi di-UPDATE
        static::updated(function ($transaction) {
            
            // Cek apakah benar-benar ada data yang berubah (bukan cuma klik save tapi ga diganti)
            if ($transaction->wasChanged()) {
                
                // Ambil daftar kolom apa saja yang berubah
                $changes = $transaction->getChanges();
                $original = [];
                
                // Cari tahu nilai lamanya untuk kolom yang berubah tersebut
                foreach ($changes as $key => $value) {
                    $original[$key] = $transaction->getOriginal($key);
                }

                \App\Models\TransactionLog::create([
                    'transaction_id' => $transaction->id,
                    'user_id'        => Auth::id(), // Tangkap ID admin yang sedang login
                    'action'         => 'updated',
                    'old_values'     => json_encode($original),
                    'new_values'     => json_encode($changes),
                ]);
            }
        });

        // 2. Dijalankan OTOMATIS sesaat sebelum transaksi di-DELETE
        static::deleting(function ($transaction) {
            \App\Models\TransactionLog::create([
                'transaction_id' => $transaction->id,
                'user_id'        => Auth::id(),
                'action'         => 'deleted',
                'old_values'     => json_encode($transaction->toArray()), // Simpan semua data sebelum musnah
                'new_values'     => null,
            ]);
        });
    }
}
