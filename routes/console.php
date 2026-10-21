<?php

use App\Console\Commands\ReconcileUangMakanPayments;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('spp:reconcile {--student= : Filter berdasarkan ID Santri} {--dry-run : Hanya simulasi tanpa mengubah data}', function () {
    $this->call(ReconcileUangMakanPayments::class, [
        '--student' => $this->option('student'),
        '--dry-run' => $this->option('dry-run'),
    ]);
})->purpose('Alias untuk rekonsiliasi pembayaran tagihan bulanan santri (spp_payments)');

