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
                'student_type' => isset($row[7]) ? strtolower(trim($row[7])) : 'umum',
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
        $spreadsheet = new Spreadsheet;
        $sheet = $spreadsheet->getActiveSheet();

        $headers = ['NISN', 'Nama', 'Jenis Kelamin (L/P)', 'Kelas (1-6)', 'Status (aktif/lulus/pindah/berhenti)', 'Bulan Masuk (1-12)', 'Tahun Masuk', 'Jenis Siswa (umum/yatim/piatu/yatim_piatu)'];
        $sheet->fromArray($headers, null, 'A1');

        $data = [
            ['1234567890', 'Contoh Nama', 'L', '1', 'aktif', '1', '2025', 'umum'],
        ];
        $sheet->fromArray($data, null, 'A2');

        foreach (range('A', 'H') as $col) {
            $sheet->getColumnDimension($col)->setWidth(18);
        }

        header('Cache-Control: max-age=0');
        header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        header('Content-Disposition: attachment; filename="template_import_siswa.xlsx"');

        $writer = IOFactory::createWriter($spreadsheet, 'Xlsx');
        $writer->save('php://output');
        exit;
    }

    public function export()
    {
        $students = Student::orderBy('name')->get();

        $spreadsheet = new Spreadsheet;
        $sheet = $spreadsheet->getActiveSheet();

        $headers = ['NISN', 'Nama', 'Jenis Kelamin', 'Kelas', 'Status', 'Bulan Masuk', 'Tahun Masuk', 'Jenis Siswa'];
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
                ucfirst(str_replace('_', ' ', $student->student_type)),
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
