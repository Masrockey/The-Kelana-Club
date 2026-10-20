<?php

namespace Database\Seeders;

use App\Models\User;
use App\Services\SeoService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class BlogSeeder extends Seeder
{
    /**
     * Run the database seeds for Real Routes by Real Travelers.
     */
    public function run(): void
    {
        $seoService = new SeoService;

        // 1. Create or retrieve admin user
        $admin = User::firstOrCreate(
            ['email' => 'admin@kelanaclub.com'],
            [
                'name' => 'Kelana Expedition Staff',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );
    }
}
