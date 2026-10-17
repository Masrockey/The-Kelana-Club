<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Comment;
use App\Models\PageVisit;
use App\Models\Post;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display the Admin Analytics & Management Dashboard.
     */
    public function index(): Response
    {
        $now = now();
        $thirtyDaysAgo = $now->copy()->subDays(30);

        // Core KPIs
        $totalViews = PageVisit::where('is_bot', false)->count();
        $uniqueVisitors = PageVisit::where('is_bot', false)->where('is_unique', true)->count();
        $totalPosts = Post::count();
        $publishedPosts = Post::published()->count();
        $pendingComments = Comment::where('status', 'pending')->count();
        $botCrawls = PageVisit::where('is_bot', true)->count();

        // Top GEO country
        $topCountry = PageVisit::where('is_bot', false)
            ->whereNotNull('country_name')
            ->select('country_name', 'country_code', DB::raw('count(*) as count'))
            ->groupBy('country_name', 'country_code')
            ->orderByDesc('count')
            ->first();

        $dateExpr = DB::connection()->getDriverName() === 'sqlite' ? "strftime('%Y-%m-%d', created_at)" : 'DATE(created_at)';

        // 30-day chart: views & uniques per day
        $dailyVisits = PageVisit::where('is_bot', false)
            ->where('created_at', '>=', $thirtyDaysAgo)
            ->select(
                DB::raw("{$dateExpr} as visit_date"),
                DB::raw('count(*) as total_views'),
                DB::raw('count(DISTINCT ip_address) as unique_ips')
            )
            ->groupBy('visit_date')
            ->orderBy('visit_date', 'asc')
            ->get();

        // Normalize last 30 days so every date is present
        $timeline = [];
        for ($i = 29; $i >= 0; $i--) {
            $day = $now->copy()->subDays($i)->format('Y-m-d');
            $label = $now->copy()->subDays($i)->format('M d');
            $found = $dailyVisits->firstWhere('visit_date', $day);

            $timeline[] = [
                'date' => $day,
                'label' => $label,
                'views' => $found ? (int) $found->total_views : 0,
                'uniques' => $found ? (int) $found->unique_ips : 0,
            ];
        }

        // Top 5 performing posts
        $topPosts = Post::with('category')
            ->orderByDesc('views_count')
            ->limit(5)
            ->get(['id', 'title', 'slug', 'category_id', 'views_count', 'seo_score', 'geo_target_country', 'published_at']);

        // Recent bot crawls
        $recentBots = PageVisit::where('is_bot', true)
            ->orderByDesc('created_at')
            ->limit(6)
            ->get(['id', 'bot_name', 'url', 'ip_address', 'country_name', 'created_at']);

        // Recent reader comments
        $recentComments = Comment::with('post:id,title,slug')
            ->orderByDesc('created_at')
            ->limit(5)
            ->get();

        // Top 5 Countries
        $topCountries = PageVisit::where('is_bot', false)
            ->whereNotNull('country_name')
            ->select('country_name', 'country_code', DB::raw('count(*) as views'))
            ->groupBy('country_name', 'country_code')
            ->orderByDesc('views')
            ->limit(5)
            ->get();

        return Inertia::render('admin/dashboard', [
            'metrics' => [
                'totalViews' => $totalViews,
                'uniqueVisitors' => $uniqueVisitors,
                'publishedPosts' => $publishedPosts,
                'totalPosts' => $totalPosts,
                'botCrawls' => $botCrawls,
                'pendingComments' => $pendingComments,
                'topCountry' => $topCountry ? "{$topCountry->country_name} ({$topCountry->country_code})" : 'Worldwide',
            ],
            'chartData' => $timeline,
            'topPosts' => $topPosts,
            'recentBots' => $recentBots,
            'recentComments' => $recentComments,
            'topCountries' => $topCountries,
        ]);
    }
}
