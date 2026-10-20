<?php

use App\Models\GoogleTrend;
use App\Models\User;
use App\Services\GoogleTrendService;
use Illuminate\Support\Facades\Http;

test('guests are redirected from google trends dashboard', function () {
    $response = $this->get('/admin/trends');
    $response->assertRedirect('/login');
});

test('authenticated user can view google trends dashboard', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    // Seed mock cached data
    GoogleTrend::create([
        'geo' => 'ID',
        'query' => 'Wisata Labuan Bajo',
        'approx_traffic' => '50K+',
        'description' => 'Tren destinasi wisata baru di NTT',
        'news_title' => 'Labuan Bajo Jadi Primadona',
        'news_url' => 'https://example.com/news',
        'news_source' => 'Kelana Daily',
        'fetched_at' => now(),
    ]);

    $response = $this->get('/admin/trends?geo=ID');
    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('admin/trends/index')
        ->has('dailyTrends', 1)
        ->has('exploreData')
        ->where('currentGeo', 'ID')
        ->has('cacheInfo')
    );
});

test('trends service serves from database cache when available within 3 hours', function () {
    GoogleTrend::create([
        'geo' => 'ID',
        'query' => 'Cached Trend Topic',
        'approx_traffic' => '100K+',
        'fetched_at' => now()->subHours(1),
    ]);

    Http::fake();

    $service = new GoogleTrendService;
    $results = $service->getTrends('ID');

    expect($results)->toHaveCount(1);
    expect($results->first()->query)->toBe('Cached Trend Topic');

    // External HTTP request should NOT have been made because cache is valid
    Http::assertNothingSent();
});

test('trends older than 3 hours are automatically deleted by service', function () {
    // Old trend (4 hours ago)
    GoogleTrend::create([
        'geo' => 'ID',
        'query' => 'Expired Trend Topic',
        'fetched_at' => now()->subHours(4),
    ]);

    // Recent trend (1 hour ago)
    GoogleTrend::create([
        'geo' => 'ID',
        'query' => 'Valid Trend Topic',
        'fetched_at' => now()->subHours(1),
    ]);

    $service = new GoogleTrendService;
    $service->purgeOldTrends();

    expect(GoogleTrend::where('query', 'Expired Trend Topic')->exists())->toBeFalse();
    expect(GoogleTrend::where('query', 'Valid Trend Topic')->exists())->toBeTrue();
});

test('artisan trends:cleanup command removes trends older than 3 hours', function () {
    GoogleTrend::create([
        'geo' => 'ID',
        'query' => 'Stale Trend 1',
        'fetched_at' => now()->subHours(5),
    ]);

    GoogleTrend::create([
        'geo' => 'US',
        'query' => 'Stale Trend 2',
        'fetched_at' => now()->subHours(3)->subMinutes(10),
    ]);

    GoogleTrend::create([
        'geo' => 'ID',
        'query' => 'Fresh Trend',
        'fetched_at' => now()->subHour(),
    ]);

    $this->artisan('trends:cleanup')
        ->expectsOutputToContain('Successfully deleted 2 expired Google Trends record(s).')
        ->assertSuccessful();

    expect(GoogleTrend::count())->toBe(1);
    expect(GoogleTrend::first()->query)->toBe('Fresh Trend');
});

test('admin can force refresh trends via refresh endpoint', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $fakeRss = <<<'XML'
<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:ht="https://trends.google.com/trending/rss">
  <channel>
    <title>Daily Search Trends</title>
    <item>
      <title>Gunung Rinjani</title>
      <description>Jalur pendakian baru dibuka</description>
      <pubDate>Tue, 20 Oct 2026 01:00:00 +0000</pubDate>
      <ht:approx_traffic>20K+</ht:approx_traffic>
      <ht:news_item>
        <ht:news_item_title>Pendakian Rinjani Kembali Ramai</ht:news_item_title>
        <ht:news_item_snippet>TNGR membuka jalur resmi...</ht:news_item_snippet>
        <ht:news_item_url>https://example.com/rinjani</ht:news_item_url>
        <ht:news_item_source>Detik Travel</ht:news_item_source>
      </ht:news_item>
    </item>
  </channel>
</rss>
XML;

    Http::fake([
        'https://trends.google.com/trending/rss*' => Http::response($fakeRss, 200),
    ]);

    $response = $this->post('/admin/trends/refresh', ['geo' => 'ID']);
    $response->assertSessionHas('success');

    $stored = GoogleTrend::where('geo', 'ID')->first();
    expect($stored)->not->toBeNull();
    expect($stored->query)->toBe('Gunung Rinjani');
    expect($stored->approx_traffic)->toBe('20K+');
    expect($stored->news_source)->toBe('Detik Travel');
});

test('post create editor pre-fills title and focus keyword from query params', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $response = $this->get('/admin/posts/create?title=Wisata+Hidden+Gem+Sumba&focus_keyword=Wisata+Hidden+Gem+Sumba');
    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('admin/posts/form')
        ->where('post.title', 'Wisata Hidden Gem Sumba')
        ->where('post.slug', 'wisata-hidden-gem-sumba')
        ->where('post.focus_keyword', 'Wisata Hidden Gem Sumba')
    );
});

test('admin can search custom keyword trends and receive related queries', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $suggestJson = json_encode(['travel', ['travel lombok', 'travel mataram', 'travel bali']]);
    $newsRss = <<<'XML'
<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>travel - Google Berita</title>
    <item>
      <title>Tren Travel 2026</title>
      <link>https://example.com/travel-2026</link>
      <pubDate>Tue, 20 Oct 2026 01:00:00 +0000</pubDate>
      <description>Destinasi wisata favorit tahun ini</description>
      <source>Kompas Travel</source>
    </item>
  </channel>
</rss>
XML;

    Http::fake([
        'https://trends.google.com/*' => Http::response('<rss><channel></channel></rss>', 200),
        'https://suggestqueries.google.com/*' => Http::response($suggestJson, 200),
        'https://news.google.com/rss/search*' => Http::response($newsRss, 200),
    ]);

    $response = $this->get('/admin/trends?geo=ID&q=travel');
    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('admin/trends/index')
        ->where('keyword', 'travel')
        ->has('exploreData.topQueries')
        ->has('exploreData.timeline')
    );

    // Stored in database cache with 3 hours TTL
    expect(GoogleTrend::where('geo', 'ID')->where('query', 'EXPLORE:travel:24h')->exists())->toBeTrue();
});

test('admin can manually purge all cached trends data from database', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    GoogleTrend::create([
        'geo' => 'ID',
        'query' => 'Wisata Bali',
        'fetched_at' => now(),
    ]);

    GoogleTrend::create([
        'geo' => 'GLOBAL',
        'query' => 'EXPLORE:hotel:24h',
        'fetched_at' => now(),
    ]);

    expect(GoogleTrend::count())->toBe(2);

    $response = $this->post('/admin/trends/purge');
    $response->assertSessionHas('success');

    expect(GoogleTrend::count())->toBe(0);
});
