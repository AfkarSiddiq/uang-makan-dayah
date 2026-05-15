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
        Schema::create('transaction_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('transaction_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained(); // Siapa admin yang mengubah?
            $table->string('action'); // Isi: 'updated' atau 'deleted'
            $table->json('old_values')->nullable(); // Data sebelum diedit
            $table->json('new_values')->nullable(); // Data setelah diedit
            $table->string('note')->nullable(); // Alasan mengubah (opsional)
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transaction_logs');
    }
};
