<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'password' => Hash::make('password123'),
            'phone_number' => '1234567890',
            'role' => 'passenger',
            'latitude' => 40.7128,
            'longitude' => -74.0060,
            'rating' => 4.8,
            'email_verified_at' => now(),
        ]);

        User::create([
            'name' => 'Jane Smith',
            'email' => 'jane@example.com',
            'password' => Hash::make('password123'),
            'phone_number' => '0987654321',
            'role' => 'rider',
            'latitude' => 40.7130,
            'longitude' => -74.0059,
            'is_online' => true,
            'rating' => 4.9,
            'total_rides' => 125,
            'email_verified_at' => now(),
        ]);

        User::create([
            'name' => 'Mike Johnson',
            'email' => 'mike@example.com',
            'password' => Hash::make('password123'),
            'phone_number' => '5555555555',
            'role' => 'rider',
            'latitude' => 40.7150,
            'longitude' => -74.0080,
            'is_online' => true,
            'rating' => 4.7,
            'total_rides' => 89,
            'email_verified_at' => now(),
        ]);

        User::create([
            'name' => 'Sarah Wilson',
            'email' => 'sarah@example.com',
            'password' => Hash::make('password123'),
            'phone_number' => '4444444444',
            'role' => 'passenger',
            'latitude' => 40.7200,
            'longitude' => -74.0100,
            'rating' => 4.6,
            'email_verified_at' => now(),
        ]);
    }
}
