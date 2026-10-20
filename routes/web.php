<?php

use App\Http\Controllers\Admin\AnalyticsController;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\CommentController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\MediaController;
use App\Http\Controllers\Admin\MenuController;
use App\Http\Controllers\Admin\PostController;
use App\Http\Controllers\Admin\TrendController;
use App\Http\Controllers\BlogController;
use App\Http\Controllers\SitemapController;
use Illuminate\Support\Facades\Route;

// Public SEO & Feed routes
Route::get('/sitemap.xml', [SitemapController::class, 'sitemap'])->name('sitemap');
Route::get('/robots.txt', [SitemapController::class, 'robots'])->name('robots');
Route::get('/feed.xml', [SitemapController::class, 'feed'])->name('feed');

// Public Blog front-end routes
Route::get('/', [BlogController::class, 'index'])->name('home');
Route::get('/article/{slug}', [BlogController::class, 'show'])->name('posts.show');
Route::post('/article/{slug}/comment', [BlogController::class, 'storeComment'])->name('posts.comment');
Route::get('/category/{slug}', [BlogController::class, 'category'])->name('category.show');
Route::get('/tag/{slug}', [BlogController::class, 'tag'])->name('tag.show');

// Admin Dashboard & Management routes
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::prefix('admin')->name('admin.')->group(function () {
        // Live SEO analysis helper
        Route::post('/posts/analyze-seo', [PostController::class, 'analyzeSeo'])->name('posts.analyze-seo');
        Route::resource('posts', PostController::class);

        // Categories & Comments
        Route::resource('categories', CategoryController::class)->except(['create', 'edit', 'show']);
        Route::get('/comments', [CommentController::class, 'index'])->name('comments.index');
        Route::patch('/comments/{comment}/status', [CommentController::class, 'updateStatus'])->name('comments.status');
        Route::delete('/comments/{comment}', [CommentController::class, 'destroy'])->name('comments.destroy');

        // Navigation Menu Editor (WordPress Style)
        Route::get('/menus', [MenuController::class, 'index'])->name('menus.index');
        Route::post('/menus/save', [MenuController::class, 'save'])->name('menus.save');
        Route::post('/menus/reset', [MenuController::class, 'reset'])->name('menus.reset');

        // Analytics Suite (Visitor, GEO, SEO)
        Route::get('/analytics/visitors', [AnalyticsController::class, 'visitors'])->name('analytics.visitors');
        Route::get('/analytics/geo', [AnalyticsController::class, 'geo'])->name('analytics.geo');
        Route::get('/analytics/seo', [AnalyticsController::class, 'seo'])->name('analytics.seo');

        // Google Trends Live Feed (Auto-cached & purged every 3 hours)
        Route::get('/trends', [TrendController::class, 'index'])->name('trends.index');
        Route::post('/trends/refresh', [TrendController::class, 'refresh'])->name('trends.refresh');
        Route::post('/trends/purge', [TrendController::class, 'purge'])->name('trends.purge');

        // Media Library (Upload file, import from URL, browse)
        Route::get('/media', [MediaController::class, 'index'])->name('media.index');
        Route::get('/media/items', [MediaController::class, 'items'])->name('media.items');
        Route::post('/media/upload', [MediaController::class, 'upload'])->name('media.upload');
        Route::post('/media/import-url', [MediaController::class, 'importFromUrl'])->name('media.import-url');
        Route::put('/media/{media}', [MediaController::class, 'update'])->name('media.update');
        Route::delete('/media/{media}', [MediaController::class, 'destroy'])->name('media.destroy');
    });
});

require __DIR__.'/settings.php';
