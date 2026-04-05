<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('spp_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('students')->cascadeOnDelete();
            
            $table->integer('month'); 
            $table->year('year');
            
            $table->integer('amount');       // Wajib bayar (Misal: 500000)
            $table->integer('paid_amount')->default(0); // Yang sudah terbayar
            
            $table->enum('status', ['unpaid', 'partial', 'paid'])->default('unpaid');
            $table->dateTime('paid_at')->nullable(); // Tanggal terakhir diangsur/lunas
            
            $table->timestamps();
            
            // Mencegah duplikasi tagihan di bulan dan tahun yang sama untuk 1 anak
            $table->unique(['student_id', 'month', 'year']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('spp_payments');
    }
};
