<?php

use App\Http\Controllers\SppPaymentController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\PaymentController;
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

    Route::get('/santriwan', [StudentController::class, 'indexSantriwan'])->name('santriwan.kelas');
    Route::get('/santriwan/kenaikan', [StudentController::class, 'kenaikanSantriwan'])->name('santriwan.kenaikan');
    Route::post('/santriwan/kenaikan', [StudentController::class, 'prosesKenaikanSantriwan'])->name('santriwan.kenaikan.proses');
    Route::get('/santriwan/class/{kelas}', [StudentController::class, 'detailKelasSantriwan'])->name('santriwan.detail');
    Route::get('/santriwan/santri/{id}', [StudentController::class, 'showSantriwan'])->name('santriwan.show');


    Route::get('/santriwati', [StudentController::class, 'indexSantriwati'])->name('santriwati.kelas');
    Route::get('/santriwati/kenaikan', [StudentController::class, 'kenaikanSantriwati'])->name('santriwati.kenaikan');
    Route::post('/santriwati/kenaikan', [StudentController::class, 'prosesKenaikanSantriwati'])->name('santriwati.kenaikan.proses');
    Route::get('/santriwati/class/{kelas}', [StudentController::class, 'detailKelasSantriwati'])->name('santriwati.detail');
    Route::get('/santriwati/santri/{id}', [StudentController::class, 'showSantriwati'])->name('santriwati.show');
    // tambah route lain

    // update siswa
    Route::put('/siswa/{id}', [StudentController::class, 'update'])->name('siswa.update');

    // Update Spp
    Route::get('/tuition-per-month', [SppPaymentController::class, 'pengaturanMassal'])->name('spp.pengaturan');
    Route::post('/spp/bulk-update', [SppPaymentController::class, 'bulkUpdateAmount'])->name('spp.bulk_update');

    Route::resource('payment', PaymentController::class)->only(['index', 'create', 'store', 'edit', 'update', 'destroy']);
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
