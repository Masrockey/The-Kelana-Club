<?php

use App\Models\Category;
use App\Models\Post;
use App\Models\User;
use App\Services\SeoService;

test('public homepage displays without errors', function () {
    $response = $this->get('/');
    $response->assertOk();
});

test('public article view displays post with SEO and GEO data', function () {
    $user = User::factory()->create();
    $category = Category::create([
        'name' => 'Philosophy',
        'slug' => 'philosophy',
    ]);

    $post = Post::create([
        'user_id' => $user->id,
        'category_id' => $category->id,
        'title' => 'The Art of Mindful Solitude',
        'slug' => 'the-art-of-mindful-solitude',
        'excerpt' => 'A reflection on being alone in modern cities.',
        'content' => '## Solitude in the Metropolis\n\nTo be alone is not to be lonely.',
        'status' => 'published',
        'published_at' => now()->subDay(),
        'focus_keyword' => 'Mindful Solitude',
        'meta_title' => 'The Art of Mindful Solitude — Kelana Journal',
        'meta_description' => 'A reflection on finding peace and focus in crowded modern cities.',
        'geo_target_country' => 'ID',
        'geo_placename' => 'Jakarta',
        'geo_latitude' => -6.2088,
        'geo_longitude' => 106.8456,
        'seo_score' => 85,
    ]);

    $response = $this->get("/article/{$post->slug}");
    $response->assertOk();
    $response->assertSee('The Art of Mindful Solitude');
});

test('reader can submit a comment to published article', function () {
    $user = User::factory()->create();
    $post = Post::create([
        'user_id' => $user->id,
        'title' => 'Walking the Canals',
        'slug' => 'walking-the-canals',
        'excerpt' => 'Canals of Amsterdam.',
        'content' => 'Content about canals.',
        'status' => 'published',
        'published_at' => now()->subDay(),
    ]);

    $response = $this->post("/article/{$post->slug}/comment", [
        'author_name' => 'Aditya Pratama',
        'author_email' => 'aditya@example.com',
        'content' => 'Fascinating perspective on urban design.',
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('comments', [
        'post_id' => $post->id,
        'author_name' => 'Aditya Pratama',
        'author_email' => 'aditya@example.com',
    ]);
});

test('sitemap xml generates valid urlset', function () {
    $response = $this->get('/sitemap.xml');
    $response->assertOk();
    $response->assertHeader('Content-Type', 'application/xml');
    $response->assertSee('<urlset', false);
});

test('robots txt generates valid instructions', function () {
    $response = $this->get('/robots.txt');
    $response->assertOk();
    $response->assertSee('User-agent: *');
    $response->assertSee('Sitemap:');
});

test('feed xml generates valid RSS 2.0', function () {
    $response = $this->get('/feed.xml');
    $response->assertOk();
    $response->assertHeader('Content-Type', 'application/rss+xml');
    $response->assertSee('<rss version="2.0"', false);
});

test('seo service evaluates scores accurately', function () {
    $seoService = new SeoService;
    $result = $seoService->analyze(
        'The Art of Modern Flâneur Walking',
        "## Subheading\n\nWalking through cities allows us to observe the lost rhythms of modern life. ".str_repeat('word ', 320),
        'Flâneur Walking',
        'The Art of Modern Flâneur Walking in Kyoto',
        'Explore the lost art of modern flâneur walking across quiet stone avenues and historical canals.'
    );

    expect($result['score'])->toBeGreaterThanOrEqual(80);
    expect($result['status'])->toBe('Good');
});

test('authenticated admin can access analytics pages', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $this->get('/dashboard')->assertOk();
    $this->get('/admin/posts')->assertOk();
    $this->get('/admin/categories')->assertOk();
    $this->get('/admin/comments')->assertOk();
    $this->get('/admin/analytics/visitors')->assertOk();
    $this->get('/admin/analytics/geo')->assertOk();
    $this->get('/admin/analytics/seo')->assertOk();
});
