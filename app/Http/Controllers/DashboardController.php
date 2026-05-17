<?php

namespace App\Http\Controllers;

use App\Models\Category;
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
        $query = Transaction::with(['student', 'user']);

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

        return Inertia::render('dashboard', [
            'transactions' => $transactions,
            'summary' => $summary,
            'filters' => $request->only(['type', 'category', 'date_from', 'date_to', 'search', 'sort_by', 'sort_dir']),
            'categories' => $this->getCategories(),
        ]);
    }
}
