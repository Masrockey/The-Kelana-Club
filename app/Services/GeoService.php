<?php

namespace App\Services;

use Illuminate\Http\Request;

class GeoService
{
    /**
     * Presets of popular countries for GEO Optimizer selector.
     *
     * @var array<int, array{code: string, name: string, region: string, city: string, lat: float, lng: float, hreflang: string}>
     */
    public static array $geoPresets = [
        [
            'code' => 'ALL',
            'name' => 'Global (Worldwide)',
            'region' => 'Global',
            'city' => 'Worldwide',
            'lat' => 0.0,
            'lng' => 0.0,
            'hreflang' => 'x-default',
        ],
        [
            'code' => 'ID',
            'name' => 'Indonesia',
            'region' => 'ID-JK',
            'city' => 'Jakarta',
            'lat' => -6.2088,
            'lng' => 106.8456,
            'hreflang' => 'id-ID',
        ],
        [
            'code' => 'US',
            'name' => 'United States',
            'region' => 'US-NY',
            'city' => 'New York',
            'lat' => 40.7128,
            'lng' => -74.0060,
            'hreflang' => 'en-US',
        ],
        [
            'code' => 'GB',
            'name' => 'United Kingdom',
            'region' => 'GB-ENG',
            'city' => 'London',
            'lat' => 51.5074,
            'lng' => -0.1278,
            'hreflang' => 'en-GB',
        ],
        [
            'code' => 'JP',
            'name' => 'Japan',
            'region' => 'JP-13',
            'city' => 'Tokyo',
            'lat' => 35.6762,
            'lng' => 139.6503,
            'hreflang' => 'ja-JP',
        ],
        [
            'code' => 'SG',
            'name' => 'Singapore',
            'region' => 'SG-01',
            'city' => 'Singapore',
            'lat' => 1.3521,
            'lng' => 103.8198,
            'hreflang' => 'en-SG',
        ],
        [
            'code' => 'AU',
            'name' => 'Australia',
            'region' => 'AU-NSW',
            'city' => 'Sydney',
            'lat' => -33.8688,
            'lng' => 151.2093,
            'hreflang' => 'en-AU',
        ],
        [
            'code' => 'DE',
            'name' => 'Germany',
            'region' => 'DE-BE',
            'city' => 'Berlin',
            'lat' => 52.5200,
            'lng' => 13.4050,
            'hreflang' => 'de-DE',
        ],
        [
            'code' => 'NL',
            'name' => 'Netherlands',
            'region' => 'NL-NH',
            'city' => 'Amsterdam',
            'lat' => 52.3676,
            'lng' => 4.9041,
            'hreflang' => 'nl-NL',
        ],
    ];

    /**
     * Resolve geolocation for a request.
     *
     * @return array{
     *     country_code: string,
     *     country_name: string,
     *     city: string,
     *     region: string,
     *     latitude: float,
     *     longitude: float
     * }
     */
    public function resolve(Request $request): array
    {
        $ip = $request->ip();

        // 1. Cloudflare header check
        if ($cfCountry = $request->header('CF-IPCountry')) {
            $matched = collect(self::$geoPresets)->firstWhere('code', strtoupper($cfCountry));
            if ($matched) {
                return [
                    'country_code' => $matched['code'],
                    'country_name' => $matched['name'],
                    'city' => $matched['city'],
                    'region' => $matched['region'],
                    'latitude' => $matched['lat'],
                    'longitude' => $matched['lng'],
                ];
            }
        }

        // 2. Check standard headers or test ip
        if ($ip === '127.0.0.1' || $ip === '::1' || str_starts_with((string) $ip, '192.168.') || str_starts_with((string) $ip, '10.')) {
            // Local dev fallback: default to Indonesia (Jakarta)
            return [
                'country_code' => 'ID',
                'country_name' => 'Indonesia',
                'city' => 'Jakarta',
                'region' => 'DKI Jakarta',
                'latitude' => -6.2088,
                'longitude' => 106.8456,
            ];
        }

        // Default global fallback
        return [
            'country_code' => 'ID',
            'country_name' => 'Indonesia',
            'city' => 'Jakarta',
            'region' => 'DKI Jakarta',
            'latitude' => -6.2088,
            'longitude' => 106.8456,
        ];
    }

    /**
     * Parse User-Agent to extract device type, browser, OS.
     *
     * @return array{device_type: string, browser: string, os: string}
     */
    public function parseUserAgent(?string $userAgent): array
    {
        if (empty($userAgent)) {
            return [
                'device_type' => 'desktop',
                'browser' => 'Unknown',
                'os' => 'Unknown',
            ];
        }

        $ua = strtolower($userAgent);

        // Device
        $deviceType = 'desktop';
        if (str_contains($ua, 'tablet') || str_contains($ua, 'ipad')) {
            $deviceType = 'tablet';
        } elseif (str_contains($ua, 'mobile') || str_contains($ua, 'iphone') || str_contains($ua, 'android')) {
            $deviceType = 'mobile';
        }

        // Browser
        $browser = 'Unknown';
        if (str_contains($ua, 'edg/')) {
            $browser = 'Edge';
        } elseif (str_contains($ua, 'chrome') && ! str_contains($ua, 'edg')) {
            $browser = 'Chrome';
        } elseif (str_contains($ua, 'safari') && ! str_contains($ua, 'chrome')) {
            $browser = 'Safari';
        } elseif (str_contains($ua, 'firefox')) {
            $browser = 'Firefox';
        } elseif (str_contains($ua, 'opera') || str_contains($ua, 'opr/')) {
            $browser = 'Opera';
        }

        // OS
        $os = 'Unknown';
        if (str_contains($ua, 'windows')) {
            $os = 'Windows';
        } elseif (str_contains($ua, 'mac os') || str_contains($ua, 'macintosh')) {
            $os = 'macOS';
        } elseif (str_contains($ua, 'iphone') || str_contains($ua, 'ipad') || str_contains($ua, 'ios')) {
            $os = 'iOS';
        } elseif (str_contains($ua, 'android')) {
            $os = 'Android';
        } elseif (str_contains($ua, 'linux')) {
            $os = 'Linux';
        }

        return [
            'device_type' => $deviceType,
            'browser' => $browser,
            'os' => $os,
        ];
    }
}
