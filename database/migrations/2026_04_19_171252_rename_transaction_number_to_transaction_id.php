<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('transactions', function ($table) {
            $table->renameColumn('transaction_number', 'transaction_id');
        });
    }

    public function down(): void
    {
        Schema::table('transactions', function ($table) {
            $table->renameColumn('transaction_id', 'transaction_number');
        });
    }
};
