<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\SppMonth;
use App\Models\Student;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Buat Akun Admin
        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => Hash::make('00000000'),
            'role' => 'admin',
        ]);

        // 2. Seed default categories
        $incomeCategories = ['SPP', 'Infaq', 'Sumbangan', 'Uang Pangkal', 'Uang Kegiatan', 'Uang Makan', 'Donasi', 'Lainnya'];
        $expenseCategories = ['Gaji', 'Operasional', 'Listrik', 'Pemeliharaan', 'Inventaris', 'Lainnya'];

        foreach ($incomeCategories as $name) {
            Category::firstOrCreate(['name' => $name], ['type' => 'in', 'is_active' => true]);
        }

        foreach ($expenseCategories as $name) {
            Category::firstOrCreate(['name' => $name], ['type' => 'out', 'is_active' => true]);
        }

        // 3. Buat Data Master Bulan (Tahun Ajaran 2025/2026)
        $bulanAjaran = [7, 8, 9, 10, 11, 12, 1, 2, 3, 4, 5, 6];
        $kumpulanBulanId = [];

        foreach ($bulanAjaran as $m) {
            $year = ($m >= 7) ? 2025 : 2026;

            // firstOrCreate memastikan data tidak ganda jika seeder dijalankan 2x
            $sppMonth = SppMonth::create(
                ['month' => $m, 'year' => $year, 'amount' => 500000],
            );

            // Simpan ke array untuk di-looping di tagihan siswa nanti
            $kumpulanBulanId[] = $sppMonth->id;
        }

        // 4. Buat 20 Siswa dan Generate Tagihannya
        // 'use ($kumpulanBulan)' agar variabel array di atas bisa dipakai di dalam function
        Student::factory(20)->create()->each(function ($student) {});
    }
}
