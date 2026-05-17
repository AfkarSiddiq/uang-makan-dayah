<?php

use App\Http\Controllers\AlumniController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\HistoryController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\SppPaymentController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\StudentImportController;
use App\Http\Controllers\TransactionImportController;
use App\Http\Controllers\TuitionArrearsController;
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
            'status' => 'Sukses',
        ]);
    })->name('dashboard');

    // Halaman List User
    Route::get('/users', function () {
        return Inertia::render('Admin/Users/Index');
    })->name('users.index');
});

// Public template download
Route::get('/siswa/import/template', [StudentImportController::class, 'template'])->name('siswa.import.template');

Route::middleware(['auth'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

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

    // Tuition Arrears
    Route::get('/tuition-arrears', [TuitionArrearsController::class, 'index'])->name('tuition-arrears.index');
    Route::get('/tuition-arrears/export-all', [TuitionArrearsController::class, 'exportAll'])->name('tuition-arrears.export-all');
    Route::get('/tuition-arrears/export-month', [TuitionArrearsController::class, 'exportByMonth'])->name('tuition-arrears.export-month');

    // tambah route lain

    // siswa CRUD
    Route::get('/siswa', [StudentController::class, 'index'])->name('siswa.index');
    Route::get('/siswa/create', [StudentController::class, 'create'])->name('siswa.create');
    Route::post('/siswa', [StudentController::class, 'store'])->name('siswa.store');
    // Import siswa - must come BEFORE /siswa/{id}
    Route::get('/siswa/import', [StudentImportController::class, 'create'])->name('siswa.import.create');
    Route::post('/siswa/import', [StudentImportController::class, 'store'])->name('siswa.import.store');
    Route::get('/siswa/export', [StudentImportController::class, 'export'])->name('siswa.export');
    Route::get('/siswa/{id}', [StudentController::class, 'show'])->name('siswa.show');
    Route::get('/siswa/{id}/edit', [StudentController::class, 'edit'])->name('siswa.edit');
    Route::put('/siswa/{id}', [StudentController::class, 'update'])->name('siswa.update');
    Route::delete('/siswa/{id}', [StudentController::class, 'destroy'])->name('siswa.destroy');

    // Update Spp
    Route::get('/tuition-per-month', [SppPaymentController::class, 'pengaturanMassal'])->name('spp.pengaturan');
    Route::post('/spp/bulk-update', [SppPaymentController::class, 'bulkUpdateAmount'])->name('spp.bulk_update');
    Route::post('/spp/generate-tahun', [SppPaymentController::class, 'generateTahunAjaran'])->name('spp.generate_tahun');

    // Route Untuk Alumni
    Route::prefix('alumni')->name('alumni.')->group(function () {
        Route::get('/', [AlumniController::class, 'index'])->name('index');
        Route::get('/tahun/{year}', [AlumniController::class, 'detail'])->name('detail');
    });

    // Route untuk Payment
    Route::resource('payment', PaymentController::class)->only(['index', 'create', 'store', 'edit', 'update', 'destroy']);
    Route::get('/payment/{payment}/print', [PaymentController::class, 'print'])->name('payment.print');

    // Transaction import/export
    Route::get('/transaction/import', [TransactionImportController::class, 'create'])->name('transaction.import.create');
    Route::post('/transaction/import', [TransactionImportController::class, 'store'])->name('transaction.import.store');
    Route::get('/transaction/import/template', [TransactionImportController::class, 'template'])->name('transaction.import.template');
    Route::get('/transaction/export', [TransactionImportController::class, 'export'])->name('transaction.export');

    // History
    Route::get('/payment-history', [HistoryController::class, 'index'])->name('history');

    // Category management
    Route::resource('category', CategoryController::class)->only(['index', 'store', 'update', 'destroy']);

    Route::post('/siswa/{id}/pay', [StudentController::class, 'paySpp'])->name('siswa.pay');


});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
