<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Role;
use App\Models\SppMonth;
use App\Models\Student;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call(RolePermissionSeeder::class);

        $adminRole = Role::where('name', 'admin')->first();
        $admin = User::factory()->create([
            'name' => 'Admin Dayah',
            'email' => 'admin@dayah.test',
            'password' => Hash::make('00000000'),
        ]);
        $admin->roles()->attach($adminRole);

        $incomeCategories = ['SPP', 'Infaq', 'Sumbangan', 'Uang Pangkal', 'Uang Kegiatan', 'Uang Makan', 'Donasi', 'Lainnya'];
        $expenseCategories = ['Gaji', 'Operasional', 'Listrik', 'Pemeliharaan', 'Inventaris', 'Lainnya'];

        foreach ($incomeCategories as $name) {
            Category::firstOrCreate(['name' => $name], ['type' => 'in', 'is_active' => true]);
        }

        foreach ($expenseCategories as $name) {
            Category::firstOrCreate(['name' => $name], ['type' => 'out', 'is_active' => true]);
        }

        $bulanAjaran = [7, 8, 9, 10, 11, 12, 1, 2, 3, 4, 5, 6];
        $kumpulanBulanId = [];

        foreach ($bulanAjaran as $m) {
            $year = ($m >= 7) ? 2025 : 2026;
            $sppMonth = SppMonth::create(
                ['month' => $m, 'year' => $year, 'amount' => 500000],
            );
            $kumpulanBulanId[] = $sppMonth->id;
        }

        Student::factory(20)->create()->each(function ($student) {});
    }
}
