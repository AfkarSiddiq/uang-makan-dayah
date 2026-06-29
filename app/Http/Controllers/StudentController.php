<?php

namespace App\Http\Controllers;

use App\Models\SppMonth;
use App\Models\SppPayment;
use App\Models\Student;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class StudentController extends Controller
{
    // pembuatan private function untuk pemisahan gender
    private function getKelasByGender($gender)
    {
        // 1. Definisikan daftar kelas yang pasti ada (Statis)
        $daftarKelas = collect(['1', '2', '3', '4', '5', '6']);

        // 2. Ambil data jumlah siswa dari database HANYA SATU KALI
        // pluck() akan menghasilkan array berpasangan: ['1' => 15, '2' => 20]
        $dataSiswaDariDb = Student::where('gender', $gender)
            ->where('status', 'aktif')
            ->select('class', DB::raw('count(*) as total_siswa'))
            ->groupBy('class')
            ->pluck('total_siswa', 'class');

        // 3. Gabungkan kelas statis dengan data dari database
        return $daftarKelas->map(function ($kelas) use ($dataSiswaDariDb) {
            return [
                'class' => $kelas,
                // Cari apakah kelas ini ada di database? Jika tidak ada, jadikan 0
                'total_siswa' => $dataSiswaDariDb->get($kelas, 0),
            ];
        })->values(); // values() memastikan formatnya array rapi untuk React
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
        $student = Student::where('gender', $gender)->findOrFail($id);

        $semuaBulanMaster = SppMonth::orderBy('year', 'asc')->orderBy('month', 'asc')->get();

        $pembayaranAsli = SppPayment::where('student_id', $student->id)
            ->get()
            ->keyBy('spp_month_id');

        $virtualLedger = $semuaBulanMaster->filter(function ($master) use ($student) {
            $bulanMasterSkor = ((int) $master->year * 12) + (int) $master->month;
            $bulanMasukSkor = ((int) $student->entry_year * 12) + (int) $student->entry_month;

            // 1. Pastikan tidak menagih sebelum bulan masuk
            if ($bulanMasterSkor < $bulanMasukSkor) {
                return false;
            }

            // 2. REM OTOMATIS: Jika siswa punya tanggal keluar (exit_year)
            // (Opsional: Anda juga bisa menambahkan cek status seperti: $student->status !== 'aktif')
            if ($student->exit_year && $student->exit_month) {
                $bulanKeluarSkor = ((int) $student->exit_year * 12) + (int) $student->exit_month;

                // Jika argo bulan master melebihi bulan dia keluar, HENTIKAN (false)
                if ($bulanMasterSkor > $bulanKeluarSkor) {
                    return false;
                }
            }

            return true;

        })->map(function ($master) use ($pembayaranAsli) {
            $pembayaran = $pembayaranAsli->get($master->id);

            return [
                'id' => $pembayaran ? $pembayaran->id : 'virtual-'.$master->id,
                'spp_month_id' => $master->id,
                'month' => $master->month,
                'year' => $master->year,
                'amount' => $master->amount,
                'paid_amount' => $pembayaran ? $pembayaran->paid_amount : 0,
                'status' => $pembayaran ? $pembayaran->status : 'unpaid',
            ];
        })->values();

        // =========================================================================
        // PERBAIKAN: Ubah model jadi array biasa, lalu tempel virtual ledger-nya
        // =========================================================================
        $studentData = $student->toArray();
        $studentData['spp_payments'] = $virtualLedger->toArray();

        // Kembalikan dalam bentuk Array murni, bukan Object Model Eloquent
        return $studentData;
    }

    //  ROUTE UNTUK SANTRIWAN (Memanggil fungsi bantuan di atas)

    public function indexSantriwan()
    {
        return Inertia::render('santriwan/data-kelas', [
            'kelasData' => $this->getKelasByGender('L'),
        ]);
    }

    public function detailKelasSantriwan($kelas)
    {
        return Inertia::render('santriwan/detail-kelas', [
            'namaKelas' => $kelas,
            'students' => $this->getStudentsByClassAndGender($kelas, 'L'),
        ]);
    }

    public function showSantriwan($id)
    {
        return Inertia::render('santriwan/profil-siswa', [
            'student' => $this->getStudentProfile($id, 'L'),
        ]);
    }

    // ROUTE UNTUK SANTRIWATI (Memanggil fungsi bantuan di atas)

    public function indexSantriwati()
    {
        return Inertia::render('santriwati/data-kelas', [
            'kelasData' => $this->getKelasByGender('P'),
        ]);
    }

    public function detailKelasSantriwati($kelas)
    {
        return Inertia::render('santriwati/detail-kelas', [
            'namaKelas' => $kelas,
            'students' => $this->getStudentsByClassAndGender($kelas, 'P'),
        ]);
    }

    public function showSantriwati($id)
    {
        return Inertia::render('santriwati/profil-siswa', [
            'student' => $this->getStudentProfile($id, 'P'),
        ]);
    }

    public function update(Request $request, $id)
    {
        $student = Student::findOrFail($id);

        // Check if this is a simple update (from profile page - only class/status)
        if ($request->has('class') && ! $request->has('nisn')) {
            $validated = $request->validate([
                'class' => 'nullable|in:1,2,3,4,5,6,none',
                'status' => 'required|in:aktif,lulus,pindah,berhenti',
            ]);

            $student->update($validated);

            if ($student->gender === 'L') {
                return redirect()->route('santriwan.detail', ['kelas' => $student->class])
                    ->with('success', 'Data remaja putra berhasil diperbarui!');
            }

            return redirect()->route('santriwati.detail', ['kelas' => $student->class])
                ->with('success', 'Data remaja putri berhasil diperbarui!');
        }

        // Full CRUD update (from edit page)
        $validated = $request->validate([
            'nisn' => 'required|string|max:20|unique:students,nisn,'.$id,
            'name' => 'required|string|max:255',
            'gender' => 'required|in:L,P',
            'class' => 'nullable|in:1,2,3,4,5,6',
            'status' => 'nullable|in:aktif,lulus,pindah,berhenti',
            'student_type' => 'nullable|in:umum,yatim,piatu,yatim_piatu',
            'entry_month' => 'required|integer|min:1|max:12',
            'entry_year' => 'required|integer|min:2020',
            'exit_month' => 'nullable|integer|min:1|max:12',
            'exit_year' => 'nullable|integer|min:2020',
        ]);

        // Convert 'none' to null for class
        if ($validated['class'] === 'none') {
            $validated['class'] = null;
        }
        if (! empty($validated['exit_month']) && $validated['exit_month'] === 'none') {
            $validated['exit_month'] = null;
        }
        if (! empty($validated['exit_year']) && $validated['exit_year'] === 'none') {
            $validated['exit_year'] = null;
        }
        $validated['status'] = $validated['status'] ?? 'aktif';
        $validated['student_type'] = $validated['student_type'] ?? 'umum';

        if (in_array($validated['status'], ['lulus', 'pindah', 'berhenti'])) {
            $validated['exit_month'] = $validated['exit_month'] ?: null;
            $validated['exit_year'] = $validated['exit_year'] ?: null;
        } else {
            $validated['exit_month'] = null;
            $validated['exit_year'] = null;
        }

        $student->update($validated);

        if ($student->gender === 'L') {
            return redirect()->route('santriwan.show', $student->id)->with('success', 'Data siswa berhasil diperbarui!');
        }

        return redirect()->route('santriwati.show', $student->id)->with('success', 'Data siswa berhasil diperbarui!');
    }

    // ======KENAIKAN KELAS===========
    public function kenaikanSantriwan()
    {
        // Ambil daftar kelas yang memiliki siswa aktif untuk dijadikan pilihan di Dropdown
        $kelasAktif = Student::where('gender', 'L')
            ->where('status', 'aktif')
            ->select('class')
            ->groupBy('class')
            ->orderBy('class')
            ->get();

        return Inertia::render('santriwan/kenaikan-kelas', [
            'kelasAktif' => $kelasAktif,
        ]);
    }

    public function kenaikanSantriwati()
    {
        // Ambil daftar kelas yang memiliki siswa aktif untuk dijadikan pilihan di Dropdown
        $kelasAktif = Student::where('gender', 'P')
            ->where('status', 'aktif')
            ->select('class')
            ->groupBy('class')
            ->orderBy('class')
            ->get();

        return Inertia::render('santriwati/kenaikan-kelas', [
            'kelasAktif' => $kelasAktif,
        ]);
    }

    public function prosesKenaikanSantriwan(Request $request)
    {
        // 1. Validasi Input dari React
        $request->validate([
            'old_class' => 'required|in:1,2,3,4,5,6',
            'is_graduating' => 'boolean',
            'new_class' => 'nullable|in:1,2,3,4,5,6',
            'new_spp_amount' => 'nullable|numeric|min:0',
            'start_year' => 'nullable|numeric|min:2020',
        ]);

        // 2. Eksekusi dengan Transaction agar Aman
        DB::transaction(function () use ($request) {

            // Ambil semua santriwan di kelas asal yang masih aktif
            $students = Student::where('gender', 'L')
                ->where('class', $request->old_class)
                ->where('status', 'aktif')
                ->get();

            foreach ($students as $student) {
                // A. Jika Lulus, cukup ubah status
                if ($request->is_graduating) {
                    $student->update([
                        'status' => 'lulus',
                        'exit_year' => $request->start_year ?? date('Y'),
                        'exit_month' => 6, // Biasanya lulus bulan Juni
                    ]);

                    continue;
                }

                // B. Jika Naik Kelas, ubah kelasnya (Tagihan otomatis terdeteksi via virtual ledger SppMonth)
                $student->update(['class' => $request->new_class]);
            }
        });

        // 3. Kembalikan ke halaman daftar kelas dengan pesan sukses
        return redirect()->route('santriwan.kelas')->with('success', 'Proses kenaikan kelas berhasil!');
    }

    public function prosesKenaikanSantriwati(Request $request)
    {
        // 1. Validasi Input dari React
        $request->validate([
            'old_class' => 'required|in:1,2,3,4,5,6',
            'is_graduating' => 'boolean',
            'new_class' => 'nullable|in:1,2,3,4,5,6',
            'new_spp_amount' => 'nullable|numeric|min:0',
            'start_year' => 'nullable|numeric|min:2020',
        ]);

        // 2. Eksekusi dengan Transaction agar Aman
        DB::transaction(function () use ($request) {

            // Ambil semua santriwati di kelas asal yang masih aktif
            $students = Student::where('gender', 'P')
                ->where('class', $request->old_class)
                ->where('status', 'aktif')
                ->get();

            foreach ($students as $student) {
                // A. Jika Lulus, cukup ubah status
                if ($request->is_graduating) {
                    $student->update([
                        'status' => 'lulus',
                        'exit_year' => $request->start_year ?? date('Y'),
                        'exit_month' => 6, // Biasanya lulus bulan Juni
                    ]);

                    continue;
                }

                // B. Jika Naik Kelas, ubah kelasnya (Tagihan otomatis terdeteksi via virtual ledger SppMonth)
                $student->update(['class' => $request->new_class]);
            }
        });

        // 3. Kembalikan ke halaman daftar kelas dengan pesan sukses
        return redirect()->route('santriwati.kelas')->with('success', 'Proses kenaikan kelas berhasil!');
    }

    public function index()
    {
        $query = Student::query();

        // Search
        if (request()->has('search') && request()->search) {
            $query->where(function ($q) {
                $q->where('name', 'like', '%'.request()->search.'%')
                    ->orWhere('nisn', 'like', '%'.request()->search.'%');
            });
        }

        // Sorting
        $sortBy = request()->get('sort_by', 'name');
        $sortDir = request()->get('sort_dir', 'asc');
        $query->orderBy($sortBy, $sortDir);

        $perPage = request()->get('per_page', 15);
        $students = $query->paginate($perPage)->withQueryString();

        return Inertia::render('siswa/index', [
            'students' => $students,
            'filters' => [
                'search' => request()->search,
                'per_page' => $perPage,
                'sort_by' => $sortBy,
                'sort_dir' => $sortDir,
            ],
        ]);
    }

    public function create()
    {
        return Inertia::render('siswa/create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nisn' => 'required|string|max:20|unique:students,nisn',
            'name' => 'required|string|max:255',
            'gender' => 'required|in:L,P',
            'class' => 'nullable|in:1,2,3,4,5,6',
            'status' => 'nullable|in:aktif,lulus,pindah,berhenti',
            'student_type' => 'nullable|in:umum,yatim,piatu,yatim_piatu',
            'entry_month' => 'required|integer|min:1|max:12',
            'entry_year' => 'required|integer|min:2020',
        ]);

        $validated['status'] = $validated['status'] ?? 'aktif';
        $validated['student_type'] = $validated['student_type'] ?? 'umum';

        Student::create($validated);

        return redirect()->route('siswa.index')->with('success', 'Siswa berhasil ditambahkan!');
    }

    public function show($id)
    {
        $student = Student::findOrFail($id);

        return Inertia::render('siswa/show', ['student' => $student]);
    }

    public function edit($id)
    {
        $student = Student::findOrFail($id);

        return Inertia::render('siswa/edit', ['student' => $student]);
    }

    public function destroy($id)
    {
        $student = Student::findOrFail($id);
        $student->delete();

        return redirect()->route('siswa.index')->with('success', 'Siswa berhasil dihapus!');
    }

    // Pembayaran dari profil
    public function paySpp(Request $request, $id)
    {
        $request->validate([
            'amount' => 'required|numeric|min:1',
        ]);

        $student = Student::findOrFail($id);
        $paymentAmount = $request->amount;

        DB::transaction(function () use ($student, $paymentAmount) {

            // 1. Catat ke tabel Buku Kas Utama (Transactions)
            // Ini sudah berhasil berjalan di sistem Anda
            Transaction::create([
                'transaction_id' => 'TRX-'.strtoupper(uniqid()),
                'type' => 'in',
                'category' => 'SPP',
                'amount' => $paymentAmount,
                'student_id' => $student->id,
                'user_id' => Auth::id(),
                'transaction_date' => now(),
                'note' => 'Pembayaran SPP Otomatis via Profil Siswa',
            ]);

            // 2. LOGIKA BARU: Ambil Buku Menu untuk menghitung Virtual Waterfall
            $semuaBulanMaster = SppMonth::orderBy('year', 'asc')->orderBy('month', 'asc')->get();

            $bulanValid = $semuaBulanMaster->filter(function ($master) use ($student) {
                $bulanMasterSkor = ((int) $master->year * 12) + (int) $master->month;
                $bulanMasukSkor = ((int) $student->entry_year * 12) + (int) $student->entry_month;

                if ($bulanMasterSkor < $bulanMasukSkor) {
                    return false;
                }

                // REM OTOMATIS WATERFALL
                if ($student->exit_year && $student->exit_month) {
                    $bulanKeluarSkor = ((int) $student->exit_year * 12) + (int) $student->exit_month;
                    if ($bulanMasterSkor > $bulanKeluarSkor) {
                        return false;
                    }
                }

                return true;
            });

            $sisaUang = $paymentAmount;

            // 3. Looping dari bulan paling lama
            foreach ($bulanValid as $master) {
                // Jika dompet kasir sudah kosong, hentikan perulangan
                if ($sisaUang <= 0) {
                    break;
                }

                // Cek apakah bulan ini sudah pernah diangsur/dibayar di tabel spp_payments?
                $tagihan = SppPayment::where('student_id', $student->id)
                    ->where('spp_month_id', $master->id)
                    ->first();

                $terbayarSebelumnya = $tagihan ? $tagihan->paid_amount : 0;

                // Jika bulan ini sudah lunas dari dulu, skip ke bulan depan
                if ($terbayarSebelumnya >= $master->amount) {
                    continue;
                }

                // Berapa butuh uang untuk melunasi bulan ini?
                $kekurangan = $master->amount - $terbayarSebelumnya;
                $bayarSekarang = 0;
                $statusBaru = 'unpaid';

                // Skenario A: Uang cukup untuk melunasi
                if ($sisaUang >= $kekurangan) {
                    $bayarSekarang = $terbayarSebelumnya + $kekurangan;
                    $statusBaru = 'paid';
                    $sisaUang -= $kekurangan;
                }
                // Skenario B: Uang kurang, jadi dicicil (Partial)
                else {
                    $bayarSekarang = $terbayarSebelumnya + $sisaUang;
                    $statusBaru = 'partial';
                    $sisaUang = 0;
                }

                // 4. THE MAGIC: Buat Baris Baru atau Perbarui jika sudah ada
                SppPayment::updateOrCreate(
                    [
                        'student_id' => $student->id,
                        'spp_month_id' => $master->id,
                    ],
                    [
                        'paid_amount' => $bayarSekarang,
                        'status' => $statusBaru,
                        'paid_at' => now(),
                    ]
                );
            }
        });

        // Karena kita pakai Inertia.js, back() akan otomatis merender ulang data terbaru di layar!
        return back()->with('success', 'Pembayaran sebesar Rp '.number_format($request->amount, 0, ',', '.').' berhasil diproses!');
    }
}
