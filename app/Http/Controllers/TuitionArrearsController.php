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

        // Ambil SEMUA buku menu (Master Bulan), dari awal sampai akhir
        $sppMonths = SppMonth::orderBy('year', 'asc')->orderBy('month', 'asc')->get();

        // Hanya hitung siswa yang masih aktif menunggak
        $allStudents = Student::where('status', 'aktif')
            ->with('sppPayments')
            ->get();

        $studentsWithArrears = [];

        foreach ($allStudents as $student) {
            $entryScore = ($student->entry_year * 12) + $student->entry_month;

            // Hitung Exit Score jika anak ini sudah ada info lulus/keluar (jika ada field tersebut)
            $exitScore = null;
            if ($student->exit_year && $student->exit_month) {
                $exitScore = ($student->exit_year * 12) + $student->exit_month;
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
                    'entry_month' => $student->entry_month,
                    'entry_year' => $student->entry_year,
                    'arrears_count' => $arrearsCount,
                    'total_arrears' => $totalArrearsAmount,
                    'unpaid_months' => $unpaidMonthsList,
                ];
            }
        }

        // Urutkan dari yang hutangnya paling banyak (Descending)
        usort($studentsWithArrears, function ($a, $b) {
            return $b['total_arrears'] <=> $a['total_arrears'];
        });

        // Hitung statistik untuk Dashboard/Header atas
        $totalStudentsWithArrears = count($studentsWithArrears);
        $totalArrearsAmountGlobal = array_sum(array_column($studentsWithArrears, 'total_arrears'));

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

        // Render ke Inertia (Sesuaikan 'tuition-arrears/index' dengan path file TSX Anda)
        return Inertia::render('tuition-arrears/index', [
            'students' => $studentsWithArrears,
            'summary' => [
                'total_students' => $totalStudentsWithArrears,
                'total_arrears' => $totalArrearsAmountGlobal,
            ],
            'availableMonths' => $availableMonths,
            'selectedMonth' => $selectedMonth,
        ]);
    }

    public function exportAll()
    {
        $currentYear = date('Y');
        $currentMonth = date('n');

        $sppMonths = SppMonth::where(function ($query) use ($currentYear, $currentMonth) {
            $query->where('year', '<', $currentYear)
                ->orWhere(function ($q) use ($currentYear, $currentMonth) {
                    $q->where('year', $currentYear)->where('month', '<', $currentMonth);
                });
        })
            ->orderBy('year', 'asc')
            ->orderBy('month', 'asc')
            ->get();

        $allStudents = Student::where('status', 'aktif')
            ->with('sppPayments.sppMonth')
            ->get();

        $studentsWithArrears = [];

        foreach ($allStudents as $student) {
            $entryYear = $student->entry_year;
            $entryMonth = $student->entry_month;

            $eligibleMonths = $sppMonths->filter(function ($month) use ($entryYear, $entryMonth) {
                $monthScore = ($month->year * 12) + $month->month;
                $entryScore = ($entryYear * 12) + $entryMonth;

                return $monthScore >= $entryScore;
            });

            $totalExpected = $eligibleMonths->count();
            $paidCount = $student->sppPayments->where('status', 'paid')->count();

            if ($paidCount < $totalExpected && $totalExpected > 0) {
                $arrearsCount = $totalExpected - $paidCount;
                $totalArrearsAmount = $arrearsCount * 500000;

                $unpaidMonths = $eligibleMonths->reject(function ($month) use ($student) {
                    return $student->sppPayments->where('spp_month_id', $month->id)->where('status', 'paid')->isNotEmpty();
                });

                $studentsWithArrears[] = [
                    'name' => $student->name,
                    'nisn' => $student->nisn,
                    'class' => $student->class,
                    'arrears_count' => $arrearsCount,
                    'total_arrears' => $totalArrearsAmount,
                    'unpaid_months' => $unpaidMonths->map(fn ($m) => $this->getMonthName($m->month).' '.$m->year)->implode(', '),
                ];
            }
        }

        usort($studentsWithArrears, function ($a, $b) {
            return $b['total_arrears'] <=> $a['total_arrears'];
        });

        $spreadsheet = new Spreadsheet;
        $sheet = $spreadsheet->getActiveSheet();

        $sheet->setCellValue('A1', 'Nama Siswa');
        $sheet->setCellValue('B1', 'NISN');
        $sheet->setCellValue('C1', 'Kelas');
        $sheet->setCellValue('D1', 'Jumlah Bulan Tunggakan');
        $sheet->setCellValue('E1', 'Total Tunggakan');
        $sheet->setCellValue('F1', 'Bulan Belum Dibayar');

        $row = 2;
        foreach ($studentsWithArrears as $student) {
            $sheet->setCellValue('A'.$row, $student['name']);
            $sheet->setCellValue('B'.$row, $student['nisn']);
            $sheet->setCellValue('C'.$row, $student['class'] ?: '-');
            $sheet->setCellValue('D'.$row, $student['arrears_count']);
            $sheet->setCellValue('E'.$row, $student['total_arrears']);
            $sheet->setCellValue('F'.$row, $student['unpaid_months']);
            $row++;
        }

        foreach (range('A', 'F') as $col) {
            $sheet->getColumnDimension($col)->setAutoSize(true);
        }

        $filename = 'tunggakan_spp_all_'.date('Y-m-d').'.xlsx';

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

        $students = Student::where('status', 'aktif')
            ->whereRaw('(entry_year * 12 + entry_month) <= ?', [$monthScore])
            ->with('sppPayments')
            ->get()
            ->filter(function ($student) use ($sppMonth) {
                return $student->sppPayments->where('spp_month_id', $sppMonth->id)->where('status', 'paid')->isEmpty();
            });

        $spreadsheet = new Spreadsheet;
        $sheet = $spreadsheet->getActiveSheet();

        $monthName = $this->getMonthName($sppMonth->month);
        $sheet->setCellValue('A1', 'DAFTAR TUNGGAKAN SPP '.$monthName.' '.$sppMonth->year);
        $sheet->mergeCells('A1:E1');
        $sheet->getStyle('A1')->getFont()->setBold(true);

        $sheet->setCellValue('A3', 'No');
        $sheet->setCellValue('B3', 'Nama Siswa');
        $sheet->setCellValue('C3', 'NISN');
        $sheet->setCellValue('D3', 'Kelas');
        $sheet->setCellValue('E3', 'Total Tunggakan');

        $row = 4;
        $no = 1;
        $totalArrears = 0;
        foreach ($students as $student) {
            $sheet->setCellValue('A'.$row, $no);
            $sheet->setCellValue('B'.$row, $student->name);
            $sheet->setCellValue('C'.$row, $student->nisn);
            $sheet->setCellValue('D'.$row, $student->class ?: '-');
            $sheet->setCellValue('E'.$row, $sppMonth->amount);
            $totalArrears += $sppMonth->amount;
            $no++;
            $row++;
        }

        $sheet->setCellValue('D'.$row, 'TOTAL');
        $sheet->setCellValue('E'.$row, $totalArrears);
        $sheet->getStyle('D'.$row.':E'.$row)->getFont()->setBold(true);

        foreach (range('A', 'E') as $col) {
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
