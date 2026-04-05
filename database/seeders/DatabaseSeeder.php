<?php

namespace Database\Seeders;

use App\Models\SppPayment;
use App\Models\Student;
use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => Hash::make('00000000'),
            'role' => 'admin'
        ]);

        Student::factory(20)->create()->each(function ($student) {
            
            // 3. Untuk setiap siswa, buatkan tagihan SPP dari Juli 2025 sampai Juni 2026
            $months = [7, 8, 9, 10, 11, 12, 1, 2, 3, 4, 5, 6];
            foreach ($months as $m) {
                SppPayment::create([
                    'student_id' => $student->id,
                    'month' => $m,
                    'year' => ($m >= 7) ? 2025 : 2026,
                    'amount' => 500000, // Misal SPP flat 500rb
                    'paid_amount' => 0,
                    'status' => 'unpaid',
                ]);
            }
        });
    }
}
