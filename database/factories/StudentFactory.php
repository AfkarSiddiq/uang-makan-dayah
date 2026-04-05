<?php

namespace Database\Factories;

use App\Models\Student;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Student>
 */
class StudentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'nisn' => $this->faker->unique()->numerify('00#########'),
            'name' => $this->faker->name(),
            'class' => $this->faker->randomElement(['1', '2', '3', '4', '5', '6']),
            'gender' => $this->faker->randomElement(['L', 'P']),
            'status' => 'aktif',
            'entry_month' => 7,
            'entry_year' => 2025,
        ];
    }
}
