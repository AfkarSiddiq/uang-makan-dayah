<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Transaction;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Spreadsheet;

class TransactionImportController extends Controller
{
    public function create()
    {
        return Inertia::render('transaction/import');
    }

    public function store(Request $request)
    {
        $request->validate([
            'file' => ['required', 'mimes:xlsx,xls', 'max:10240'],
        ]);

        $file = $request->file('file');
        $spreadsheet = IOFactory::load($file->getPathName());
        $sheet = $spreadsheet->getActiveSheet();
        $rows = $sheet->toArray();

        $errors = [];
        $skippedIds = [];
        $successCount = 0;

        foreach ($rows as $index => $row) {
            if ($index === 0) {
                continue;
            }

            if (empty($row[0]) && empty($row[1])) {
                continue;
            }

            $transactionId = trim($row[0]);
            $type = strtolower(trim($row[1])) === 'masuk' ? 'in' : (strtolower(trim($row[1])) === 'keluar' ? 'out' : null);
            $category = trim($row[2]);
            $amount = is_numeric($row[3] ?? null) ? (int) $row[3] : null;
            $transactionDate = trim($row[4]);
            $note = trim($row[5] ?? '');

            if (empty($transactionId) || empty($type) || empty($category) || empty($amount)) {
                $errors[] = 'Baris '.($index + 1).': Data tidak lengkap';

                continue;
            }

            if (! in_array($type, ['in', 'out'])) {
                $errors[] = 'Baris '.($index + 1).': Tipe harus "masuk" atau "keluar"';

                continue;
            }

            $validCategories = Category::where('is_active', true)->pluck('name')->toArray();
            if (! in_array($category, $validCategories)) {
                $errors[] = 'Baris '.($index + 1).': Kategori tidak valid';

                continue;
            }

            try {
                $parsedDate = Carbon::parse($transactionDate);
            } catch (\Exception $e) {
                $errors[] = 'Baris '.($index + 1).': Format tanggal tidak valid';

                continue;
            }

            if (Transaction::where('transaction_id', $transactionId)->exists()) {
                $skippedIds[] = 'Baris '.($index + 1).': ID '.$transactionId.' sudah ada';

                continue;
            }

            Transaction::create([
                'transaction_id' => $transactionId,
                'type' => $type,
                'category' => $category,
                'amount' => $amount,
                'transaction_date' => $parsedDate->format('Y-m-d'),
                'note' => $note,
                'user_id' => auth()->id(),
            ]);

            $successCount++;
        }

        $message = $successCount.' transaksi berhasil diimport';
        if (! empty($skippedIds)) {
            $message .= '. '.count($skippedIds).' duplicate: '.implode(', ', array_slice($skippedIds, 0, 3));
            if (count($skippedIds) > 3) {
                $message .= '...';
            }
        }
        if (! empty($errors)) {
            $message .= '. '.count($errors).' error: '.implode(', ', array_slice($errors, 0, 3));
            if (count($errors) > 3) {
                $message .= '...';
            }
        }

        return redirect()->route('payment.index')->with('success', $message);
    }

    public function template()
    {
        $path = base_path('public/template_import_transaksi.xlsx');

        if (! file_exists($path)) {
            return response()->json(['error' => 'Template file not found'], 404);
        }

        return response()->download($path, 'template_import_transaksi.xlsx', [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.xlsx',
            'Content-Disposition' => 'attachment; filename="template_import_transaksi.xlsx"',
        ]);
    }

    public function export(Request $request)
    {
        $query = Transaction::with('student');

        if ($request->filled('date_from')) {
            $query->where('transaction_date', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->where('transaction_date', '<=', $request->date_to);
        }

        $transactions = $query->orderBy('transaction_date', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();

        $spreadsheet = new Spreadsheet;
        $sheet = $spreadsheet->getActiveSheet();

        $sheet->setCellValue('A1', 'ID Transaksi');
        $sheet->setCellValue('B1', 'Tipe');
        $sheet->setCellValue('C1', 'Kategori');
        $sheet->setCellValue('D1', 'Jumlah');
        $sheet->setCellValue('E1', 'Tanggal');
        $sheet->setCellValue('F1', 'Catatan');
        $sheet->setCellValue('G1', 'Siswa');

        $row = 2;
        foreach ($transactions as $transaction) {
            $sheet->setCellValue('A'.$row, $transaction->transaction_id);
            $sheet->setCellValue('B'.$row, $transaction->type === 'in' ? 'Masuk' : 'Keluar');
            $sheet->setCellValue('C'.$row, $transaction->category);
            $sheet->setCellValue('D'.$row, $transaction->amount);
            $sheet->setCellValue('E'.$row, $transaction->transaction_date->format('d/m/Y'));
            $sheet->setCellValue('F'.$row, $transaction->note ?? '');
            $sheet->setCellValue('G'.$row, $transaction->student ? $transaction->student->name.' - '.$transaction->student->nisn : '-');
            $row++;
        }

        foreach (range('A', 'G') as $col) {
            $sheet->getColumnDimension($col)->setAutoSize(true);
        }

        $filename = 'data_transaksi_'.date('Y-m-d').'.xlsx';

        header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.xlsx');
        header('Content-Disposition: attachment;filename="'.$filename.'"');
        header('Cache-Control: max-age=0');

        $writer = IOFactory::createWriter($spreadsheet, 'Xlsx');
        $writer->save('php://output');
        exit;
    }
}
