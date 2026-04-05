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
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            
            // Menyambungkan siapa yang bayar (Bisa null jika ini adalah pengeluaran sekolah)
            $table->foreignId('student_id')->nullable()->constrained('students')->nullOnDelete();
            
            $table->enum('type', ['in', 'out']); // in = Pemasukan, out = Pengeluaran
            $table->string('category'); // Misal: 'SPP', 'Uang Pangkal', 'Listrik', 'Gaji'
            $table->integer('amount');  // Jumlah uang riil yang diterima/dikeluarkan
            
            $table->string('note')->nullable(); // Catatan: "Terima dari Budi bayar berantai"
            $table->date('transaction_date');
            
            // Admin/User yang menginput data ini
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
