<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Comment;
use App\Models\MediaFile;
use App\Models\PageVisit;
use App\Models\Post;
use App\Models\Tag;
use App\Models\User;
use App\Services\SeoService;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

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
