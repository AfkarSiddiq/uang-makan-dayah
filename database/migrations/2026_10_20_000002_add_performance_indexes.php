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
        Schema::table('transactions', function (Blueprint $table) {
            $table->index(['type', 'transaction_date'], 'transactions_type_date_idx');
            $table->index('category', 'transactions_category_idx');
            $table->index('transaction_date', 'transactions_date_idx');
        });

        Schema::table('students', function (Blueprint $table) {
            $table->index(['status', 'gender', 'class'], 'students_status_gender_class_idx');
            $table->index('name', 'students_name_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropIndex('transactions_type_date_idx');
            $table->dropIndex('transactions_category_idx');
            $table->dropIndex('transactions_date_idx');
        });

        Schema::table('students', function (Blueprint $table) {
            $table->dropIndex('students_status_gender_class_idx');
            $table->dropIndex('students_name_idx');
        });
    }
};
