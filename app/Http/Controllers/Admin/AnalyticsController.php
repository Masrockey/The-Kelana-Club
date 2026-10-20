<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PageVisit;
use App\Models\Post;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class AnalyticsController extends Controller
{
    /**
     * Visitor & Traffic Analytics.
     */
    public function visitors(): Response
    {
        $now = now();
        $thirtyDaysAgo = $now->copy()->subDays(30);

        // Core traffic stats
        $totalViews = PageVisit::where('is_bot', false)->count();
        $uniqueVisitors = PageVisit::where('is_bot', false)->where('is_unique', true)->count();
        $todayViews = PageVisit::where('is_bot', false)->whereDate('created_at', today())->count();
        $todayUniques = PageVisit::where('is_bot', false)->where('is_unique', true)->whereDate('created_at', today())->count();

        $isSqlite = DB::connection()->getDriverName() === 'sqlite';
        $dateExpr = $isSqlite ? "strftime('%Y-%m-%d', created_at)" : 'DATE(created_at)';
        $hourExpr = $isSqlite ? "CAST(strftime('%H', created_at) AS INTEGER)" : 'HOUR(created_at)';

        // 30-day timeline
        $timeline = PageVisit::where('is_bot', false)
            ->where('created_at', '>=', $thirtyDaysAgo)
            ->select(
                DB::raw("{$dateExpr} as date"),
                DB::raw('count(*) as views'),
                DB::raw('count(DISTINCT ip_address) as uniques')
            )
            ->groupBy('date')
            ->orderBy('date', 'asc')
            ->get();

        // Hourly peak reading times (0 to 23)
        $hourlyVisits = PageVisit::where('is_bot', false)
            ->select(DB::raw("{$hourExpr} as hour"), DB::raw('count(*) as count'))
            ->groupBy('hour')
            ->orderBy('hour')
            ->get();

        $hourlyData = [];
        for ($h = 0; $h < 24; $h++) {
            $found = $hourlyVisits->firstWhere('hour', $h);
            $hourlyData[] = [
                'hour' => sprintf('%02d:00', $h),
                'visits' => $found ? (int) $found->count : 0,
            ];
        }

        // Device breakdown
        $devices = PageVisit::where('is_bot', false)
            ->select('device_type', DB::raw('count(*) as count'))
            ->groupBy('device_type')
            ->orderByDesc('count')
            ->get();

        // Browser breakdown
        $browsers = PageVisit::where('is_bot', false)
            ->whereNotNull('browser')
            ->select('browser', DB::raw('count(*) as count'))
            ->groupBy('browser')
            ->orderByDesc('count')
            ->limit(6)
            ->get();

        // OS breakdown
        $operatingSystems = PageVisit::where('is_bot', false)
            ->whereNotNull('os')
            ->select('os', DB::raw('count(*) as count'))
            ->groupBy('os')
            ->orderByDesc('count')
            ->limit(6)
            ->get();

        // Top Referrers
        $referrers = PageVisit::where('is_bot', false)
            ->whereNotNull('referrer_domain')
            ->where('referrer_domain', '!=', '')
            ->select('referrer_domain', DB::raw('count(*) as count'))
            ->groupBy('referrer_domain')
            ->orderByDesc('count')
            ->limit(10)
            ->get();

        // Top Viewed Pages
        $topPages = PageVisit::where('is_bot', false)
            ->select('url', DB::raw('count(*) as views'), DB::raw('count(DISTINCT ip_address) as uniques'))
            ->groupBy('url')
            ->orderByDesc('views')
            ->limit(10)
            ->get();

        return Inertia::render('admin/analytics/visitors', [
            'metrics' => [
                'totalViews' => $totalViews,
                'uniqueVisitors' => $uniqueVisitors,
                'todayViews' => $todayViews,
                'todayUniques' => $todayUniques,
            ],
            'timeline' => $timeline,
            'hourly' => $hourlyData,
            'devices' => $devices,
            'browsers' => $browsers,
            'operatingSystems' => $operatingSystems,
            'referrers' => $referrers,
            'topPages' => $topPages,
        ]);
    }

    /**
     * GEO & Geographic Analytics.
     */
    public function geo(): Response
    {
        $totalGeoVisits = PageVisit::where('is_bot', false)->whereNotNull('country_name')->count();

        // Country rankings with percentages
        $countries = PageVisit::where('is_bot', false)
            ->whereNotNull('country_name')
            ->select(
                'country_code',
                'country_name',
                DB::raw('count(*) as views'),
                DB::raw('count(DISTINCT ip_address) as uniques')
            )
            ->groupBy('country_code', 'country_name')
            ->orderByDesc('views')
            ->get()
            ->map(function ($item) use ($totalGeoVisits) {
                $item->share = $totalGeoVisits > 0 ? round(($item->views / $totalGeoVisits) * 100, 1) : 0;

                return $item;
            });

        // Top Cities
        $topCities = PageVisit::where('is_bot', false)
            ->whereNotNull('city')
            ->select('city', 'country_name', 'country_code', DB::raw('count(*) as views'))
            ->groupBy('city', 'country_name', 'country_code')
            ->orderByDesc('views')
            ->limit(15)
            ->get();

        // Target Country breakdown of published posts
        $targetDistribution = Post::select('geo_target_country', DB::raw('count(*) as count'))
            ->groupBy('geo_target_country')
            ->orderByDesc('count')
            ->get();

        return Inertia::render('admin/analytics/geo', [
            'totalGeoVisits' => $totalGeoVisits,
            'countries' => $countries,
            'topCities' => $topCities,
            'targetDistribution' => $targetDistribution,
        ]);
    }

    /**
     * SEO & GEO (Generative Engine Optimization) Analytics & Bot Crawler Activity.
     */
    public function seo(): Response
    {
        $totalBotCrawls = PageVisit::where('is_bot', true)->count();
        $totalPosts = Post::count();

        // Recognized Generative AI Crawler bot names
        $aiBotNames = ['GPTBot', 'ChatGPT-User', 'OAI-SearchBot', 'PerplexityBot', 'ClaudeBot', 'Google-Extended', 'Bytespider', 'Cohere-ai', 'CCBot'];
        $totalAiCrawls = PageVisit::where('is_bot', true)->whereIn('bot_name', $aiBotNames)->count();

        // Bot crawls breakdown by engine
        $botBreakdown = PageVisit::where('is_bot', true)
            ->whereNotNull('bot_name')
            ->select('bot_name', DB::raw('count(*) as count'))
            ->groupBy('bot_name')
            ->orderByDesc('count')
            ->get()
            ->map(function ($bot) use ($aiBotNames) {
                $bot->is_ai = in_array($bot->bot_name, $aiBotNames);

                return $bot;
            });

        // 30-day bot crawl timeline
        $thirtyDaysAgo = now()->subDays(30);
        $dateExpr = DB::connection()->getDriverName() === 'sqlite' ? "strftime('%Y-%m-%d', created_at)" : 'DATE(created_at)';
        $botTimeline = PageVisit::where('is_bot', true)
            ->where('created_at', '>=', $thirtyDaysAgo)
            ->select(
                DB::raw("{$dateExpr} as date"),
                DB::raw('count(*) as crawls')
            )
            ->groupBy('date')
            ->orderBy('date', 'asc')
            ->get();

        // Recent bot crawls log
        $recentBotLogs = PageVisit::where('is_bot', true)
            ->orderByDesc('created_at')
            ->limit(25)
            ->get(['id', 'bot_name', 'url', 'ip_address', 'country_name', 'created_at'])
            ->map(function ($log) use ($aiBotNames) {
                $log->is_ai = in_array($log->bot_name, $aiBotNames);

                return $log;
            });

        // Organic Search Referrers
        $searchReferrers = PageVisit::where('is_bot', false)
            ->where(function ($q) {
                $q->where('referrer_domain', 'like', '%google%')
                    ->orWhere('referrer_domain', 'like', '%bing%')
                    ->orWhere('referrer_domain', 'like', '%duckduckgo%')
                    ->orWhere('referrer_domain', 'like', '%yahoo%')
                    ->orWhere('referrer_domain', 'like', '%ecosia%')
                    ->orWhere('referrer_domain', 'like', '%perplexity%')
                    ->orWhere('referrer_domain', 'like', '%openai%')
                    ->orWhere('referrer_domain', 'like', '%chatgpt%')
                    ->orWhere('referrer_domain', 'like', '%yandex%');
            })
            ->select('referrer_domain', DB::raw('count(*) as count'))
            ->groupBy('referrer_domain')
            ->orderByDesc('count')
            ->get();

        // SEO Health Distribution across posts
        $goodSeoCount = Post::where('seo_score', '>=', 80)->count();
        $okSeoCount = Post::whereBetween('seo_score', [55, 79])->count();
        $poorSeoCount = Post::where('seo_score', '<', 55)->count();

        // Posts needing SEO attention (lowest score)
        $postsNeedingSeo = Post::with('category')
            ->orderBy('seo_score', 'asc')
            ->limit(6)
            ->get(['id', 'title', 'slug', 'category_id', 'seo_score', 'focus_keyword', 'views_count']);

        return Inertia::render('admin/analytics/seo', [
            'metrics' => [
                'totalBotCrawls' => $totalBotCrawls,
                'totalAiCrawls' => $totalAiCrawls,
                'totalPosts' => $totalPosts,
                'goodSeo' => $goodSeoCount,
                'okSeo' => $okSeoCount,
                'poorSeo' => $poorSeoCount,
            ],
            'botBreakdown' => $botBreakdown,
            'botTimeline' => $botTimeline,
            'recentBotLogs' => $recentBotLogs,
            'searchReferrers' => $searchReferrers,
            'postsNeedingSeo' => $postsNeedingSeo,
        ]);
    }
}
