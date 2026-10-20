<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\SppMonth;
use App\Models\SppPayment;
use App\Models\Student;
use App\Models\Transaction;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class PaymentController extends Controller
{
    private function getCategories(): array
    {
        $categories = Category::where('is_active', true)->get();

        return [
            'in' => $categories->whereIn('type', ['in', 'both'])->pluck('name')->toArray(),
            'out' => $categories->whereIn('type', ['out', 'both'])->pluck('name')->toArray(),
        ];
    }

    public function index(Request $request)
    {
        $user = $request->user();
        $allowedTypes = [];
        if ($user->hasPermission('pembayaran.masuk.view')) {
            $allowedTypes[] = 'in';
        }
        if ($user->hasPermission('pembayaran.keluar.view')) {
            $allowedTypes[] = 'out';
        }

        $query = Transaction::with(['student', 'user']);

        if (count($allowedTypes) === 1) {
            $query->where('type', $allowedTypes[0]);
        }

        $sortBy = $request->sort_by ?? 'transaction_date';
        $sortDir = $request->sort_dir ?? 'desc';
        $validSortColumns = ['transaction_id', 'transaction_date', 'category', 'amount', 'student_name'];
        $validSortDirs = ['asc', 'desc'];

        if (! in_array($sortBy, $validSortColumns)) {
            $sortBy = 'transaction_date';
        }
        if (! in_array($sortDir, $validSortDirs)) {
            $sortDir = 'desc';
        }

        if ($sortBy === 'student_name') {
            $query->leftJoin('students', 'transactions.student_id', '=', 'students.id')
                ->orderBy('students.name', $sortDir);
        } else {
            $query->orderBy($sortBy, $sortDir);
        }
        if ($sortBy !== 'created_at') {
            $query->orderBy('transactions.created_at', 'desc');
        }

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        if ($request->filled('date_from')) {
            $query->where('transaction_date', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->where('transaction_date', '<=', $request->date_to);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('transaction_id', 'like', "%{$search}%")
                    ->orWhere('note', 'like', "%{$search}%")
                    ->orWhereHas('student', function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%")
                            ->orWhere('nisn', 'like', "%{$search}%");
                    });
            });
        }

        $transactions = $query->paginate(15)->withQueryString();

        $totalIn = in_array('in', $allowedTypes)
            ? Transaction::where('type', 'in')
                ->when($request->date_from, fn ($q) => $q->where('transaction_date', '>=', $request->date_from))
                ->when($request->date_to, fn ($q) => $q->where('transaction_date', '<=', $request->date_to))
                ->sum('amount')
            : 0;

        $totalOut = in_array('out', $allowedTypes)
            ? Transaction::where('type', 'out')
                ->when($request->date_from, fn ($q) => $q->where('transaction_date', '>=', $request->date_from))
                ->when($request->date_to, fn ($q) => $q->where('transaction_date', '<=', $request->date_to))
                ->sum('amount')
            : 0;

        $summary = [
            'total_in' => $totalIn,
            'total_out' => $totalOut,
            'balance' => $totalIn - $totalOut,
        ];

        return Inertia::render('payment/Index', [
            'transactions' => $transactions,
            'summary' => $summary,
            'filters' => $request->only(['type', 'category', 'date_from', 'date_to', 'search', 'sort_by', 'sort_dir']),
            'categories' => $this->getCategories(),
            'allowedTypes' => $allowedTypes,
        ]);
    }

    public function create(Request $request)
    {
        $user = $request->user();
        $allowedCreateTypes = [];
        if ($user->hasPermission('pembayaran.masuk.create')) {
            $allowedCreateTypes[] = 'in';
        }
        if ($user->hasPermission('pembayaran.keluar.create')) {
            $allowedCreateTypes[] = 'out';
        }

        $studentsByGender = Student::where('status', 'aktif')
            ->orderBy('class')
            ->orderBy('name')
            ->get(['id', 'nisn', 'name', 'gender', 'class'])
            ->groupBy('gender')
            ->map(fn ($genderGroup) => $genderGroup->groupBy('class')->map(fn ($classGroup) => $classGroup->values()));

        $classes = Student::where('status', 'aktif')
            ->distinct()
            ->orderBy('class')
            ->pluck('class');

        return Inertia::render('payment/Create', [
            'studentsByGender' => $studentsByGender,
            'classes' => $classes,
            'categories' => $this->getCategories(),
            'allowedCreateTypes' => $allowedCreateTypes,
        ]);
    }

    public function store(Request $request)
    {
        $user = $request->user();
        $allowedCreateTypes = [];
        if ($user->hasPermission('pembayaran.masuk.create')) {
            $allowedCreateTypes[] = 'in';
        }
        if ($user->hasPermission('pembayaran.keluar.create')) {
            $allowedCreateTypes[] = 'out';
        }

        $validated = $request->validate([
            'type' => ['required', Rule::in(count($allowedCreateTypes) > 0 ? $allowedCreateTypes : ['in', 'out'])],
            'category' => ['required', 'string', 'max:50'],
            'amount' => ['required', 'integer', 'min:1'],
            'student_id' => [
                'nullable',
                Rule::requiredIf(fn () => $request->category === 'SPP'),
                'exists:students,id',
            ],
            'transaction_date' => ['required', 'date'],
            'note' => ['nullable', 'string', 'max:255'],
        ]);

        $validated['transaction_id'] = $this->generateTransactionNumber();
        $validated['user_id'] = Auth::id();

        DB::transaction(function () use ($validated) {
            $transaction = Transaction::create($validated);

            if ($validated['type'] === 'in' && $validated['category'] === 'SPP' && ! empty($validated['student_id'])) {
                $monthNotes = $this->allocateSppPayment($validated['student_id'], $validated['amount'], $transaction->id);
                if (! empty($monthNotes)) {
                    $notePrefix = ! empty($validated['note']) ? $validated['note'].' | ' : '';
                    $transaction->update([
                        'note' => $notePrefix.'Rincian SPP: '.implode(', ', $monthNotes),
                    ]);
                }
            }
        });

        return redirect()->route('payment.index')->with('success', 'Transaksi berhasil dicatat.');
    }

    public function edit(Transaction $payment)
    {
        $students = Student::where('status', 'aktif')
            ->orderBy('name')
            ->get(['id', 'nisn', 'name', 'class']);

        return Inertia::render('payment/Edit', [
            'transaction' => $payment,
            'students' => $students,
            'categories' => $this->getCategories(),
        ]);
    }

    public function update(Request $request, Transaction $payment)
    {
        $validated = $request->validate([
            'type' => ['required', Rule::in(['in', 'out'])],
            'category' => ['required', 'string', 'max:50'],
            'amount' => ['required', 'integer', 'min:1'],
            'student_id' => [
                'nullable',
                Rule::requiredIf(fn () => $request->category === 'SPP'),
                'exists:students,id',
            ],
            'transaction_date' => ['required', 'date'],
            'note' => ['nullable', 'string', 'max:255'],
        ]);

        $payment->update($validated);

        return redirect()->route('payment.index')->with('success', 'Transaksi berhasil diperbarui.');
    }

    public function destroy(Transaction $payment)
    {
        $payment->delete();

        return redirect()->route('payment.index')->with('success', 'Transaksi berhasil dihapus.');
    }

    public function print(Transaction $payment)
    {
        $payment->load(['student', 'user', 'sppPayments.sppMonth']);

        $typeLabel = $payment->type === 'in' ? 'Pemasukan' : 'Pengeluaran';
        $formattedAmount = number_format($payment->amount, 0, ',', '.');

        $pdf = Pdf::loadView('pdf.transaction', [
            'transaction' => $payment,
            'typeLabel' => $typeLabel,
            'formattedAmount' => $formattedAmount,
            'transactionDate' => Carbon::parse($payment->transaction_date)->format('d/m/Y'),
        ]);

        $filename = 'Bukti_Transaksi_'.$payment->transaction_id.'.pdf';

        return $pdf->download($filename);
    }

    public function generateTransactionNumber(): string
    {
        $year = date('Y');
        $prefix = 'TRX-'.$year.'-';

        $maxSequence = Transaction::where('transaction_id', 'like', $prefix.'%')
            ->get()
            ->map(function ($t) use ($prefix) {
                $numStr = str_replace($prefix, '', $t->transaction_id);

                return is_numeric($numStr) ? (int) $numStr : 0;
            })
            ->max() ?? 0;

        $sequence = $maxSequence + 1;
        $transactionId = sprintf('%s%04d', $prefix, $sequence);

        while (Transaction::where('transaction_id', $transactionId)->exists()) {
            $sequence++;
            $transactionId = sprintf('%s%04d', $prefix, $sequence);
        }

        return $transactionId;
    }

    public function allocateSppPayment($studentId, $paymentAmount, $transactionId)
    {
        $student = Student::findOrFail($studentId);
        $sisaUang = $paymentAmount;

        // 1. Pastikan master SPP tersedia untuk rentang tahun ajaran santri
        $entryYearStart = $student->getAcademicYearStart();
        SppMonth::ensureAcademicYearsExist($entryYearStart);

        $semuaBulanMaster = SppMonth::orderBy('year', 'asc')->orderBy('month', 'asc')->get();

        // 2. Filter: Hanya ambil bulan yang relevan (mulai dari bulan masuk hingga bulan keluar)
        $bulanValid = $semuaBulanMaster->filter(function ($master) use ($student) {
            return $student->isMonthBillable((int) $master->year, (int) $master->month);
        });

        $monthNotes = [];

        // 3. Looping: Telusuri satu per satu dari bulan tertua
        foreach ($bulanValid as $master) {

            // Jika uang di tangan sudah habis, hentikan pencarian!
            if ($sisaUang <= 0) {
                break;
            }

            // Cek apakah bulan ini sudah pernah diangsur/dibayar?
            $tagihan = SppPayment::where('student_id', $student->id)
                ->where('spp_month_id', $master->id)
                ->first();

            $terbayarSebelumnya = $tagihan ? $tagihan->paid_amount : 0;

            // Jika sudah LUNAS sebelumnya, lewati bulan ini dan cari bulan depannya
            if ($terbayarSebelumnya >= $master->amount) {
                continue;
            }

            // Berapa hutang/kekurangan untuk bulan ini?
            $kekurangan = $master->amount - $terbayarSebelumnya;

            $bayarSekarang = 0;
            $statusBaru = 'unpaid';

            // Skenario A: Uang CUKUP untuk melunasi bulan ini
            if ($sisaUang >= $kekurangan) {
                $bayarSekarang = $terbayarSebelumnya + $kekurangan;
                $statusBaru = 'paid';
                $sisaUang -= $kekurangan; // Kurangi sisa dompet
            }
            // Skenario B: Uang KURANG (Hanya bisa menyicil)
            else {
                $bayarSekarang = $terbayarSebelumnya + $sisaUang;
                $statusBaru = 'partial';
                $sisaUang = 0; // Uang habis
            }

            // 4. UPDATE OR CREATE dengan transaction_id
            SppPayment::updateOrCreate(
                [
                    'student_id' => $student->id,
                    'spp_month_id' => $master->id,
                ],
                [
                    'paid_amount' => $bayarSekarang,
                    'status' => $statusBaru,
                    'paid_at' => now(),
                    'transaction_id' => $transactionId,
                ]
            );

            $sisaBulanIni = $master->amount - $bayarSekarang;
            if ($statusBaru === 'paid') {
                $monthNotes[] = "{$master->name} {$master->year} (Lunas)";
            } else {
                $monthNotes[] = "{$master->name} {$master->year} (Kurang - Sisa Rp ".number_format($sisaBulanIni, 0, ',', '.').')';
            }
        }

        return $monthNotes;
    }
}
