<?php

use App\Models\Category;
use App\Models\MediaFile;
use App\Models\Post;
use App\Models\User;
use App\Services\SeoService;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia;

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
    $this->get('/admin/media')->assertOk();
    $this->get('/admin/categories')->assertOk();
    $this->get('/admin/comments')->assertOk();
    $this->get('/admin/analytics/visitors')->assertOk();
    $this->get('/admin/analytics/geo')->assertOk();
    $this->get('/admin/analytics/seo')->assertOk();
});

test('media library provides inertia page on /admin/media and json on /admin/media/items', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    // Inertia visit to /admin/media
    $inertiaResponse = $this->get('/admin/media');
    $inertiaResponse->assertOk();
    $inertiaResponse->assertInertia(fn (AssertableInertia $page) => $page->component('admin/media/index'));

    // JSON API visit to /admin/media/items for modal picker
    $jsonResponse = $this->getJson('/admin/media/items');
    $jsonResponse->assertOk();
    $jsonResponse->assertJsonStructure(['data', 'current_page', 'last_page']);
});

test('authenticated admin can upload an image file to media library', function () {
    Storage::fake('public');

    $user = User::factory()->create();
    $this->actingAs($user);

    $file = UploadedFile::fake()->image('expedition-pass.jpg', 1200, 800);

    $response = $this->postJson('/admin/media/upload', [
        'file' => $file,
        'alt_text' => 'High Karakoram Pass',
        'caption' => 'Expedition ascent at sunrise',
    ]);

    $response->assertCreated();
    $response->assertJson([
        'success' => true,
        'media' => [
            'alt_text' => 'High Karakoram Pass',
            'caption' => 'Expedition ascent at sunrise',
            'source_type' => 'upload',
        ],
    ]);

    $this->assertDatabaseHas('media_files', [
        'alt_text' => 'High Karakoram Pass',
        'source_type' => 'upload',
    ]);
});

test('authenticated admin can import an image from URL into media library', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $response = $this->postJson('/admin/media/import-url', [
        'url' => 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=800&q=80',
        'name' => 'Ha Giang Viewpoint',
        'alt_text' => 'Ha Giang karst peaks',
        'caption' => 'Ma Pi Leng road pass',
    ]);

    $response->assertCreated();
    $response->assertJson([
        'success' => true,
    ]);

    $this->assertDatabaseHas('media_files', [
        'name' => 'Ha Giang Viewpoint',
    ]);
});

test('authenticated admin can delete media file with proper inertia redirect or json response', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $media1 = MediaFile::create([
        'user_id' => $user->id,
        'name' => 'To Delete Inertia',
        'url' => 'https://example.com/test1.jpg',
        'source_type' => 'url',
    ]);

    // Deleting via Inertia request returns redirect back
    $responseInertia = $this->withHeaders(['X-Inertia' => 'true'])
        ->from('/admin/media')
        ->delete("/admin/media/{$media1->id}");

    $responseInertia->assertRedirect('/admin/media');
    $this->assertDatabaseMissing('media_files', ['id' => $media1->id]);

    $media2 = MediaFile::create([
        'user_id' => $user->id,
        'name' => 'To Delete JSON',
        'url' => 'https://example.com/test2.jpg',
        'source_type' => 'url',
    ]);

    // Deleting via pure JSON API request returns JSON
    $this->flushHeaders();
    $responseJson = $this->deleteJson("/admin/media/{$media2->id}");
    $responseJson->assertOk();
    $responseJson->assertJson(['success' => true, 'message' => 'Media file deleted']);
    $this->assertDatabaseMissing('media_files', ['id' => $media2->id]);
});
