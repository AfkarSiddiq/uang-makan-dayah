<?php

use App\Http\Controllers\StudentController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;


Route::get('/', function () {
    return redirect()->route('login');
});

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');


Route::prefix('admin')->name('admin.')->group(function () {
    
    // Halaman Dashboard
    Route::get('/dashboard', function () {
        return Inertia::render('admin/dashboard', [
            'status' => 'Sukses' 
        ]);
    })->name('dashboard');

    // Halaman List User
    Route::get('/users', function () {
        return Inertia::render('Admin/Users/Index');
    })->name('users.index');
});

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::get('santriwan', [StudentController::class, 'indexSantriwan'])->name('santriwan.kelas');
    Route::get('santriwan/class/{kelas}', [StudentController::class, 'detailKelasSantriwan'])->name('santriwan.detail');
    Route::get('santriwan/santri/{id}', [StudentController::class, 'showSantriwan'])->name('santriwan.show');
   
    Route::get('santriwati', [StudentController::class, 'indexSantriwati'])->name('santriwati.kelas');
    Route::get('santriwati/class/{kelas}', [StudentController::class, 'detailKelasSantriwati'])->name('santriwati.detail');
    Route::get('santriwati/santri/{id}', [StudentController::class, 'indexSantriwati'])->name('santriwati.show');
    // tambah route lain
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
