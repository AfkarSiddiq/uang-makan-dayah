<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Student;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
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
        $baseQuery = Transaction::query();

        if ($request->filled('type')) {
            $baseQuery->where('type', $request->type);
        }

        if ($request->filled('category')) {
            $baseQuery->where('category', $request->category);
        }

        if ($request->filled('date_from')) {
            $baseQuery->where('transaction_date', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $baseQuery->where('transaction_date', '<=', $request->date_to);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $baseQuery->where(function ($q) use ($search) {
                $q->where('transaction_id', 'like', "%{$search}%")
                    ->orWhere('note', 'like', "%{$search}%")
                    ->orWhereHas('student', function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%")
                            ->orWhere('nisn', 'like', "%{$search}%");
                    });
            });
        }

        // 5 Transaksi Terbaru
        $latestTransactions = (clone $baseQuery)->with(['student', 'user'])
            ->orderBy('transaction_date', 'desc')
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();

        // Data Visualisasi Kategori Pemasukan
        $inCategories = (clone $baseQuery)->where('type', 'in')
            ->selectRaw('category, SUM(amount) as total')
            ->groupBy('category')
            ->orderByDesc('total')
            ->get();

        // Data Visualisasi Kategori Pengeluaran
        $outCategories = (clone $baseQuery)->where('type', 'out')
            ->selectRaw('category, SUM(amount) as total')
            ->groupBy('category')
            ->orderByDesc('total')
            ->get();

        // Tren 6 Bulan Terakhir
        $monthlyTrend = [];
        for ($i = 5; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $year = $date->year;
            $month = $date->month;
            $in = (clone $baseQuery)->where('type', 'in')->whereYear('transaction_date', $year)->whereMonth('transaction_date', $month)->sum('amount');
            $out = (clone $baseQuery)->where('type', 'out')->whereYear('transaction_date', $year)->whereMonth('transaction_date', $month)->sum('amount');
            $monthlyTrend[] = [
                'year' => $year,
                'month' => $month,
                'in' => (float) $in,
                'out' => (float) $out,
            ];
        }

        // Query untuk tabel transaksi lengkap paginasi
        $query = (clone $baseQuery)->with(['student', 'user']);

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
                ->select('transactions.*')
                ->orderBy('students.name', $sortDir);
        } else {
            $query->orderBy($sortBy, $sortDir);
        }
        if ($sortBy !== 'created_at') {
            $query->orderBy('transactions.created_at', 'desc');
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
        $summary['balance'] = (float)$summary['total_in'] - (float)$summary['total_out'];
        $studentStats = [
            'total_aktif' => Student::where('status', 'aktif')->count(),
            'santriwan_aktif' => Student::where('status', 'aktif')->where('gender', 'L')->count(),
            'santriwati_aktif' => Student::where('status', 'aktif')->where('gender', 'P')->count(),
            'total_non_aktif' => Student::whereIn('status', ['lulus', 'pindah', 'berhenti'])->count(),
        ];

        return Inertia::render('dashboard', [
            'transactions' => $transactions,
            'latest_transactions' => $latestTransactions,
            'chart_data' => [
                'in_categories' => $inCategories,
                'out_categories' => $outCategories,
                'monthly_trend' => $monthlyTrend,
            ],
            'summary' => $summary,
            'student_stats' => $studentStats,
            'filters' => $request->only(['type', 'category', 'date_from', 'date_to', 'search', 'sort_by', 'sort_dir']),
            'categories' => $this->getCategories(),
        ]);
    }
}
