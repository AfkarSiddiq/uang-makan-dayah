<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Inertia\Inertia;

class HistoryController extends Controller
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

        $query = Transaction::with(['student', 'user', 'logs.user', 'sppPayments.sppMonth']);

        if (count($allowedTypes) === 1) {
            $query->where('transactions.type', $allowedTypes[0]);
        }

        // --- SORTING ---
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
                ->select('transactions.*') // Pastikan hanya menyeleksi kolom transaksi agar ID tidak tertimpa ID siswa
                ->orderBy('students.name', $sortDir);
        } else {
            $query->orderBy('transactions.' . $sortBy, $sortDir);
        }

        // Secondary sort
        if ($sortBy !== 'created_at') {
            $query->orderBy('transactions.created_at', 'desc');
        }

        // --- FILTERING ---
        if ($request->filled('type')) {
            $query->where('transactions.type', $request->type);
        }

        if ($request->filled('category')) {
            $query->where('transactions.category', $request->category);
        }

        if ($request->filled('date_from')) {
            $query->where('transactions.transaction_date', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->where('transactions.transaction_date', '<=', $request->date_to);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('transactions.transaction_id', 'like', "%{$search}%")
                    ->orWhere('transactions.note', 'like', "%{$search}%")
                    ->orWhereHas('student', function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%")
                            ->orWhere('nisn', 'like', "%{$search}%");
                    });
            });
        }

        // =========================================================================
        // PERBAIKAN: DINAMIS MENERIMA "PER PAGE" DARI REACT
        // =========================================================================
        // Default 10, maksimal 100 agar database tidak nge-hang jika diakali user
        $perPage = $request->input('per_page', 10);
        $perPage = is_numeric($perPage) && $perPage > 0 && $perPage <= 100 ? (int) $perPage : 10;

        $transactions = $query->paginate($perPage)->withQueryString();

        // --- SUMMARY (RINGKASAN) ---
        // Anda juga bisa mengoptimalkan summary ini jika data sudah jutaan baris,
        // tapi untuk skala sekolah/yayasan, cara Anda ini masih sangat aman dan cepat.
        $totalIn = in_array('in', $allowedTypes)
            ? Transaction::where('type', 'in')
                ->when($request->date_from, fn ($q) => $q->where('transaction_date', '>=', $request->date_from))
                ->when($request->date_to, fn ($q) => $q->where('transaction_date', '<=', $request->date_to))
                ->when($request->category, fn ($q) => $q->where('category', $request->category))
                ->when($request->search, function ($q) use ($request) {
                    $search = $request->search;
                    $q->where(function ($sq) use ($search) {
                        $sq->where('transaction_id', 'like', "%{$search}%")
                            ->orWhere('note', 'like', "%{$search}%")
                            ->orWhereHas('student', function ($sq2) use ($search) {
                                $sq2->where('name', 'like', "%{$search}%")
                                    ->orWhere('nisn', 'like', "%{$search}%");
                            });
                    });
                })
                ->sum('amount')
            : 0;

        $totalOut = in_array('out', $allowedTypes)
            ? Transaction::where('type', 'out')
                ->when($request->date_from, fn ($q) => $q->where('transaction_date', '>=', $request->date_from))
                ->when($request->date_to, fn ($q) => $q->where('transaction_date', '<=', $request->date_to))
                ->when($request->category, fn ($q) => $q->where('category', $request->category))
                ->when($request->search, function ($q) use ($request) {
                    $search = $request->search;
                    $q->where(function ($sq) use ($search) {
                        $sq->where('transaction_id', 'like', "%{$search}%")
                            ->orWhere('note', 'like', "%{$search}%")
                            ->orWhereHas('student', function ($sq2) use ($search) {
                                $sq2->where('name', 'like', "%{$search}%")
                                    ->orWhere('nisn', 'like', "%{$search}%");
                            });
                    });
                })
                ->sum('amount')
            : 0;

        $summary = [
            'total_in' => $totalIn,
            'total_out' => $totalOut,
            'balance' => $totalIn - $totalOut,
        ];

        return Inertia::render('history/history', [
            'transactions' => $transactions,
            'summary' => $summary,
            'filters' => $request->only(['type', 'category', 'date_from', 'date_to', 'search', 'sort_by', 'sort_dir', 'per_page']),
            'categories' => $this->getCategories(),
            'allowedTypes' => $allowedTypes,
        ]);
    }
}
