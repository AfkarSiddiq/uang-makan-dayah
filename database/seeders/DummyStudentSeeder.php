<?php

namespace Database\Seeders;

use App\Models\Student;
use Illuminate\Database\Seeder;

class DummyStudentSeeder extends Seeder
{
    public function run(): void
    {
        Student::factory(20)->create();
    }
}
