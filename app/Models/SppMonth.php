<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SppMonth extends Model
{
    use HasFactory;

    protected $fillable = ['month', 'year', 'amount'];

    // 1 Bulan memiliki banyak Tagihan Siswa
    public function payments()
    {
        return $this->hasMany(SppPayment::class);
    }
}
