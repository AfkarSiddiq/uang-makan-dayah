<?php

namespace App\Http\Controllers;

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
        // 1. Ambil data siswa dan sertakan relasi bertingkat (sppPayments -> sppMonth)
        $student = Student::where('gender', $gender)
            ->with('sppPayments.sppMonth') 
            ->findOrFail($id);

        // 2. Urutkan tagihan menggunakan Collection PHP (Berdasarkan relasi tabel master)
        $sortedPayments = $student->sppPayments->sortBy(function ($payment) {
            // Buat format YYYYMM (Contoh: 202507) agar urutannya sempurna
            return sprintf('%04d%02d', $payment->sppMonth->year, $payment->sppMonth->month);
        })->values();

        // 3. Suntikkan (Inject) data dari tabel spp_months ke spp_payments 
        // agar kodingan React (Frontend) Anda tidak perlu diubah sama sekali!
        $sortedPayments->each(function ($payment) {
            $payment->month = $payment->sppMonth->month;
            $payment->year = $payment->sppMonth->year;
            $payment->amount = $payment->sppMonth->amount; // Harga master
            
            // Hapus relasi agar response JSON tetap bersih dan ringan
            unset($payment->sppMonth);
        });

        // 4. Timpa relasi sppPayments yang lama dengan yang sudah rapi
        $student->setRelation('sppPayments', $sortedPayments);

        return $student;
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

        if (in_array($validated['status'], ['lulus', 'pindah', 'berhenti'])) {
            $validated['exit_month'] = $validated['exit_month'] ?: null;
            $validated['exit_year'] = $validated['exit_year'] ?: null;
        } else {
            $validated['exit_month'] = null;
            $validated['exit_year'] = null;
        }

        $student->update($validated);

        return redirect()->route('siswa.index')->with('success', 'Data siswa berhasil diperbarui!');
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
            'new_spp_amount' => 'required|numeric|min:0',
            'start_year' => 'required|numeric|min:2020',
        ]);

        // 2. Eksekusi dengan Transaction agar Aman
        DB::transaction(function () use ($request) {

            // Ambil semua santriwan di kelas asal yang masih aktif
            $students = Student::where('gender', 'L')
                ->where('class', $request->old_class)
                ->where('status', 'aktif')
                ->get();

            foreach ($students as $student) {
                // A. Jika Lulus, cukup ubah status dan skip pembuatan SPP
                if ($request->is_graduating) {
                    $student->update([
                        'status' => 'lulus',
                        'exit_year' => $request->start_year,
                        'exit_month' => 6, // Biasanya lulus bulan Juni
                    ]);

                    continue;
                }

                // B. Jika Naik Kelas, ubah kelasnya
                $student->update(['class' => $request->new_class]);

                // C. Generate 12 Bulan Tagihan SPP Baru (Juli s.d Juni)
                $months = [
                    ['m' => 7,  'y' => $request->start_year],
                    ['m' => 8,  'y' => $request->start_year],
                    ['m' => 9,  'y' => $request->start_year],
                    ['m' => 10, 'y' => $request->start_year],
                    ['m' => 11, 'y' => $request->start_year],
                    ['m' => 12, 'y' => $request->start_year],
                    ['m' => 1,  'y' => $request->start_year + 1],
                    ['m' => 2,  'y' => $request->start_year + 1],
                    ['m' => 3,  'y' => $request->start_year + 1],
                    ['m' => 4,  'y' => $request->start_year + 1],
                    ['m' => 5,  'y' => $request->start_year + 1],
                    ['m' => 6,  'y' => $request->start_year + 1],
                ];

                foreach ($months as $date) {
                    SppPayment::create([
                        'student_id' => $student->id,
                        'month' => $date['m'],
                        'year' => $date['y'],
                        'amount' => $request->new_spp_amount,
                        'paid_amount' => 0,
                        'status' => 'unpaid',
                    ]);
                }
            }
        });

        // 3. Kembalikan ke halaman daftar kelas dengan pesan sukses
        return redirect()->route('santriwan.kelas')->with('success', 'Proses kenaikan kelas berhasil dan Tagihan SPP baru telah dibuat!');
    }

    public function prosesKenaikanSantriwati(Request $request)
    {
        // 1. Validasi Input dari React
        $request->validate([
            'old_class' => 'required|in:1,2,3,4,5,6',
            'is_graduating' => 'boolean',
            'new_class' => 'nullable|in:1,2,3,4,5,6',
            'new_spp_amount' => 'required|numeric|min:0',
            'start_year' => 'required|numeric|min:2020',
        ]);

        // 2. Eksekusi dengan Transaction agar Aman
        DB::transaction(function () use ($request) {

            // Ambil semua santriwan di kelas asal yang masih aktif
            $students = Student::where('gender', 'P')
                ->where('class', $request->old_class)
                ->where('status', 'aktif')
                ->get();

            foreach ($students as $student) {
                // A. Jika Lulus, cukup ubah status dan skip pembuatan SPP
                if ($request->is_graduating) {
                    $student->update([
                        'status' => 'lulus',
                        'exit_year' => $request->start_year,
                        'exit_month' => 6, // Biasanya lulus bulan Juni
                    ]);

                    continue;
                }

                // B. Jika Naik Kelas, ubah kelasnya
                $student->update(['class' => $request->new_class]);

                // C. Generate 12 Bulan Tagihan SPP Baru (Juli s.d Juni)
                $months = [
                    ['m' => 7,  'y' => $request->start_year],
                    ['m' => 8,  'y' => $request->start_year],
                    ['m' => 9,  'y' => $request->start_year],
                    ['m' => 10, 'y' => $request->start_year],
                    ['m' => 11, 'y' => $request->start_year],
                    ['m' => 12, 'y' => $request->start_year],
                    ['m' => 1,  'y' => $request->start_year + 1],
                    ['m' => 2,  'y' => $request->start_year + 1],
                    ['m' => 3,  'y' => $request->start_year + 1],
                    ['m' => 4,  'y' => $request->start_year + 1],
                    ['m' => 5,  'y' => $request->start_year + 1],
                    ['m' => 6,  'y' => $request->start_year + 1],
                ];

                foreach ($months as $date) {
                    SppPayment::create([
                        'student_id' => $student->id,
                        'month' => $date['m'],
                        'year' => $date['y'],
                        'amount' => $request->new_spp_amount,
                        'paid_amount' => 0,
                        'status' => 'unpaid',
                    ]);
                }
            }
        });

        // 3. Kembalikan ke halaman daftar kelas dengan pesan sukses
        return redirect()->route('santriwan.kelas')->with('success', 'Proses kenaikan kelas berhasil dan Tagihan SPP baru telah dibuat!');
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
            'entry_month' => 'required|integer|min:1|max:12',
            'entry_year' => 'required|integer|min:2020',
        ]);

        $validated['status'] = $validated['status'] ?? 'aktif';

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
            
            // 1. Catat ke tabel Buku Kas (Transactions)
            Transaction::create([
                'transaction_id'   => 'TRX-' . strtoupper(uniqid()), // Ganti dengan fungsi generate Anda jika ada
                'type'             => 'in',
                'category'         => 'SPP',
                'amount'           => $paymentAmount,
                'student_id'       => $student->id,
                'user_id'          => Auth::id(),
                'transaction_date' => now(),
                'note'             => 'Pembayaran SPP Otomatis via Profil Siswa',
            ]);

            // 2. Ambil tagihan yang belum lunas (beserta data relasi bulan)
            $tagihanBelumLunas = SppPayment::with('sppMonth')
                ->where('student_id', $student->id)
                ->whereIn('status', ['unpaid', 'partial'])
                ->get();

            // 3. Urutkan dari yang paling tua (Tahun -> Bulan)
            $tagihanTertua = $tagihanBelumLunas->sortBy(function ($payment) {
                return sprintf('%04d%02d', $payment->sppMonth->year, $payment->sppMonth->month);
            })->values();

            $sisaUang = $paymentAmount;

            // 4. Looping Waterfall: Lunasi dari yang paling tua
            foreach ($tagihanTertua as $tagihan) {
                // Jika uang sudah habis dialokasikan, hentikan proses
                if ($sisaUang <= 0) break;

                // Ambil harga asli bulan tersebut dari tabel master
                $hargaSPP = $tagihan->sppMonth->amount; 
                $kekurangan = $hargaSPP - $tagihan->paid_amount;

                // Skenario A: Uang cukup untuk melunasi bulan ini
                if ($sisaUang >= $kekurangan) {
                    $tagihan->paid_amount = $hargaSPP;
                    $tagihan->status = 'paid';
                    $tagihan->paid_at = now();
                    
                    $sisaUang -= $kekurangan; // Kurangi dompet sisa uang
                } 
                // Skenario B: Uang tidak cukup, jadi dicicil (Partial)
                else {
                    $tagihan->paid_amount += $sisaUang;
                    $tagihan->status = 'partial';
                    
                    $sisaUang = 0; // Uang habis
                }

                $tagihan->save();
            }
        });

        return back()->with('success', 'Pembayaran sebesar Rp ' . number_format($request->amount, 0, ',', '.') . ' berhasil diproses!');
    }
}
