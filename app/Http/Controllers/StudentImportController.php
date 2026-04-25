<?php

namespace App\Http\Controllers;

use App\Models\Student;
use Illuminate\Http\Request;
use Inertia\Inertia;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Spreadsheet;

class StudentImportController extends Controller
{
    public function create()
    {
        return Inertia::render('siswa/import');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'file' => 'required|file|mimes:xlsx,xls,csv',
        ]);

        $file = $validated['file'];
        $spreadsheet = IOFactory::load($file->getRealPath());
        $sheet = $spreadsheet->getActiveSheet();
        $rows = $sheet->toArray();

        // Skip header row
        array_shift($rows);

        $successCount = 0;
        $errors = [];
        $skippedNisn = [];

        foreach ($rows as $index => $row) {
            // Skip empty rows
            if (empty($row[0]) && empty($row[1])) {
                continue;
            }

            $nisn = trim($row[0]);
            $name = trim($row[1]);
            $gender = isset($row[2]) ? strtoupper(trim($row[2])) : null;

            // Skip if nisn or name is empty
            if (empty($nisn) || empty($name)) {
                $errors[] = 'Baris '.($index + 2).': NISN dan Nama wajib diisi';

                continue;
            }

            // Validate gender
            if ($gender && ! in_array($gender, ['L', 'P'])) {
                $errors[] = 'Baris '.($index + 2).': Jenis Kelamin harus L atau P';

                continue;
            }

            // Check if nisn already exists
            if (Student::where('nisn', $nisn)->exists()) {
                $skippedNisn[] = 'Baris '.($index + 2).': NISN '.$nisn.' sudah terdaftar';

                continue;
            }

            $student = Student::create([
                'nisn' => $nisn,
                'name' => $name,
                'gender' => $gender ?: 'L',
                'class' => isset($row[3]) && is_numeric($row[3]) ? (int) $row[3] : null,
                'status' => isset($row[4]) ? strtolower(trim($row[4])) : 'aktif',
                'entry_month' => isset($row[5]) && is_numeric($row[5]) ? (int) $row[5] : date('n'),
                'entry_year' => isset($row[6]) && is_numeric($row[6]) ? (int) $row[6] : date('Y'),
            ]);

            $successCount++;
        }

        $message = $successCount.' siswa berhasil ditambahkan';
        if (! empty($errors)) {
            $message .= '. '.count($errors).' errors: '.implode(', ', $errors);
        }
        if (! empty($skippedNisn)) {
            $message .= '. '.count($skippedNisn).' skipped (duplicate NISN): '.implode(', ', array_slice($skippedNisn, 0, 5));
            if (count($skippedNisn) > 5) {
                $message .= '...';
            }
        }

        return redirect()->route('siswa.index')->with('success', $message);
    }

    public function template()
    {
        $path = base_path('public/template_import_siswa.xlsx');

        if (! file_exists($path)) {
            return response()->json(['error' => 'Template file not found'], 404);
        }

        return response()->download($path, 'template_import_siswa.xlsx', [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.xlsx',
            'Content-Disposition' => 'attachment; filename="template_import_siswa.xlsx"',
        ]);
    }

    public function export()
    {
        $students = Student::orderBy('name')->get();

        $spreadsheet = new Spreadsheet;
        $sheet = $spreadsheet->getActiveSheet();

        $headers = ['NISN', 'Nama', 'Jenis Kelamin', 'Kelas', 'Status', 'Bulan Masuk', 'Tahun Masuk'];
        $sheet->fromArray($headers, null, 'A1');

        $data = $students->map(function ($student) {
            return [
                $student->nisn,
                $student->name,
                $student->gender === 'L' ? 'Laki-laki' : 'Perempuan',
                $student->class ?: '-',
                ucfirst($student->status),
                $student->entry_month,
                $student->entry_year,
            ];
        })->toArray();

        $sheet->fromArray($data, null, 'A2');

        foreach (range('A', 'G') as $col) {
            $sheet->getColumnDimension($col)->setAutoSize(true);
        }

        $filename = 'data_siswa_'.date('Y-m-d').'.xlsx';

        header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.xlsx');
        header('Content-Disposition: attachment;filename="'.$filename.'"');
        header('Cache-Control: max-age=0');

        $writer = IOFactory::createWriter($spreadsheet, 'Xlsx');
        $writer->save('php://output');
        exit;
    }
}
