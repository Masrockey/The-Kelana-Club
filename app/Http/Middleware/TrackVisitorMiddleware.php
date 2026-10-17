<?php

namespace App\Http\Middleware;

use App\Models\PageVisit;
use App\Models\Post;
use App\Services\GeoService;
use App\Services\SeoService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class TrackVisitorMiddleware
{
    public function __construct(
        protected GeoService $geoService,
        protected SeoService $seoService
    ) {}

    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Only track successful GET requests on public pages
        if (! $request->isMethod('GET') || $response->getStatusCode() >= 400) {
            return $response;
        }

        $path = $request->path();

        // Skip internal/admin/assets paths
        if (
            str_starts_with($path, 'admin') ||
            str_starts_with($path, 'dashboard') ||
            str_starts_with($path, 'settings') ||
            str_starts_with($path, 'build') ||
            str_starts_with($path, '_') ||
            str_starts_with($path, 'api') ||
            $request->header('X-Inertia') && str_contains($path, 'dashboard')
        ) {
            return $response;
        }

        try {
            $userAgent = $request->userAgent();
            $ip = $request->ip();
            $sessionId = $request->session()->getId();
            $referrer = $request->header('referer');
            $referrerHost = $referrer ? parse_url($referrer, PHP_URL_HOST) : null;

            $botName = $this->seoService->detectBot($userAgent);
            $isBot = ! empty($botName);

            $geo = $this->geoService->resolve($request);
            $client = $this->geoService->parseUserAgent($userAgent);

            // Determine if visiting a specific post
            $postId = null;
            if ($request->routeIs('posts.show')) {
                $slug = $request->route('slug');
                $post = Post::where('slug', $slug)->first();
                if ($post) {
                    $postId = $post->id;
                    $post->increment('views_count');
                }
            }

            // Check uniqueness in session for this URL
            $cacheKey = "visited_{$sessionId}_{$path}";
            $isUnique = ! session()->has($cacheKey);
            session()->put($cacheKey, true);

            PageVisit::create([
                'post_id' => $postId,
                'url' => $request->fullUrl(),
                'ip_address' => $ip,
                'session_id' => $sessionId,
                'user_agent' => substr((string) $userAgent, 0, 500),
                'country_code' => $geo['country_code'],
                'country_name' => $geo['country_name'],
                'city' => $geo['city'],
                'region' => $geo['region'],
                'latitude' => $geo['latitude'],
                'longitude' => $geo['longitude'],
                'device_type' => $client['device_type'],
                'browser' => $client['browser'],
                'os' => $client['os'],
                'referrer' => $referrer ? substr($referrer, 0, 500) : null,
                'referrer_domain' => $referrerHost,
                'is_bot' => $isBot,
                'bot_name' => $botName,
                'is_unique' => $isUnique,
            ]);
        } catch (\Throwable $e) {
            // Silently continue if analytics logging has minor issue
            report($e);
        }

        return $response;
    }
}
