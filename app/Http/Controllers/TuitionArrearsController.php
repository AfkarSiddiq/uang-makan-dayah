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
                    'id' => $student->id,
                    'name' => $student->name,
                    'nisn' => $student->nisn,
                    'class' => $student->class,
                    'gender' => $student->gender,
                    'entry_month' => $student->entry_month,
                    'entry_year' => $student->entry_year,
                    'arrears_count' => $arrearsCount,
                    'total_expected' => $totalExpected,
                    'paid_count' => $paidCount,
                    'total_arrears' => $totalArrearsAmount,
                    'unpaid_months' => $unpaidMonths->map(function ($month) {
                        return [
                            'id' => $month->id,
                            'month' => $month->month,
                            'year' => $month->year,
                            'month_name' => $this->getMonthName($month->month),
                        ];
                    })->values(),
                ];
            }
        }

        usort($studentsWithArrears, function ($a, $b) {
            return $b['total_arrears'] <=> $a['total_arrears'];
        });

        $totalStudentsWithArrears = count($studentsWithArrears);
        $totalArrearsAmount = array_sum(array_column($studentsWithArrears, 'total_arrears'));

        $availableMonths = SppMonth::orderBy('year', 'desc')
            ->orderBy('month', 'desc')
            ->get()
            ->map(function ($month) {
                return [
                    'id' => $month->id,
                    'month' => $month->month,
                    'year' => $month->year,
                    'label' => $this->getMonthName($month->month).' '.$month->year,
                ];
            });

        return Inertia::render('tuition-arrears/index', [
            'students' => $studentsWithArrears,
            'summary' => [
                'total_students' => $totalStudentsWithArrears,
                'total_arrears' => $totalArrearsAmount,
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
