<?php

namespace App\Http\Controllers;

use App\Models\SppPayment;
use App\Models\SppMonth;
use App\Models\Student;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class PaymentController extends Controller
{
    /* TODO: create a way to add category on the website for admin to add on their own */
    /* but add a default category like spp etc */
    private const INCOME_CATEGORIES = ['SPP', 'Infaq', 'Sumbangan', 'Lainnya'];

    private const EXPENSE_CATEGORIES = ['Gaji', 'Operasional', 'Listrik', 'Lainnya'];

    public function index(Request $request)
    {
        $query = Transaction::with(['student', 'user'])
            ->orderBy('transaction_date', 'desc')
            ->orderBy('created_at', 'desc');

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

        $summary = [
            'total_in' => Transaction::where('type', 'in')
                ->when($request->date_from, fn ($q) => $q->where('transaction_date', '>=', $request->date_from))
                ->when($request->date_to, fn ($q) => $q->where('transaction_date', '<=', $request->date_to))
                ->sum('amount'),
            'total_out' => Transaction::where('type', 'out')
                ->when($request->date_from, fn ($q) => $q->where('transaction_date', '>=', $request->date_from))
                ->when($request->date_to, fn ($q) => $q->where('transaction_date', '<=', $request->date_to))
                ->sum('amount'),
        ];
        $summary['balance'] = $summary['total_in'] - $summary['total_out'];

        return Inertia::render('payment/Index', [
            'transactions' => $transactions,
            'summary' => $summary,
            'filters' => $request->only(['type', 'category', 'date_from', 'date_to', 'search']),
            'categories' => [
                'in' => self::INCOME_CATEGORIES,
                'out' => self::EXPENSE_CATEGORIES,
            ],
        ]);
    }

    public function create()
    {
        $studentsByGender = Student::where('status', 'aktif')
            ->orderBy('class')
            ->orderBy('name')
            ->get(['id', 'nisn', 'name', 'class', 'gender'])
            ->groupBy('gender')
            ->map(fn ($group) => $group->groupBy('class')->map(fn ($cls) => $cls->values()));

        $classes = Student::where('status', 'aktif')
            ->distinct()
            ->orderBy('class')
            ->pluck('class');

        return Inertia::render('payment/Create', [
            'studentsByGender' => $studentsByGender,
            'classes' => $classes,
            'categories' => [
                'in' => self::INCOME_CATEGORIES,
                'out' => self::EXPENSE_CATEGORIES,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'type' => ['required', Rule::in(['in', 'out'])],
            'category' => ['required', 'string', 'max:50'],
            'amount' => ['required', 'integer', 'min:1'],
            'student_id' => ['nullable', 'exists:students,id'],
            'transaction_date' => ['required', 'date'],
            'note' => ['nullable', 'string', 'max:255'],
        ]);

        $validated['transaction_id'] = $this->generateTransactionNumber();
        $validated['user_id'] = Auth::id();

        DB::transaction(function () use ($validated) {
            $transaction = Transaction::create($validated);

            if ($validated['type'] === 'in' && $validated['category'] === 'SPP' && ! empty($validated['student_id'])) {
                $this->allocateSppPayment($validated['student_id'], $validated['amount'], $transaction->id);
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
            'categories' => [
                'in' => self::INCOME_CATEGORIES,
                'out' => self::EXPENSE_CATEGORIES,
            ],
        ]);
    }

    public function update(Request $request, Transaction $payment)
    {
        $validated = $request->validate([
            'type' => ['required', Rule::in(['in', 'out'])],
            'category' => ['required', 'string', 'max:50'],
            'amount' => ['required', 'integer', 'min:1'],
            'student_id' => ['nullable', 'exists:students,id'],
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

    private function generateTransactionNumber(): string
    {
        $year = date('Y');
        $lastTransaction = Transaction::whereYear('transaction_date', $year)
            ->orderBy('id', 'desc')
            ->first();

        $sequence = 1;
        if ($lastTransaction && preg_match('/TRX-'.$year.'-(\d+)/', $lastTransaction->transaction_id, $matches)) {
            $sequence = (int) $matches[1] + 1;
        }

        return sprintf('TRX-%s-%04d', $year, $sequence);
    }

    private function allocateSppPayment($studentId, $paymentAmount, $transactionId)
    {
        $student = Student::findOrFail($studentId);
        $sisaUang = $paymentAmount;

        // 1. Ambil "Buku Menu" (Semua Bulan Master) dari yang paling lama ke baru
        $semuaBulanMaster = SppMonth::orderBy('year', 'asc')->orderBy('month', 'asc')->get();

        // 2. Filter: Hanya ambil bulan yang relevan (mulai dari bulan masuk santri)
        $bulanValid = $semuaBulanMaster->filter(function ($master) use ($student) {
            $bulanMasterSkor = ($master->year * 12) + $master->month;
            $bulanMasukSkor = ($student->entry_year * 12) + $student->entry_month;

            return $bulanMasterSkor >= $bulanMasukSkor;
        });

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

            // 4. THE MAGIC: UPDATE OR CREATE
            // Jika data belum ada, buat baris baru (Create).
            // Jika data sudah ada (partial), perbarui datanya (Update).
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

    }
}
