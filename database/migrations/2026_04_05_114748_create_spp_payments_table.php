<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('spp_payments', function (Blueprint $table) {
            $table->id();
            
            // 1. Relasi ke tabel Siswa
            $table->foreignId('student_id')->constrained('students')->cascadeOnDelete();
            
            // 2. Relasi ke tabel Bulan (TIDAK LAGI pakai kolom month & year langsung)
            $table->foreignId('spp_month_id')->constrained('spp_months')->cascadeOnDelete();
            
            $table->integer('paid_amount')->default(0); 
            
            $table->enum('status', ['partial', 'paid']);
            $table->dateTime('paid_at')->nullable(); 
            
            $table->timestamps();
            
            // 3. Mencegah 1 siswa ditagih 2 kali di bulan/periode yang sama
            $table->unique(['student_id', 'spp_month_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('spp_payments');
    }
};