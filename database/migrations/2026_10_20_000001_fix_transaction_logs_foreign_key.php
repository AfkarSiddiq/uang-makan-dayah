<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Ubah foreign key constraint transaction_logs agar tidak cascade delete
        if (DB::getDriverName() === 'mysql') {
            Schema::table('transaction_logs', function (Blueprint $table) {
                $table->dropForeign(['transaction_id']);
                $table->unsignedBigInteger('transaction_id')->nullable()->change();
                $table->foreign('transaction_id')
                    ->references('id')
                    ->on('transactions')
                    ->nullOnDelete();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (DB::getDriverName() === 'mysql') {
            Schema::table('transaction_logs', function (Blueprint $table) {
                $table->dropForeign(['transaction_id']);
                $table->foreign('transaction_id')
                    ->references('id')
                    ->on('transactions')
                    ->cascadeOnDelete();
            });
        }
    }
};
