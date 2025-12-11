<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => $this->faker->name(),
            'email' => $this->faker->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => Hash::make('password'),
            'phone_number' => $this->faker->phoneNumber(),
            'role' => $this->faker->randomElement(['passenger', 'rider']),
            'latitude' => $this->faker->latitude(),
            'longitude' => $this->faker->longitude(),
            'is_online' => $this->faker->boolean(30),
            'rating' => $this->faker->randomFloat(2, 1, 5),
            'total_rides' => $this->faker->numberBetween(0, 200),
            'remember_token' => Str::random(10),
        ];
    }

    public function passenger(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => 'passenger',
            'is_online' => false,
        ]);
    }

    public function rider(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => 'rider',
            'is_online' => $this->faker->boolean(60),
        ]);
    }
}
