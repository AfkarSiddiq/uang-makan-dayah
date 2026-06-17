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
        Schema::create('students', function (Blueprint $table) {
            $table->id();
            $table->string('nisn')->unique();
            $table->string('name');
            $table->enum('gender', ['L', 'P']);
            $table->enum('class', ['1', '2', '3', '4', '5', '6'])->nullable();
            $table->enum('status', ['aktif', 'lulus', 'pindah', 'berhenti'])->default('aktif');

            // Waktu Masuk
            $table->integer('entry_month');
            $table->year('entry_year');

            // Waktu Keluar (Bisa null karena mungkin belum keluar)
            $table->integer('exit_month')->nullable();
            $table->year('exit_year')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('students');
    }
};
