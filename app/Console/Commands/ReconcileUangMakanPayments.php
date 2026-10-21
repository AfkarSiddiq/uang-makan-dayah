<?php

namespace App\Console\Commands;

use App\Http\Controllers\PaymentController;
use App\Models\SppPayment;
use App\Models\Student;
use App\Models\Transaction;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class ReconcileUangMakanPayments extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'uang-makan:reconcile
                            {--student= : Filter berdasarkan ID Santri}
                            {--dry-run : Hanya simulasi tanpa mengubah data}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Rekonsiliasi transaksi Uang Makan Bulanan ke tabel alokasi tagihan santri (spp_payments)';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('=== REKONSILIASI PEMBAYARAN UANG MAKAN BULANAN ===');

        $isDryRun = (bool) $this->option('dry-run');
        if ($isDryRun) {
            $this->warn('Mode DRY RUN aktif. Tidak ada perubahan yang disimpan ke database.');
        }

        $query = Transaction::query()
            ->where('type', 'in')
            ->where('category', 'Uang Makan Bulanan')
            ->whereNotNull('student_id')
            ->orderBy('transaction_date', 'asc')
            ->orderBy('id', 'asc');

        if ($studentId = $this->option('student')) {
            $query->where('student_id', $studentId);
        }

        $transactions = $query->get();

        if ($transactions->isEmpty()) {
            $this->info('Tidak ditemukan transaksi Uang Makan Bulanan yang perlu diproses.');
            return Command::SUCCESS;
        }

        $paymentController = new PaymentController();
        $totalScanned = $transactions->count();
        $totalReconciled = 0;
        $totalAmountAllocated = 0;

        $tableRows = [];

        foreach ($transactions as $transaction) {
            $student = Student::find($transaction->student_id);
            if (! $student) {
                $this->warn("Transaksi #{$transaction->id} diabaikan: Santri ID {$transaction->student_id} tidak ditemukan.");
                continue;
            }

            // Hitung total yang sudah teralokasi dengan transaction_id ini
            $allocatedAmount = SppPayment::where('transaction_id', $transaction->id)->sum('paid_amount');
            $unallocatedAmount = $transaction->amount - $allocatedAmount;

            if ($unallocatedAmount <= 0) {
                continue;
            }

            $totalReconciled++;
            $totalAmountAllocated += $unallocatedAmount;

            if ($isDryRun) {
                $tableRows[] = [
                    $transaction->id,
                    $transaction->transaction_id,
                    $student->name,
                    'Rp ' . number_format($transaction->amount, 0, ',', '.'),
                    'Rp ' . number_format($unallocatedAmount, 0, ',', '.'),
                    '[SIMULASI] Akan dialokasikan',
                ];
                continue;
            }

            // Eksekusi alokasi nyata
            DB::transaction(function () use ($paymentController, $student, $unallocatedAmount, $transaction, &$tableRows) {
                $monthNotes = $paymentController->allocateSppPayment($student->id, $unallocatedAmount, $transaction->id);

                if (! empty($monthNotes)) {
                    $baseNote = preg_replace('/\s*\|\s*Rincian (?:Uang Makan Bulanan|SPP):.*$/', '', $transaction->note ?? '');
                    $notePrefix = ! empty($baseNote) ? $baseNote . ' | ' : '';
                    $transaction->update([
                        'note' => $notePrefix . 'Rincian Uang Makan Bulanan: ' . implode(', ', $monthNotes),
                    ]);
                }

                $tableRows[] = [
                    $transaction->id,
                    $transaction->transaction_id,
                    $student->name,
                    'Rp ' . number_format($transaction->amount, 0, ',', '.'),
                    'Rp ' . number_format($unallocatedAmount, 0, ',', '.'),
                    ! empty($monthNotes) ? implode(', ', $monthNotes) : 'Bulan penuh / sudah lunas',
                ];
            });
        }

        if (! empty($tableRows)) {
            $this->table(
                ['ID', 'No Transaksi', 'Santri', 'Total Transaksi', 'Teralokasikan', 'Keterangan Alokasi'],
                $tableRows
            );
        }

        $this->newLine();
        $this->info("Total Transaksi Diperiksa: {$totalScanned}");
        $this->info("Total Transaksi Direkonsiliasi: {$totalReconciled}");
        $this->info("Total Dana Dialokasikan: Rp " . number_format($totalAmountAllocated, 0, ',', '.'));

        return Command::SUCCESS;
    }
}
