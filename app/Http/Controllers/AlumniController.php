<?php

namespace App\Http\Controllers;

use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class AlumniController extends Controller
{
    public function index()
    {
        // Cari siswa yang lulus, kelompokkan berdasarkan tahun lulus (exit_year)
        $tahunLulus = Student::where('status', 'lulus')
            ->whereNotNull('exit_year')
            ->select('exit_year', DB::raw('count(*) as total_alumni'))
            ->groupBy('exit_year')
            ->orderBy('exit_year', 'desc') // Urutkan dari angkatan terbaru
            ->get();

        return Inertia::render('alumni/index', [
            'tahunLulus' => $tahunLulus
        ]);
    }

    // 2. Menampilkan Daftar Alumni pada Tahun Tertentu
    public function detail($year)
    {
        $alumni = Student::where('status', 'lulus')
            ->where('exit_year', $year)
            ->orderBy('name')
            ->get();

        return Inertia::render('alumni/detail-tahun', [
            'tahun' => $year,
            'alumni' => $alumni
        ]);
    }
}
