<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TransactionLog extends Model
{
    // Izinkan Laravel mengisi kolom-kolom ini
    protected $fillable = ['transaction_id', 'user_id', 'action', 'old_values', 'new_values', 'note'];

    // Relasi untuk mengetahui siapa Admin yang mengubah
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
