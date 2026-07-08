<?php

use App\Http\Controllers\AlumniController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\HistoryController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\SppPaymentController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\StudentImportController;
use App\Http\Controllers\TransactionImportController;
use App\Http\Controllers\TuitionArrearsController;
use App\Http\Controllers\UserController;
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
    Route::get('/dashboard', [DashboardController::class, 'index'])
        ->name('dashboard')
        ->middleware(['permission:dashboard.view']);

    Route::get('/santriwan', [StudentController::class, 'indexSantriwan'])
        ->name('santriwan.kelas')
        ->middleware(['permission:siswa.view']);
    Route::get('/santriwan/kenaikan', [StudentController::class, 'kenaikanSantriwan'])
        ->name('santriwan.kenaikan')
        ->middleware(['permission:kenaikan.view']);
    Route::post('/santriwan/kenaikan', [StudentController::class, 'prosesKenaikanSantriwan'])
        ->name('santriwan.kenaikan.proses')
        ->middleware(['permission:kenaikan.process']);
    Route::get('/santriwan/class/{kelas}', [StudentController::class, 'detailKelasSantriwan'])
        ->name('santriwan.detail')
        ->middleware(['permission:siswa.view']);
    Route::get('/santriwan/santri/{id}', [StudentController::class, 'showSantriwan'])
        ->name('santriwan.show')
        ->middleware(['permission:siswa.view']);

    Route::get('/santriwati', [StudentController::class, 'indexSantriwati'])
        ->name('santriwati.kelas')
        ->middleware(['permission:siswa.view']);
    Route::get('/santriwati/kenaikan', [StudentController::class, 'kenaikanSantriwati'])
        ->name('santriwati.kenaikan')
        ->middleware(['permission:kenaikan.view']);
    Route::post('/santriwati/kenaikan', [StudentController::class, 'prosesKenaikanSantriwati'])
        ->name('santriwati.kenaikan.proses')
        ->middleware(['permission:kenaikan.process']);
    Route::get('/santriwati/class/{kelas}', [StudentController::class, 'detailKelasSantriwati'])
        ->name('santriwati.detail')
        ->middleware(['permission:siswa.view']);
    Route::get('/santriwati/santri/{id}', [StudentController::class, 'showSantriwati'])
        ->name('santriwati.show')
        ->middleware(['permission:siswa.view']);

    // Tuition Arrears
    // TODO: refactor the permission middleware
    Route::get('/tuition-arrears', [TuitionArrearsController::class, 'index'])
        ->name('tuition-arrears.index')
        ->middleware(['permission:spp.tunggakan']);
    Route::get('/tuition-arrears/export-all', [TuitionArrearsController::class, 'exportAll'])
        ->name('tuition-arrears.export-all')
        ->middleware(['permission:spp.tunggakan']);
    Route::get('/tuition-arrears/export-month', [TuitionArrearsController::class, 'exportByMonth'])
        ->name('tuition-arrears.export-month')
        ->middleware(['permission:spp.tunggakan']);

    // Update Spp
    Route::get('/tuition-per-month', [SppPaymentController::class, 'pengaturanMassal'])
        ->name('spp.pengaturan')
        ->middleware(['permission:spp.view']);
    Route::post('/spp/bulk-update', [SppPaymentController::class, 'bulkUpdateAmount'])
        ->name('spp.bulk_update')
        ->middleware(['permission:spp.edit']);
    Route::post('/spp/generate-tahun', [SppPaymentController::class, 'generateTahunAjaran'])
        ->name('spp.generate_tahun')
        ->middleware(['permission:spp.edit']);

    // Route Untuk Alumni
    Route::prefix('alumni')->name('alumni.')->group(function () {
        Route::get('/', [AlumniController::class, 'index'])->name('index')
            ->middleware(['permission:siswa.view']);
        Route::get('/tahun/{year}', [AlumniController::class, 'detail'])->name('detail')
            ->middleware(['permission:siswa.view']);
    });

    // siswa CRUD
    Route::get('/siswa', [StudentController::class, 'index'])
        ->name('siswa.index')
        ->middleware(['permission:siswa.view']);
    Route::get('/siswa/create', [StudentController::class, 'create'])
        ->name('siswa.create')
        ->middleware(['permission:siswa.create']);
    Route::post('/siswa', [StudentController::class, 'store'])
        ->name('siswa.store')
        ->middleware(['permission:siswa.create']);
    Route::get('/siswa/import', [StudentImportController::class, 'create'])
        ->name('siswa.import.create')
        ->middleware(['permission:siswa.import']);
    Route::post('/siswa/import', [StudentImportController::class, 'store'])
        ->name('siswa.import.store')
        ->middleware(['permission:siswa.import']);
    Route::get('/siswa/export', [StudentImportController::class, 'export'])
        ->name('siswa.export')
        ->middleware(['permission:siswa.export']);
    Route::get('/siswa/{id}', [StudentController::class, 'show'])->name('siswa.show');
    Route::get('/siswa/{id}/edit', [StudentController::class, 'edit'])
        ->name('siswa.edit')
        ->middleware(['permission:siswa.edit']);
    Route::put('/siswa/{id}', [StudentController::class, 'update'])
        ->name('siswa.update')
        ->middleware(['permission:siswa.edit']);
    Route::delete('/siswa/{id}', [StudentController::class, 'destroy'])
        ->name('siswa.destroy')
        ->middleware(['permission:siswa.delete']);
    Route::post('/siswa/{id}/pay', [StudentController::class, 'paySpp'])
        ->name('siswa.pay')
        ->middleware(['permission:spp.create']);

    // Route untuk Payment
    Route::get('/payment', [PaymentController::class, 'index'])
        ->name('payment.index')
        ->middleware(['permission:pembayaran.masuk.view|pembayaran.keluar.view']);
    Route::get('/payment/create', [PaymentController::class, 'create'])
        ->name('payment.create')
        ->middleware(['permission:pembayaran.create']);
    Route::post('/payment', [PaymentController::class, 'store'])
        ->name('payment.store')
        ->middleware(['permission:pembayaran.create']);
    Route::get('/payment/{payment}/edit', [PaymentController::class, 'edit'])
        ->name('payment.edit')
        ->middleware(['permission:pembayaran.edit']);
    Route::put('/payment/{payment}', [PaymentController::class, 'update'])
        ->name('payment.update')
        ->middleware(['permission:pembayaran.edit']);
    Route::delete('/payment/{payment}', [PaymentController::class, 'destroy'])
        ->name('payment.destroy')
        ->middleware(['permission:pembayaran.delete']);
    Route::get('/payment/{payment}/print', [PaymentController::class, 'print'])
        ->name('payment.print')
        ->middleware(['permission:pembayaran.print']);

    // Transaction import/export
    Route::get('/transaction/import', [TransactionImportController::class, 'create'])
        ->name('transaction.import.create')
        ->middleware(['permission:pembayaran.import']);
    Route::post('/transaction/import', [TransactionImportController::class, 'store'])
        ->name('transaction.import.store')
        ->middleware(['permission:pembayaran.import']);
    Route::get('/transaction/import/template', [TransactionImportController::class, 'template'])
        ->name('transaction.import.template')
        ->middleware(['permission:pembayaran.import']);
    Route::get('/transaction/export', [TransactionImportController::class, 'export'])
        ->name('transaction.export')
        ->middleware(['permission:pembayaran.export']);

    // History
    Route::get('/payment-history', [HistoryController::class, 'index'])
        ->name('history')
        ->middleware(['permission:pembayaran.masuk.view|pembayaran.keluar.view']);

    // Category management
    Route::resource('category', CategoryController::class)
        ->only(['index', 'store', 'update', 'destroy'])
        ->middleware(['permission:kategori.view|kategori.create|kategori.edit|kategori.delete']);

    // Role management
    Route::middleware(['permission:users.roles'])->group(function () {
        Route::resource('role', RoleController::class);
    });

    // User management
    Route::middleware(['permission:users.view'])->group(function () {
        Route::resource('users', UserController::class);
    });

});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
