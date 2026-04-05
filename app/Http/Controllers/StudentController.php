<?php

namespace App\Http\Controllers;

use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class StudentController extends Controller
{
    public function indexSantriwan()
    {
        // Cari kelas berapa saja yang memiliki Santriwan (Laki-laki) & hitung jumlah siswanya
        $kelasData = Student::where('gender', 'L')
            ->where('status', 'aktif')
            ->select('class', DB::raw('count(*) as total_siswa'))
            ->groupBy('class')
            ->orderBy('class')
            ->get();

        return Inertia::render('santriwan/data-kelas', [
            'kelasData' => $kelasData
        ]);
    }

    // 2. Halaman Detail: Menampilkan Daftar Siswa saat Kelas Diklik
    public function detailKelasSantriwan($kelas)
    {
        // Ambil data santriwan hanya berdasarkan kelas yang dipilih
        $students = Student::where('gender', 'L')
            ->where('class', $kelas)
            ->orderBy('name')
            ->get();

        return Inertia::render('santriwan/detail-kelas', [
            'namaKelas' => $kelas,
            'students' => $students
        ]);
    }

    public function showSantriwan($id)
    {
        // Cari siswa berdasarkan ID, SEKALIGUS ambil data tagihan SPP-nya (relasi hasMany)
        // Kita urutkan tagihannya berdasarkan tahun dan bulan agar rapi dari Juli - Juni
        $student = Student::with(['sppPayments' => function ($query) {
            $query->orderBy('year', 'asc')->orderBy('month', 'asc');
        }])->findOrFail($id);

        return Inertia::render('santriwan/profil-siswa', [
            'student' => $student
        ]);
    }

    // =========== SANTRIWATI ==========
    public function indexSantriwati()
    {
        $kelasData = Student::where('gender', 'P')
            ->where('status', 'aktif')
            ->select('class', DB::raw('count(*) as total_siswa'))
            ->groupBy('class')
            ->orderBy('class')
            ->get();

        return Inertia::render('santriwati/data-kelas', [
            'kelasData' => $kelasData
        ]);
    }

    public function detailKelasSantriwati($kelas)
    {
        // Ambil data santriwan hanya berdasarkan kelas yang dipilih
        $students = Student::where('gender', 'P')
            ->where('class', $kelas)
            ->orderBy('name')
            ->get();

        return Inertia::render('santriwan/detail-kelas', [
            'namaKelas' => $kelas,
            'students' => $students
        ]);
    }
}
