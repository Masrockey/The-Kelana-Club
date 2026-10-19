<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Comment;
use App\Models\Post;
use App\Models\Tag;
use App\Services\GeoService;
use App\Services\SeoService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class BlogController extends Controller
{
    public function __construct(
        protected SeoService $seoService,
        protected GeoService $geoService
    ) {}

    /**
     * Display public blog home page.
     */
    public function index(Request $request): Response
    {
        $search = $request->query('q');
        $categorySlug = $request->query('category');
        $tagSlug = $request->query('tag');
        $countryFilter = $request->query('country');

        $query = Post::published()
            ->with(['category', 'tags', 'user:id,name,email'])
            ->orderBy('published_at', 'desc');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('excerpt', 'like', "%{$search}%")
                    ->orWhere('focus_keyword', 'like', "%{$search}%")
                    ->orWhere('content', 'like', "%{$search}%");
            });
        }

        if ($categorySlug) {
            $query->whereHas('category', function ($q) use ($categorySlug) {
                $q->where('slug', $categorySlug);
            });
        }

        if ($tagSlug) {
            $query->whereHas('tags', function ($q) use ($tagSlug) {
                $q->where('slug', $tagSlug);
            });
        }

        if ($countryFilter && $countryFilter !== 'ALL') {
            $query->where(function ($q) use ($countryFilter) {
                $q->where('geo_target_country', $countryFilter)
                    ->orWhere('geo_target_country', 'ALL');
            });
        }

        $allPosts = (clone $query)->get();

        // Lead featured post
        $featuredPost = $allPosts->firstWhere('is_featured', true) ?: $allPosts->first();
        $posts = $allPosts->filter(fn ($p) => $featuredPost ? $p->id !== $featuredPost->id : true)->values();

        $categories = Category::withCount(['posts' => function ($q) {
            $q->published();
        }])->get();

        $tags = Tag::whereHas('posts', function ($q) {
            $q->published();
        })->withCount(['posts' => function ($q) {
            $q->published();
        }])->get();

        $visitorGeo = $this->geoService->resolve($request);

        $popularPosts = Post::published()
            ->with(['category', 'user:id,name'])
            ->orderBy('views_count', 'desc')
            ->take(5)
            ->get();

        return Inertia::render('blog/index', [
            'featuredPost' => $featuredPost,
            'posts' => $posts,
            'popularPosts' => $popularPosts,
            'categories' => $categories,
            'tags' => $tags,
            'filters' => [
                'q' => $search,
                'category' => $categorySlug,
                'tag' => $tagSlug,
                'country' => $countryFilter,
            ],
            'visitorGeo' => $visitorGeo,
            'siteMeta' => [
                'title' => 'The Kelana Club — Real Routes by Real Travelers',
                'description' => 'A worldwide travel journal documenting authentic overland routes, alpine traverses, island hopping, and field intelligence by real travelers.',
                'canonical' => url('/'),
            ],
        ]);
    }

    /**
     * Display a single post with SEO & GEO meta tags.
     */
    public function show(Request $request, string $slug): Response
    {
        $post = Post::published()
            ->with([
                'category',
                'tags',
                'user:id,name,email',
                'comments' => function ($q) {
                    $q->where('status', 'approved')
                        ->whereNull('parent_id')
                        ->with(['replies' => function ($rq) {
                            $rq->where('status', 'approved');
                        }])
                        ->orderBy('created_at', 'desc');
                },
            ])
            ->where('slug', $slug)
            ->firstOrFail();

        $relatedPosts = Post::published()
            ->where('id', '!=', $post->id)
            ->when($post->category_id, function ($q) use ($post) {
                $q->where('category_id', $post->category_id);
            })
            ->with(['category', 'user:id,name'])
            ->limit(3)
            ->get();

        $articleSchema = $this->seoService->generateArticleSchema($post);
        $breadcrumbSchema = $this->seoService->generateBreadcrumbsSchema($post);
        $geoAiSchema = $this->seoService->generateGeoAiSchema($post);
        $visitorGeo = $this->geoService->resolve($request);

        return Inertia::render('blog/show', [
            'post' => $post,
            'relatedPosts' => $relatedPosts,
            'articleSchema' => $articleSchema,
            'breadcrumbSchema' => $breadcrumbSchema,
            'geoAiSchema' => $geoAiSchema,
            'visitorGeo' => $visitorGeo,
            'hcaptchaSiteKey' => config('services.hcaptcha.sitekey', '10000000-ffff-ffff-ffff-000000000001'),
        ]);
    }

    /**
     * Display posts by category.
     */
    public function category(string $slug): Response
    {
        $category = Category::where('slug', $slug)->firstOrFail();

        $posts = Post::published()
            ->where('category_id', $category->id)
            ->with(['category', 'tags', 'user:id,name'])
            ->orderBy('published_at', 'desc')
            ->paginate(12);

        $categories = Category::withCount(['posts' => function ($q) {
            $q->published();
        }])->get();

        return Inertia::render('blog/archive', [
            'title' => "Dispatches in {$category->name}",
            'description' => $category->description ?: "Curated essays and dispatches filed under {$category->name}.",
            'badge' => 'Category',
            'posts' => $posts,
            'categories' => $categories,
            'currentSlug' => $slug,
        ]);
    }

    /**
     * Display posts by tag.
     */
    public function tag(string $slug): Response
    {
        $tag = Tag::where('slug', $slug)->firstOrFail();

        $posts = Post::published()
            ->whereHas('tags', function ($q) use ($tag) {
                $q->where('tags.id', $tag->id);
            })
            ->with(['category', 'tags', 'user:id,name'])
            ->orderBy('published_at', 'desc')
            ->paginate(12);

        $categories = Category::withCount(['posts' => function ($q) {
            $q->published();
        }])->get();

        return Inertia::render('blog/archive', [
            'title' => "Stories tagged #{$tag->name}",
            'description' => "All dispatches and articles tagged with #{$tag->name}.",
            'badge' => 'Tag',
            'posts' => $posts,
            'categories' => $categories,
            'currentSlug' => $slug,
        ]);
    }

    /**
     * Store reader comment.
     */
    public function storeComment(Request $request, string $slug): RedirectResponse
    {
        $post = Post::published()->where('slug', $slug)->firstOrFail();

        $validated = $request->validate([
            'author_name' => 'required|string|max:100',
            'author_email' => 'required|email|max:150',
            'author_website' => 'nullable|url|max:200',
            'content' => 'required|string|min:3|max:2000',
            'parent_id' => 'nullable|exists:comments,id',
            'h-captcha-response' => 'nullable|string',
        ]);

        $hcaptchaSecret = config('services.hcaptcha.secret');
        if ($hcaptchaSecret && ! app()->environment('testing')) {
            $token = $request->input('h-captcha-response');
            if (empty($token)) {
                return back()->withErrors(['h-captcha-response' => 'Please complete the hCaptcha verification.']);
            }

            try {
                $response = Http::asForm()->timeout(5)->post('https://api.hcaptcha.com/siteverify', [
                    'secret' => $hcaptchaSecret,
                    'response' => $token,
                    'remoteip' => $request->ip(),
                ]);

                if (! $response->json('success')) {
                    return back()->withErrors(['h-captcha-response' => 'hCaptcha verification failed. Please try again.']);
                }
            } catch (\Exception $e) {
                Log::warning('hCaptcha verification error: '.$e->getMessage());
            }
        }

        $post->comments()->create([
            'parent_id' => $validated['parent_id'] ?? null,
            'author_name' => $validated['author_name'],
            'author_email' => $validated['author_email'],
            'author_website' => $validated['author_website'] ?? null,
            'content' => $validated['content'],
            'status' => 'approved',
        ]);

        return back()->with('success', 'Your commentary has been published.');
    }
}
