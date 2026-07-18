<?php

namespace Database\Factories;

use App\Models\Transaction;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class TransactionFactory extends Factory
{
    protected $model = Transaction::class;

    public function definition(): array
    {
        $year = date('Y');
        $sequence = $this->faker->unique()->numberBetween(1, 9999);

        return [
            'transaction_id' => sprintf('TRX-%s-%04d', $year, $sequence),
            'type' => $this->faker->randomElement(['in', 'out']),
            'category' => $this->faker->randomElement(['SPP', 'Uang Pangkal', 'Listrik', 'Gaji']),
            'amount' => $this->faker->numberBetween(10000, 500000),
            'student_id' => null,
            'note' => $this->faker->sentence(),
            'transaction_date' => $this->faker->date('Y-m-d'),
            'user_id' => User::factory(),
        ];
    }

    public function in(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'in',
        ]);
    }

    public function out(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'out',
        ]);
    }

    public function spp(): static
    {
        return $this->state(fn (array $attributes) => [
            'category' => 'SPP',
            'type' => 'in',
        ]);
    }
}
