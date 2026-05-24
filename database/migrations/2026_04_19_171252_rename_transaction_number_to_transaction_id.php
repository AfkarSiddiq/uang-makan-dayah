<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement('ALTER TABLE transactions CHANGE COLUMN transaction_number transaction_id VARCHAR(255) NULL');
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE transactions CHANGE COLUMN transaction_id transaction_number VARCHAR(255) NULL');
    }
};
