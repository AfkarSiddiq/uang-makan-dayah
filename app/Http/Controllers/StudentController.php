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
        $currentMonth = (int) date('n');
        $currentYear = (int) date('Y');
        $currentAcademicYearStart = $currentMonth >= 7 ? $currentYear : $currentYear - 1;

        return Student::where('gender', $gender)
            ->where('class', $kelas)
            ->where(function ($query) use ($currentAcademicYearStart) {
                $query->where('status', 'aktif')
                    ->orWhere(function ($sub) use ($currentAcademicYearStart) {
                        $sub->whereIn('status', ['pindah', 'berhenti', 'keluar'])
                            ->where(function ($q2) use ($currentAcademicYearStart) {
                                $q2->whereNull('exit_year')
                                   ->orWhere('exit_year', '>=', $currentAcademicYearStart);
                            });
                    });
            })
            ->orderBy('name')
            ->get();
    }

    private function getStudentProfile($id, $gender = null)
    {
        $query = Student::query();
        if ($gender) {
            $query->where('gender', $gender);
        }
        $student = $query->findOrFail($id);

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

            if ($validated['class'] === 'none') {
                $validated['class'] = null;
            }

            if (in_array($validated['status'], ['lulus', 'pindah', 'berhenti'])) {
                $validated['exit_month'] = $student->exit_month ?: date('n');
                $validated['exit_year'] = $student->exit_year ?: date('Y');
            } else {
                $validated['exit_month'] = null;
                $validated['exit_year'] = null;
            }

            $student->update($validated);

            if ($student->gender === 'L') {
                return redirect()->route('santriwan.detail', ['kelas' => $student->class ?: 'none'])
                    ->with('success', 'Data remaja putra berhasil diperbarui!');
            }

            return redirect()->route('santriwati.detail', ['kelas' => $student->class ?: 'none'])
                ->with('success', 'Data remaja putri berhasil diperbarui!');
        }

        // Full CRUD update (from edit page)
        $validated = $request->validate([
            'nisn' => 'required|string|max:20|unique:students,nisn,'.$id,
            'name' => 'required|string|max:255',
            'gender' => 'required|in:L,P',
            'class' => 'nullable|in:1,2,3,4,5,6',
            'status' => 'required|in:aktif,lulus,pindah,berhenti',
            'student_type' => 'nullable|in:umum,yatim,piatu,yatim_piatu',
            'entry_month' => 'required|integer|min:1|max:12',
            'entry_year' => 'required|integer|min:2020',
            'exit_month' => 'required_if:status,lulus,pindah,berhenti|nullable|integer|min:1|max:12',
            'exit_year' => 'required_if:status,lulus,pindah,berhenti|nullable|integer|min:2020',
        ], [
            'exit_month.required_if' => 'Bulan keluar wajib diisi karena siswa berstatus pindah/lulus/berhenti.',
            'exit_year.required_if' => 'Tahun keluar wajib diisi karena siswa berstatus pindah/lulus/berhenti.',
        ]);

        if (in_array($validated['status'], ['lulus', 'pindah', 'berhenti']) && !empty($validated['exit_year']) && !empty($validated['exit_month']) && $validated['exit_year'] !== 'none' && $validated['exit_month'] !== 'none') {
            $entryScore = ((int) $validated['entry_year'] * 12) + (int) $validated['entry_month'];
            $exitScore = ((int) $validated['exit_year'] * 12) + (int) $validated['exit_month'];
            if ($exitScore < $entryScore) {
                return back()->withErrors([
                    'exit_month' => 'Bulan & tahun keluar tidak boleh lebih awal dibanding bulan & tahun masuk.',
                    'exit_year' => 'Bulan & tahun keluar tidak boleh lebih awal dibanding bulan & tahun masuk.',
                ])->withInput();
            }
        }

        // Convert 'none' to null for class
        if (isset($validated['class']) && $validated['class'] === 'none') {
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

        if ($validated['status'] === 'aktif') {
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

    public function index(Request $request)
    {
        $query = Student::query();

        // Filter status (default 'aktif' jika tidak dipilih)
        $statusFilter = $request->get('status', 'aktif');
        if ($statusFilter !== 'all' && $statusFilter !== '') {
            $query->where('status', $statusFilter);
        }

        // Filter kelas
        $classFilter = $request->get('class', 'all');
        if ($classFilter !== 'all' && $classFilter !== '') {
            if ($classFilter === 'none') {
                $query->where(function ($q) {
                    $q->whereNull('class')->orWhere('class', '');
                });
            } else {
                $query->where('class', $classFilter);
            }
        }

        // Filter gender
        $genderFilter = $request->get('gender', 'all');
        if ($genderFilter !== 'all' && $genderFilter !== '') {
            $query->where('gender', $genderFilter);
        }

        // Filter jenis siswa
        $typeFilter = $request->get('student_type', 'all');
        if ($typeFilter !== 'all' && $typeFilter !== '') {
            $query->where('student_type', $typeFilter);
        }

        // Search
        if ($request->has('search') && $request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%'.$request->search.'%')
                    ->orWhere('nisn', 'like', '%'.$request->search.'%');
            });
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'name');
        $sortDir = $request->get('sort_dir', 'asc');
        $query->orderBy($sortBy, $sortDir);

        $perPage = $request->get('per_page', 15);
        $students = $query->paginate($perPage)->withQueryString();

        // Statistik umum
        $stats = [
            'total_aktif' => Student::where('status', 'aktif')->count(),
            'santriwan_aktif' => Student::where('status', 'aktif')->where('gender', 'L')->count(),
            'santriwati_aktif' => Student::where('status', 'aktif')->where('gender', 'P')->count(),
            'total_non_aktif' => Student::whereIn('status', ['lulus', 'pindah', 'berhenti'])->count(),
        ];

        // Breakdown per kelas berdasarkan filter status/gender/type saat ini
        $classCountsQuery = Student::query();
        if ($statusFilter !== 'all' && $statusFilter !== '') {
            $classCountsQuery->where('status', $statusFilter);
        }
        if ($genderFilter !== 'all' && $genderFilter !== '') {
            $classCountsQuery->where('gender', $genderFilter);
        }
        if ($typeFilter !== 'all' && $typeFilter !== '') {
            $classCountsQuery->where('student_type', $typeFilter);
        }

        $totalCount = (clone $classCountsQuery)->count();
        $classCountsRaw = (clone $classCountsQuery)
            ->select('class', DB::raw('count(*) as count'))
            ->groupBy('class')
            ->pluck('count', 'class');

        $classBreakdown = [
            'all' => $totalCount,
            '1' => $classCountsRaw->get('1', 0),
            '2' => $classCountsRaw->get('2', 0),
            '3' => $classCountsRaw->get('3', 0),
            '4' => $classCountsRaw->get('4', 0),
            '5' => $classCountsRaw->get('5', 0),
            '6' => $classCountsRaw->get('6', 0),
            'none' => $classCountsRaw->get('', 0) + $classCountsRaw->get(null, 0),
        ];

        return Inertia::render('siswa/index', [
            'students' => $students,
            'stats' => $stats,
            'classBreakdown' => $classBreakdown,
            'filters' => [
                'search' => $request->search ?? '',
                'class' => $classFilter,
                'status' => $statusFilter,
                'gender' => $genderFilter,
                'student_type' => $typeFilter,
                'per_page' => (string) $perPage,
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
            'exit_month' => 'required_if:status,lulus,pindah,berhenti|nullable|integer|min:1|max:12',
            'exit_year' => 'required_if:status,lulus,pindah,berhenti|nullable|integer|min:2020',
        ], [
            'exit_month.required_if' => 'Bulan keluar wajib diisi karena siswa berstatus pindah/lulus/berhenti.',
            'exit_year.required_if' => 'Tahun keluar wajib diisi karena siswa berstatus pindah/lulus/berhenti.',
        ]);

        if (in_array($validated['status'] ?? 'aktif', ['lulus', 'pindah', 'berhenti']) && !empty($validated['exit_year']) && !empty($validated['exit_month']) && $validated['exit_year'] !== 'none' && $validated['exit_month'] !== 'none') {
            $entryScore = ((int) $validated['entry_year'] * 12) + (int) $validated['entry_month'];
            $exitScore = ((int) $validated['exit_year'] * 12) + (int) $validated['exit_month'];
            if ($exitScore < $entryScore) {
                return back()->withErrors([
                    'exit_month' => 'Bulan & tahun keluar tidak boleh lebih awal dibanding bulan & tahun masuk.',
                    'exit_year' => 'Bulan & tahun keluar tidak boleh lebih awal dibanding bulan & tahun masuk.',
                ])->withInput();
            }
        }

        $validated['status'] = $validated['status'] ?? 'aktif';
        $validated['student_type'] = $validated['student_type'] ?? 'umum';

        if ($validated['status'] === 'aktif') {
            $validated['exit_month'] = null;
            $validated['exit_year'] = null;
        }

        Student::create($validated);

        return redirect()->route('siswa.index')->with('success', 'Siswa berhasil ditambahkan!');
    }

    public function show($id)
    {
        return Inertia::render('siswa/show', [
            'student' => $this->getStudentProfile($id),
        ]);
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
            $paymentController = new PaymentController();
            $trxId = $paymentController->generateTransactionNumber();

            $transaction = Transaction::create([
                'transaction_id' => $trxId,
                'type' => 'in',
                'category' => 'SPP',
                'amount' => $paymentAmount,
                'student_id' => $student->id,
                'user_id' => Auth::id(),
                'transaction_date' => now(),
                'note' => 'Pembayaran SPP Otomatis',
            ]);

            $monthNotes = $paymentController->allocateSppPayment($student->id, $paymentAmount, $transaction->id);

            if (! empty($monthNotes)) {
                $transaction->update([
                    'note' => 'Pembayaran SPP: '.implode(', ', $monthNotes),
                ]);
            }
        });

        // Karena kita pakai Inertia.js, back() akan otomatis merender ulang data terbaru di layar!
        return back()->with('success', 'Pembayaran sebesar Rp '.number_format($request->amount, 0, ',', '.').' berhasil diproses!');
    }
}
