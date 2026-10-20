<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Post;
use App\Models\Tag;
use App\Services\GeoService;
use App\Services\SeoService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class PostController extends Controller
{
    public function __construct(
        protected SeoService $seoService,
        protected GeoService $geoService
    ) {}

    /**
     * Display a listing of posts.
     */
    public function index(Request $request): Response
    {
        $search = $request->query('q');
        $status = $request->query('status');
        $categoryId = $request->query('category_id');

        $posts = Post::with(['category', 'tags', 'user:id,name'])
            ->when($search, function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('focus_keyword', 'like', "%{$search}%")
                    ->orWhere('slug', 'like', "%{$search}%");
            })
            ->when($status, function ($q) use ($status) {
                $q->where('status', $status);
            })
            ->when($categoryId, function ($q) use ($categoryId) {
                $q->where('category_id', $categoryId);
            })
            ->orderBy('created_at', 'desc')
            ->paginate(15)
            ->withQueryString();

        $categories = Category::all();

        return Inertia::render('admin/posts/index', [
            'posts' => $posts,
            'categories' => $categories,
            'filters' => [
                'q' => $search,
                'status' => $status,
                'category_id' => $categoryId,
            ],
        ]);
    }

    /**
     * Show the form for creating a new post.
     */
    public function create(Request $request): Response
    {
        $categories = Category::all();
        $tags = Tag::all();
        $geoPresets = GeoService::$geoPresets;

        $prefill = null;
        if ($request->filled('title') || $request->filled('focus_keyword')) {
            $title = (string) $request->query('title', '');
            $prefill = [
                'title' => $title,
                'slug' => Str::slug($title),
                'focus_keyword' => (string) $request->query('focus_keyword', $title),
                'meta_description' => (string) $request->query('meta_description', ''),
                'excerpt' => (string) $request->query('excerpt', ''),
            ];
        }

        return Inertia::render('admin/posts/form', [
            'post' => $prefill,
            'categories' => $categories,
            'tags' => $tags,
            'geoPresets' => $geoPresets,
        ]);
    }

    /**
     * Store a newly created post in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:posts,slug',
            'category_id' => 'nullable|exists:categories,id',
            'excerpt' => 'nullable|string|max:600',
            'content' => 'required|string',
            'featured_image' => 'nullable|string|max:500',
            'status' => 'required|in:draft,published,scheduled',
            'is_featured' => 'boolean',
            'published_at' => 'nullable|date',

            // SEO Fields
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:400',
            'focus_keyword' => 'nullable|string|max:100',
            'canonical_url' => 'nullable|url|max:255',
            'og_image' => 'nullable|string|max:500',
            'schema_type' => 'nullable|string|max:50',

            // GEO Fields
            'geo_target_country' => 'nullable|string|max:10',
            'geo_region' => 'nullable|string|max:50',
            'geo_placename' => 'nullable|string|max:100',
            'geo_latitude' => 'nullable|numeric',
            'geo_longitude' => 'nullable|numeric',
            'geo_hreflang_code' => 'nullable|string|max:15',

            // Tags
            'tag_ids' => 'nullable|array',
            'tag_ids.*' => 'exists:tags,id',
        ]);

        $slug = ! empty($validated['slug']) ? Str::slug($validated['slug']) : Str::slug($validated['title']);
        // Ensure unique slug
        $originalSlug = $slug;
        $counter = 1;
        while (Post::where('slug', $slug)->exists()) {
            $slug = "{$originalSlug}-{$counter}";
            $counter++;
        }
        $validated['slug'] = $slug;

        $validated['user_id'] = $request->user()->id;
        $validated['read_time_minutes'] = Post::estimateReadTime($validated['content']);

        if ($validated['status'] === 'published' && empty($validated['published_at'])) {
            $validated['published_at'] = now();
        }

        // Evaluate SEO & GEO AI Scores
        $seoAnalysis = $this->seoService->analyze(
            $validated['title'],
            $validated['content'],
            $validated['focus_keyword'] ?? null,
            $validated['meta_title'] ?? null,
            $validated['meta_description'] ?? null
        );
        $validated['seo_score'] = $seoAnalysis['score'];

        $geoAnalysis = $this->seoService->analyzeGeo(
            $validated['title'],
            $validated['content'],
            $validated['excerpt'] ?? null,
            $validated['focus_keyword'] ?? null
        );
        $validated['geo_score'] = $geoAnalysis['score'];

        $post = Post::create($validated);

        if (! empty($validated['tag_ids'])) {
            $post->tags()->sync($validated['tag_ids']);
        }

        return redirect()->route('admin.posts.index')->with('success', "Post '{$post->title}' created successfully (SEO: {$post->seo_score}/100, GEO AI: {$post->geo_score}/100).");
    }

    /**
     * Show the form for editing the specified post.
     */
    public function edit(Post $post): Response
    {
        $post->load(['tags', 'category']);
        $categories = Category::all();
        $tags = Tag::all();
        $geoPresets = GeoService::$geoPresets;

        $seoAnalysis = $this->seoService->analyze(
            $post->title,
            $post->content,
            $post->focus_keyword,
            $post->meta_title,
            $post->meta_description
        );

        return Inertia::render('admin/posts/form', [
            'post' => $post,
            'categories' => $categories,
            'tags' => $tags,
            'geoPresets' => $geoPresets,
            'initialSeoAnalysis' => $seoAnalysis,
        ]);
    }

    /**
     * Update the specified post in storage.
     */
    public function update(Request $request, Post $post): RedirectResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:posts,slug,'.$post->id,
            'category_id' => 'nullable|exists:categories,id',
            'excerpt' => 'nullable|string|max:600',
            'content' => 'required|string',
            'featured_image' => 'nullable|string|max:500',
            'status' => 'required|in:draft,published,scheduled',
            'is_featured' => 'boolean',
            'published_at' => 'nullable|date',

            // SEO Fields
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:400',
            'focus_keyword' => 'nullable|string|max:100',
            'canonical_url' => 'nullable|url|max:255',
            'og_image' => 'nullable|string|max:500',
            'schema_type' => 'nullable|string|max:50',

            // GEO Fields
            'geo_target_country' => 'nullable|string|max:10',
            'geo_region' => 'nullable|string|max:50',
            'geo_placename' => 'nullable|string|max:100',
            'geo_latitude' => 'nullable|numeric',
            'geo_longitude' => 'nullable|numeric',
            'geo_hreflang_code' => 'nullable|string|max:15',

            // Tags
            'tag_ids' => 'nullable|array',
            'tag_ids.*' => 'exists:tags,id',
        ]);

        if (! empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['slug']);
        }

        $validated['read_time_minutes'] = Post::estimateReadTime($validated['content']);

        if ($validated['status'] === 'published' && empty($post->published_at) && empty($validated['published_at'])) {
            $validated['published_at'] = now();
        }

        // Evaluate SEO & GEO AI Scores
        $seoAnalysis = $this->seoService->analyze(
            $validated['title'],
            $validated['content'],
            $validated['focus_keyword'] ?? null,
            $validated['meta_title'] ?? null,
            $validated['meta_description'] ?? null
        );
        $validated['seo_score'] = $seoAnalysis['score'];

        $geoAnalysis = $this->seoService->analyzeGeo(
            $validated['title'],
            $validated['content'],
            $validated['excerpt'] ?? null,
            $validated['focus_keyword'] ?? null
        );
        $validated['geo_score'] = $geoAnalysis['score'];

        $post->update($validated);

        if (isset($validated['tag_ids'])) {
            $post->tags()->sync($validated['tag_ids']);
        }

        return redirect()->route('admin.posts.index')->with('success', "Post '{$post->title}' updated successfully (SEO: {$post->seo_score}/100, GEO AI: {$post->geo_score}/100).");
    }

    /**
     * Remove the specified post from storage.
     */
    public function destroy(Post $post): RedirectResponse
    {
        $title = $post->title;
        $post->delete();

        return redirect()->route('admin.posts.index')->with('success', "Post '{$title}' deleted.");
    }

    /**
     * Live AJAX/JSON SEO analysis endpoint.
     */
    public function analyzeSeo(Request $request): JsonResponse
    {
        $seoAnalysis = $this->seoService->analyze(
            $request->input('title', ''),
            $request->input('content', ''),
            $request->input('focus_keyword', ''),
            $request->input('meta_title', ''),
            $request->input('meta_description', '')
        );

        $geoAnalysis = $this->seoService->analyzeGeo(
            $request->input('title', ''),
            $request->input('content', ''),
            $request->input('excerpt', ''),
            $request->input('focus_keyword', '')
        );

        return response()->json([
            'seo' => $seoAnalysis,
            'geo' => $geoAnalysis,
            ...$seoAnalysis,
        ]);
    }
}
