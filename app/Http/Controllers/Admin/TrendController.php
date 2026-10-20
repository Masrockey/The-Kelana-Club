<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\GoogleTrend;
use App\Services\GoogleTrendService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TrendController extends Controller
{
    /**
     * Display Google Trends dashboard.
     */
    public function index(Request $request, GoogleTrendService $trendService): Response
    {
        $mode = $request->query('mode', 'explore');
        $geo = strtoupper($request->query('geo', 'GLOBAL'));
        if (! array_key_exists($geo, GoogleTrendService::SUPPORTED_GEOS)) {
            $geo = 'GLOBAL';
        }

        $keyword = trim((string) $request->query('q', 'hotel'));
        if (empty($keyword)) {
            $keyword = 'hotel';
        }

        $timeRange = $request->query('time', '24h');

        // Explore dataset (exact Google Trends interest over time, interest by region, top & rising queries)
        $exploreData = $trendService->getExploreData($keyword, $geo, $timeRange);

        // Daily Trending feed
        $dailyTrends = $trendService->getTrends($geo);

        $fetchedAt = $dailyTrends->first()?->fetched_at;
        $expiresAt = $fetchedAt ? $fetchedAt->copy()->addHours(GoogleTrendService::CACHE_HOURS) : null;
        $remainingMinutes = $expiresAt ? max(0, (int) now()->diffInMinutes($expiresAt, false)) : 0;

        return Inertia::render('admin/trends/index', [
            'mode' => $mode,
            'keyword' => $keyword,
            'currentGeo' => $geo,
            'timeRange' => $timeRange,
            'exploreData' => $exploreData,
            'dailyTrends' => $dailyTrends,
            'supportedGeos' => GoogleTrendService::SUPPORTED_GEOS,
            'cacheInfo' => [
                'fetchedAt' => $fetchedAt?->toIso8601String(),
                'expiresAt' => $expiresAt?->toIso8601String(),
                'remainingMinutes' => $remainingMinutes,
                'cacheTtlHours' => GoogleTrendService::CACHE_HOURS,
                'count' => $dailyTrends->count(),
            ],
        ]);
    }

    /**
     * Force refresh trends data from Google Trends RSS.
     */
    public function refresh(Request $request, GoogleTrendService $trendService): RedirectResponse
    {
        $geo = strtoupper($request->input('geo', 'ID'));
        if (! array_key_exists($geo, GoogleTrendService::SUPPORTED_GEOS)) {
            $geo = 'ID';
        }

        $trends = $trendService->getTrends($geo, forceRefresh: true);
        $geoName = GoogleTrendService::SUPPORTED_GEOS[$geo] ?? $geo;

        return back()->with('success', "Data Google Trends untuk {$geoName} berhasil diperbarui ({$trends->count()} topik).");
    }

    /**
     * Manually purge all cached Google Trends data from the database.
     */
    public function purge(Request $request): RedirectResponse
    {
        $count = GoogleTrend::count();
        GoogleTrend::query()->delete();

        return back()->with('success', "Cache database Google Trends berhasil di-purge ({$count} data dibersihkan).");
    }
}
