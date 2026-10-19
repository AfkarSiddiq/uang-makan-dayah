<?php

namespace App\Http\Controllers;

use App\Models\SppMonth;
use App\Models\Student;
use Illuminate\Http\Request;
use Inertia\Inertia;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Spreadsheet;

class TuitionArrearsController extends Controller
{
    public function index(Request $request)
    {
        $selectedMonth = $request->input('month');

        // Ambil batas waktu saat ini (Skor)
        $currentYear = (int) date('Y');
        $currentMonth = (int) date('n');
        $currentScore = ($currentYear * 12) + $currentMonth;

        $sppMonths = SppMonth::orderBy('year', 'asc')->orderBy('month', 'asc')->get();

        // Hitung tunggakan untuk SEMUA siswa (aktif maupun non-aktif/alumni yang masih punya tunggakan)
        $studentsWithArrears = $this->calculateArrearsForStudents(Student::query());

        // Hitung statistik untuk Dashboard/Header atas
        $totalStudentsWithArrears = count($studentsWithArrears);
        $totalArrearsAmountGlobal = array_sum(array_column($studentsWithArrears, 'total_arrears'));
        $activeStudentsCount = count(array_filter($studentsWithArrears, fn ($s) => $s['status'] === 'aktif'));
        $inactiveStudentsCount = count(array_filter($studentsWithArrears, fn ($s) => $s['status'] !== 'aktif'));

        // Siapkan data dropdown Export per Bulan (Bulan yang sudah ada masternya di masa lalu/sekarang)
        $availableMonths = $sppMonths->filter(function ($month) use ($currentScore) {
            $score = ($month->year * 12) + $month->month;

            return $score <= $currentScore;
        })->sortByDesc(function ($month) {
            return ($month->year * 12) + $month->month; // Urutkan dari terbaru ke terlama
        })->map(function ($month) {
            return [
                'id' => $month->id,
                'month' => $month->month,
                'year' => $month->year,
                'label' => $this->getMonthName($month->month).' '.$month->year,
            ];
        })->values();

        // Render ke Inertia
        return Inertia::render('tuition-arrears/index', [
            'students' => array_values($studentsWithArrears),
            'summary' => [
                'total_students' => $totalStudentsWithArrears,
                'total_arrears' => $totalArrearsAmountGlobal,
                'active_students_count' => $activeStudentsCount,
                'inactive_students_count' => $inactiveStudentsCount,
            ],
            'availableMonths' => $availableMonths,
            'selectedMonth' => $selectedMonth,
        ]);
    }

    private function calculateArrearsForStudents($studentsQuery)
    {
        $currentYear = (int) date('Y');
        $currentMonth = (int) date('n');
        $currentScore = ($currentYear * 12) + $currentMonth;

        $sppMonths = SppMonth::orderBy('year', 'asc')->orderBy('month', 'asc')->get();
        $allStudents = $studentsQuery->select([
            'id', 'nisn', 'name', 'gender', 'class', 'status',
            'entry_month', 'entry_year', 'exit_month', 'exit_year', 'updated_at',
        ])->with(['sppPayments' => function ($q) {
            $q->select(['id', 'student_id', 'spp_month_id', 'paid_amount', 'status']);
        }])->get();

        $studentsWithArrears = [];

        foreach ($allStudents as $student) {
            $entryScore = ($student->entry_year * 12) + $student->entry_month;

            // Hitung Exit Score jika anak ini sudah ada info lulus/keluar atau status non-aktif
            $exitScore = null;
            if ($student->exit_year && $student->exit_month) {
                $exitScore = ($student->exit_year * 12) + $student->exit_month;
            } elseif ($student->status !== 'aktif') {
                $exitScore = ((int) $student->updated_at->format('Y') * 12) + (int) $student->updated_at->format('n');
            }

            $totalArrearsAmount = 0;
            $unpaidMonthsList = [];
            $arrearsCount = 0;

            foreach ($sppMonths as $month) {
                $monthScore = ($month->year * 12) + $month->month;

                // 1. Abaikan bulan sebelum siswa masuk
                if ($monthScore < $entryScore) {
                    continue;
                }

                // 2. Abaikan bulan setelah siswa keluar (Rem Otomatis)
                if ($exitScore && $monthScore > $exitScore) {
                    continue;
                }

                // 3. Abaikan bulan masa depan (Tidak menagih melebihi bulan ini)
                if ($monthScore > $currentScore) {
                    continue;
                }

                // Cek pembayaran di tabel spp_payments
                $payment = $student->sppPayments->where('spp_month_id', $month->id)->first();
                $paidAmount = $payment ? $payment->paid_amount : 0;

                // Jika uang bayar KURANG DARI harga bulan tersebut (Belum lunas / Cicilan)
                if ($paidAmount < $month->amount) {
                    $kekurangan = $month->amount - $paidAmount;
                    $totalArrearsAmount += $kekurangan;
                    $arrearsCount++;

                    $unpaidMonthsList[] = [
                        'id' => $month->id,
                        'month' => $month->month,
                        'year' => $month->year,
                        'month_name' => $this->getMonthName($month->month),
                    ];
                }
            }

            // Jika dia punya tunggakan walau Rp 1, masukkan ke daftar!
            if ($totalArrearsAmount > 0) {
                $studentsWithArrears[] = [
                    'id' => $student->id,
                    'name' => $student->name,
                    'nisn' => $student->nisn,
                    'class' => $student->class,
                    'gender' => $student->gender,
                    'status' => $student->status,
                    'entry_month' => $student->entry_month,
                    'entry_year' => $student->entry_year,
                    'arrears_count' => $arrearsCount,
                    'total_arrears' => $totalArrearsAmount,
                    'unpaid_months' => $unpaidMonthsList,
                ];
            }
        }

        usort($studentsWithArrears, function ($a, $b) {
            return $b['total_arrears'] <=> $a['total_arrears'];
        });

        return $studentsWithArrears;
    }

    public function exportAll(Request $request)
    {
        $statusFilter = $request->input('status', 'all'); // 'active', 'inactive', 'all'

        $query = Student::query();
        if ($statusFilter === 'active') {
            $query->where('status', 'aktif');
        } elseif ($statusFilter === 'inactive') {
            $query->where('status', '!=', 'aktif');
        }

        $studentsWithArrears = $this->calculateArrearsForStudents($query);

        $spreadsheet = new Spreadsheet;
        $sheet = $spreadsheet->getActiveSheet();

        $title = 'Data Semua Tunggakan SPP';
        if ($statusFilter === 'active') {
            $title = 'Data Tunggakan SPP - Siswa Aktif';
        }
        if ($statusFilter === 'inactive') {
            $title = 'Data Tunggakan SPP - Siswa Non-Aktif / Alumni';
        }

        $sheet->setCellValue('A1', strtoupper($title));
        $sheet->mergeCells('A1:G1');
        $sheet->getStyle('A1')->getFont()->setBold(true)->setSize(14);

        $sheet->setCellValue('A3', 'No');
        $sheet->setCellValue('B3', 'Nama Siswa');
        $sheet->setCellValue('C3', 'NISN');
        $sheet->setCellValue('D3', 'Kelas');
        $sheet->setCellValue('E3', 'Status Siswa');
        $sheet->setCellValue('F3', 'Jumlah Bulan Tunggakan');
        $sheet->setCellValue('G3', 'Total Tunggakan (Rp)');
        $sheet->setCellValue('H3', 'Rincian Bulan Belum Dibayar');

        $sheet->getStyle('A3:H3')->getFont()->setBold(true);

        $row = 4;
        $no = 1;
        $totalArrears = 0;
        foreach ($studentsWithArrears as $student) {
            $unpaidStr = collect($student['unpaid_months'])->map(fn ($m) => $m['month_name'].' '.$m['year'])->implode(', ');

            $sheet->setCellValue('A'.$row, $no);
            $sheet->setCellValue('B'.$row, $student['name']);
            $sheet->setCellValue('C'.$row, $student['nisn']);
            $sheet->setCellValue('D'.$row, $student['class'] ? 'Kelas '.$student['class'] : '-');
            $sheet->setCellValue('E'.$row, ucfirst($student['status']));
            $sheet->setCellValue('F'.$row, $student['arrears_count']);
            $sheet->setCellValue('G'.$row, $student['total_arrears']);
            $sheet->setCellValue('H'.$row, $unpaidStr);

            $totalArrears += $student['total_arrears'];
            $no++;
            $row++;
        }

        $sheet->setCellValue('F'.$row, 'TOTAL AKUMULASI');
        $sheet->setCellValue('G'.$row, $totalArrears);
        $sheet->getStyle('F'.$row.':G'.$row)->getFont()->setBold(true);

        foreach (range('A', 'H') as $col) {
            $sheet->getColumnDimension($col)->setAutoSize(true);
        }

        $filename = 'tunggakan_spp_semua_'.date('Y-m-d').'.xlsx';

        header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.xlsx');
        header('Content-Disposition: attachment;filename="'.$filename.'"');
        header('Cache-Control: max-age=0');

        $writer = IOFactory::createWriter($spreadsheet, 'Xlsx');
        $writer->save('php://output');
        exit;
    }

    public function exportByClass(Request $request)
    {
        $class = $request->input('class');
        $status = $request->input('status', 'aktif'); // default 'aktif' jika per kelas, atau 'all'

        $query = Student::query();
        if ($class && $class !== 'all') {
            $query->where('class', $class);
        }
        if ($status === 'aktif') {
            $query->where('status', 'aktif');
        } elseif ($status === 'nonaktif' || $status === 'inactive') {
            $query->where('status', '!=', 'aktif');
        }

        $studentsWithArrears = $this->calculateArrearsForStudents($query);

        $spreadsheet = new Spreadsheet;
        $sheet = $spreadsheet->getActiveSheet();

        $className = ($class && $class !== 'all') ? 'Kelas '.$class : 'Semua Kelas';
        $sheet->setCellValue('A1', 'DAFTAR TUNGGAKAN SPP - '.strtoupper($className));
        $sheet->mergeCells('A1:G1');
        $sheet->getStyle('A1')->getFont()->setBold(true)->setSize(14);

        $sheet->setCellValue('A3', 'No');
        $sheet->setCellValue('B3', 'Nama Siswa');
        $sheet->setCellValue('C3', 'NISN');
        $sheet->setCellValue('D3', 'Kelas');
        $sheet->setCellValue('E3', 'Status Siswa');
        $sheet->setCellValue('F3', 'Jumlah Bulan Tunggakan');
        $sheet->setCellValue('G3', 'Total Tunggakan (Rp)');
        $sheet->setCellValue('H3', 'Rincian Bulan Belum Dibayar');

        $sheet->getStyle('A3:H3')->getFont()->setBold(true);

        $row = 4;
        $no = 1;
        $totalArrears = 0;
        foreach ($studentsWithArrears as $student) {
            $unpaidStr = collect($student['unpaid_months'])->map(fn ($m) => $m['month_name'].' '.$m['year'])->implode(', ');

            $sheet->setCellValue('A'.$row, $no);
            $sheet->setCellValue('B'.$row, $student['name']);
            $sheet->setCellValue('C'.$row, $student['nisn']);
            $sheet->setCellValue('D'.$row, $student['class'] ? 'Kelas '.$student['class'] : '-');
            $sheet->setCellValue('E'.$row, ucfirst($student['status']));
            $sheet->setCellValue('F'.$row, $student['arrears_count']);
            $sheet->setCellValue('G'.$row, $student['total_arrears']);
            $sheet->setCellValue('H'.$row, $unpaidStr);

            $totalArrears += $student['total_arrears'];
            $no++;
            $row++;
        }

        $sheet->setCellValue('F'.$row, 'TOTAL AKUMULASI');
        $sheet->setCellValue('G'.$row, $totalArrears);
        $sheet->getStyle('F'.$row.':G'.$row)->getFont()->setBold(true);

        foreach (range('A', 'H') as $col) {
            $sheet->getColumnDimension($col)->setAutoSize(true);
        }

        $filename = 'tunggakan_spp_kelas_'.($class ?: 'semua').'_'.date('Y-m-d').'.xlsx';

        header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.xlsx');
        header('Content-Disposition: attachment;filename="'.$filename.'"');
        header('Cache-Control: max-age=0');

        $writer = IOFactory::createWriter($spreadsheet, 'Xlsx');
        $writer->save('php://output');
        exit;
    }

    public function exportByMonth(Request $request)
    {
        $request->validate([
            'spp_month_id' => ['required', 'exists:spp_months,id'],
        ]);

        $sppMonth = SppMonth::findOrFail($request->spp_month_id);
        $monthScore = ($sppMonth->year * 12) + $sppMonth->month;

        $status = $request->input('status', 'all'); // 'active', 'inactive', 'all'
        $query = Student::whereRaw('(entry_year * 12 + entry_month) <= ?', [$monthScore]);

        if ($status === 'active' || $status === 'aktif') {
            $query->where('status', 'aktif');
        } elseif ($status === 'inactive' || $status === 'nonaktif') {
            $query->where('status', '!=', 'aktif');
        }

        $students = $query->with('sppPayments')->get()->filter(function ($student) use ($sppMonth, $monthScore) {
            // Jika siswa sudah keluar/lulus sebelum bulan ini, jangan ditagihkan
            if ($student->exit_year && $student->exit_month) {
                $exitScore = ($student->exit_year * 12) + $student->exit_month;
                if ($monthScore > $exitScore) {
                    return false;
                }
            } elseif ($student->status !== 'aktif') {
                $exitScore = ((int) $student->updated_at->format('Y') * 12) + (int) $student->updated_at->format('n');
                if ($monthScore > $exitScore) {
                    return false;
                }
            }

            return $student->sppPayments->where('spp_month_id', $sppMonth->id)->where('status', 'paid')->isEmpty();
        })->values();

        $spreadsheet = new Spreadsheet;
        $sheet = $spreadsheet->getActiveSheet();

        $monthName = $this->getMonthName($sppMonth->month);
        $sheet->setCellValue('A1', 'DAFTAR TUNGGAKAN SPP BULAN '.$monthName.' '.$sppMonth->year);
        $sheet->mergeCells('A1:F1');
        $sheet->getStyle('A1')->getFont()->setBold(true)->setSize(14);

        $sheet->setCellValue('A3', 'No');
        $sheet->setCellValue('B3', 'Nama Siswa');
        $sheet->setCellValue('C3', 'NISN');
        $sheet->setCellValue('D3', 'Kelas');
        $sheet->setCellValue('E3', 'Status Siswa');
        $sheet->setCellValue('F3', 'Total Tunggakan (Rp)');

        $sheet->getStyle('A3:F3')->getFont()->setBold(true);

        $row = 4;
        $no = 1;
        $totalArrears = 0;
        foreach ($students as $student) {
            $payment = $student->sppPayments->where('spp_month_id', $sppMonth->id)->first();
            $paidAmount = $payment ? $payment->paid_amount : 0;
            $kekurangan = $sppMonth->amount - $paidAmount;

            $sheet->setCellValue('A'.$row, $no);
            $sheet->setCellValue('B'.$row, $student->name);
            $sheet->setCellValue('C'.$row, $student->nisn);
            $sheet->setCellValue('D'.$row, $student->class ? 'Kelas '.$student->class : '-');
            $sheet->setCellValue('E'.$row, ucfirst($student->status));
            $sheet->setCellValue('F'.$row, $kekurangan);
            $totalArrears += $kekurangan;
            $no++;
            $row++;
        }

        $sheet->setCellValue('E'.$row, 'TOTAL AKUMULASI');
        $sheet->setCellValue('F'.$row, $totalArrears);
        $sheet->getStyle('E'.$row.':F'.$row)->getFont()->setBold(true);

        foreach (range('A', 'F') as $col) {
            $sheet->getColumnDimension($col)->setAutoSize(true);
        }

        $filename = 'tunggakan_spp_'.$monthName.'_'.$sppMonth->year.'.xlsx';

        header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.xlsx');
        header('Content-Disposition: attachment;filename="'.$filename.'"');
        header('Cache-Control: max-age=0');

        $writer = IOFactory::createWriter($spreadsheet, 'Xlsx');
        $writer->save('php://output');
        exit;
    }

    private function getMonthName(int $month): string
    {
        $months = [
            1 => 'Januari', 2 => 'Februari', 3 => 'Maret',
            4 => 'April', 5 => 'Mei', 6 => 'Juni',
            7 => 'Juli', 8 => 'Agustus', 9 => 'September',
            10 => 'Oktober', 11 => 'November', 12 => 'Desember',
        ];

        return $months[$month] ?? '';
    }
}
