<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Role;
use App\Models\SppMonth;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call(RolePermissionSeeder::class);

        $adminRole = Role::where('name', 'admin')->first();
        $admin = User::firstOrCreate(
            ['email' => 'admin@dayah.test'],
            [
                'name' => 'Admin Dayah',
                'password' => Hash::make('00000000'),
            ]
        );

        if ($adminRole && !$admin->roles()->where('role_id', $adminRole->id)->exists()) {
            $admin->roles()->attach($adminRole);
        }

        $incomeCategories = ['SPP', 'Infaq', 'Sumbangan', 'Uang Pangkal', 'Uang Kegiatan', 'Uang Makan', 'Donasi', 'Lainnya'];
        $expenseCategories = ['Gaji', 'Operasional', 'Listrik', 'Pemeliharaan', 'Inventaris', 'Lainnya'];

        foreach ($incomeCategories as $name) {
            Category::firstOrCreate(['name' => $name], ['type' => 'in', 'is_active' => true]);
        }

        foreach ($expenseCategories as $name) {
            Category::firstOrCreate(['name' => $name], ['type' => 'out', 'is_active' => true]);
        }

        $bulanAjaran = [7, 8, 9, 10, 11, 12, 1, 2, 3, 4, 5, 6];

        foreach ($bulanAjaran as $m) {
            $year = ($m >= 7) ? 2025 : 2026;
            SppMonth::firstOrCreate(
                ['month' => $m, 'year' => $year],
                ['amount' => 500000]
            );
        }
    }
}

