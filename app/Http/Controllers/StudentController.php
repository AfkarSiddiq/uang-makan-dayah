<?php

namespace App\Http\Controllers;

use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class StudentController extends Controller
{
    // pembuatan private function untuk pemisahan gender
    private function getKelasByGender($gender)
    {
        return Student::where('gender', $gender)
            ->where('status', 'aktif')
            ->select('class', DB::raw('count(*) as total_siswa'))
            ->groupBy('class')
            ->orderBy('class')
            ->get();
    }

    private function getStudentsByClassAndGender($kelas, $gender)
    {
        return Student::where('gender', $gender)
            ->where('class', $kelas)
            ->orderBy('name')
            ->get();
    }

    private function getStudentProfile($id, $gender)
    {
        // BUG FIX: Ditambah where('gender') agar URL tidak bisa diakali
        return Student::where('gender', $gender)
            ->with(['sppPayments' => function ($query) {
                $query->orderBy('year', 'asc')->orderBy('month', 'asc');
            }])
            ->findOrFail($id);
    }

    //  ROUTE UNTUK SANTRIWAN (Memanggil fungsi bantuan di atas)

    public function indexSantriwan()
    {
        return Inertia::render('santriwan/data-kelas', [
            'kelasData' => $this->getKelasByGender('L')
        ]);
    }

    public function detailKelasSantriwan($kelas)
    {
        return Inertia::render('santriwan/detail-kelas', [
            'namaKelas' => $kelas,
            'students'  => $this->getStudentsByClassAndGender($kelas, 'L')
        ]);
    }

    public function showSantriwan($id)
    {
        return Inertia::render('santriwan/profil-siswa', [
            'student' => $this->getStudentProfile($id, 'L')
        ]);
    }

    // ROUTE UNTUK SANTRIWATI (Memanggil fungsi bantuan di atas)

    public function indexSantriwati()
    {
        return Inertia::render('santriwati/data-kelas', [
            'kelasData' => $this->getKelasByGender('P')
        ]);
    }

    public function detailKelasSantriwati($kelas)
    {
        return Inertia::render('santriwati/detail-kelas', [
            'namaKelas' => $kelas,
            'students'  => $this->getStudentsByClassAndGender($kelas, 'P')
        ]);
    }

    public function showSantriwati($id)
    {
        return Inertia::render('santriwati/profil-siswa', [
            'student' => $this->getStudentProfile($id, 'P')
        ]);
    }
}
