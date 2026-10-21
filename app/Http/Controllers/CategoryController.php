<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class CategoryController extends Controller
{
    public function index()
    {
        // Pastikan kategori sistem 'Uang Makan Bulanan' selalu tersedia tanpa merusak database
        Category::firstOrCreate(
            ['name' => 'Uang Makan Bulanan'],
            ['type' => 'in', 'is_active' => true]
        );

        $categories = Category::where('is_active', true)
            ->orderBy('type')
            ->orderBy('name')
            ->get()
            ->groupBy('type');

        return Inertia::render('category/index', [
            'categories' => $categories,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:50'],
            'type' => ['required', Rule::in(['in', 'out', 'both'])],
        ]);

        Category::create($validated);

        return back()->with('success', 'Kategori berhasil ditambahkan.');
    }

    public function update(Request $request, Category $category)
    {
        if ($category->name === 'Uang Makan Bulanan') {
            return back()->with('error', 'Kategori "Uang Makan Bulanan" adalah kategori sistem dan tidak dapat diubah.');
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:50'],
            'type' => ['required', Rule::in(['in', 'out', 'both'])],
        ]);

        $category->update($validated);

        return back()->with('success', 'Kategori berhasil diperbarui.');
    }

    public function destroy(Category $category)
    {
        if ($category->name === 'Uang Makan Bulanan') {
            return back()->with('error', 'Kategori "Uang Makan Bulanan" adalah kategori sistem dan tidak dapat dihapus.');
        }

        $category->update(['is_active' => false]);

        return back()->with('success', 'Kategori berhasil dihapus.');
    }
}
