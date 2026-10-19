<?php

namespace App\Services;

use App\Models\Category;
use App\Models\Post;
use App\Models\Tag;

class SeoService
{
    /**
     * Known search engine bot signatures.
     *
     * @var array<string, string>
     */
    protected static array $bots = [
        // Traditional Search Bots
        'googlebot' => 'Googlebot',
        'bingbot' => 'Bingbot',
        'yandexbot' => 'YandexBot',
        'duckduckbot' => 'DuckDuckBot',
        'baiduspider' => 'Baiduspider',
        'slurp' => 'Yahoo Slurp',
        'sogou' => 'Sogou Spider',
        'exabot' => 'Exabot',
        'facebot' => 'Facebook External Hit',
        'facebookexternalhit' => 'Facebook External Hit',
        'twitterbot' => 'Twitterbot',
        'applebot' => 'Applebot',
        'ahrefsbot' => 'AhrefsBot',
        'semrushbot' => 'SemrushBot',

        // Generative Engine Optimization (GEO) & AI Crawlers
        'gptbot' => 'ChatGPT / OpenAI (GPTBot)',
        'oai-searchbot' => 'ChatGPT Search (OAI-SearchBot)',
        'chatgpt-user' => 'ChatGPT User Agent',
        'claudebot' => 'Anthropic ClaudeBot',
        'anthropic-ai' => 'Anthropic AI',
        'perplexitybot' => 'Perplexity AI Bot',
        'google-extended' => 'Google Gemini (Extended)',
        'bytespider' => 'ByteDance AI (Bytespider)',
        'ccbot' => 'Common Crawl (LLM Ingestion)',
        'cohere-ai' => 'Cohere AI Spider',
    ];

    /**
     * AI & Generative Engine Crawler Identifiers.
     *
     * @var array<string, string>
     */
    public static array $aiBots = [
        'gptbot' => 'ChatGPT / OpenAI (GPTBot)',
        'oai-searchbot' => 'ChatGPT Search (OAI-SearchBot)',
        'chatgpt-user' => 'ChatGPT User Agent',
        'claudebot' => 'Anthropic ClaudeBot',
        'anthropic-ai' => 'Anthropic AI',
        'perplexitybot' => 'Perplexity AI Bot',
        'google-extended' => 'Google Gemini (Extended)',
        'bytespider' => 'ByteDance AI Spider',
        'cohere-ai' => 'Cohere AI',
        'ccbot' => 'Common Crawl (LLM Ingestion)',
    ];

    /**
     * Search engines for organic referrer detection.
     *
     * @var array<string, string>
     */
    protected static array $searchEngines = [
        'google.' => 'Google',
        'bing.com' => 'Bing',
        'yahoo.com' => 'Yahoo',
        'duckduckgo.com' => 'DuckDuckGo',
        'baidu.com' => 'Baidu',
        'yandex.com' => 'Yandex',
        'ecosia.org' => 'Ecosia',
    ];

    /**
     * Analyze SEO for a post or draft.
     *
     * @return array{
     *     score: int,
     *     status: string,
     *     checks: array<int, array{id: string, label: string, passed: bool, impact: string, message: string}>
     * }
     */
    public function analyze(
        string $title,
        ?string $content,
        ?string $focusKeyword,
        ?string $metaTitle,
        ?string $metaDescription
    ): array {
        $checks = [];
        $earnedScore = 0;
        $totalMaxScore = 100;

        $effectiveTitle = trim($metaTitle ?: $title);
        $effectiveDesc = trim((string) $metaDescription);
        $cleanContent = strip_tags((string) $content);
        $wordCount = str_word_count($cleanContent);
        $keyword = mb_strtolower(trim((string) $focusKeyword));

        // 1. Focus keyword provided
        $hasKeyword = ! empty($keyword);
        $checks[] = [
            'id' => 'keyword_provided',
            'label' => 'Focus Keyword Defined',
            'passed' => $hasKeyword,
            'impact' => 'high',
            'message' => $hasKeyword ? "Focus keyword set to '{$focusKeyword}'." : 'Add a target focus keyword to optimize ranking.',
        ];
        if ($hasKeyword) {
            $earnedScore += 10;
        }

        // 2. Keyword in Title
        $titlePassed = $hasKeyword && str_contains(mb_strtolower($effectiveTitle), $keyword);
        $checks[] = [
            'id' => 'keyword_in_title',
            'label' => 'Keyword in Title',
            'passed' => $titlePassed,
            'impact' => 'high',
            'message' => $titlePassed ? 'Focus keyword appears in the title.' : 'Include the focus keyword in the post or SEO title.',
        ];
        if ($titlePassed) {
            $earnedScore += 15;
        }

        // 3. Keyword in Meta Description
        $descPassed = $hasKeyword && str_contains(mb_strtolower($effectiveDesc), $keyword);
        $checks[] = [
            'id' => 'keyword_in_desc',
            'label' => 'Keyword in Meta Description',
            'passed' => $descPassed,
            'impact' => 'high',
            'message' => $descPassed ? 'Focus keyword appears in meta description.' : 'Include the focus keyword in the meta description.',
        ];
        if ($descPassed) {
            $earnedScore += 15;
        }

        // 4. Meta Title Length (optimal 35-65 chars)
        $titleLen = mb_strlen($effectiveTitle);
        $titleLenPassed = $titleLen >= 30 && $titleLen <= 65;
        $checks[] = [
            'id' => 'title_length',
            'label' => 'SEO Title Length',
            'passed' => $titleLenPassed,
            'impact' => 'medium',
            'message' => $titleLenPassed
                ? "Title length is optimal ({$titleLen} characters)."
                : ($titleLen < 30 ? "Title is too short ({$titleLen}/65 chars)." : "Title is too long ({$titleLen}/65 chars, may truncate in SERP)."),
        ];
        if ($titleLenPassed) {
            $earnedScore += 15;
        }

        // 5. Meta Description Length (optimal 120-160 chars)
        $descLen = mb_strlen($effectiveDesc);
        $descLenPassed = $descLen >= 110 && $descLen <= 165;
        $checks[] = [
            'id' => 'desc_length',
            'label' => 'Meta Description Length',
            'passed' => $descLenPassed,
            'impact' => 'medium',
            'message' => $descLenPassed
                ? "Meta description length is ideal ({$descLen} characters)."
                : ($descLen < 110 ? "Meta description is brief ({$descLen}/160 chars)." : "Meta description exceeds 160 chars ({$descLen} chars)."),
        ];
        if ($descLenPassed) {
            $earnedScore += 15;
        }

        // 6. Content Length (300+ words)
        $contentLenPassed = $wordCount >= 300;
        $checks[] = [
            'id' => 'content_length',
            'label' => 'Content Length',
            'passed' => $contentLenPassed,
            'impact' => 'high',
            'message' => $contentLenPassed
                ? "Substantial content depth ({$wordCount} words)."
                : "Content has {$wordCount} words (recommend 300+ words for SEO authority).",
        ];
        if ($contentLenPassed) {
            $earnedScore += 15;
        } elseif ($wordCount >= 150) {
            $earnedScore += 7;
        }

        // 7. Headings (H2 / H3 tags)
        $hasHeadings = (bool) preg_match('/<h[2-4][^>]*>/i', (string) $content) || (bool) preg_match('/(^|\n)#{2,4}\s/m', (string) $content);
        $checks[] = [
            'id' => 'headings_check',
            'label' => 'Subheadings Structure (H2/H3)',
            'passed' => $hasHeadings,
            'impact' => 'medium',
            'message' => $hasHeadings ? 'Content uses subheadings to organize topics.' : 'Use H2 or H3 subheadings to structure your article.',
        ];
        if ($hasHeadings) {
            $earnedScore += 15;
        }

        $finalScore = min($totalMaxScore, max(15, $earnedScore));
        $status = $finalScore >= 80 ? 'Good' : ($finalScore >= 55 ? 'Needs Improvement' : 'Poor');

        return [
            'score' => $finalScore,
            'status' => $status,
            'checks' => $checks,
        ];
    }

    /**
     * Detect search engine bot.
     */
    public function detectBot(?string $userAgent): ?string
    {
        if (empty($userAgent)) {
            return null;
        }

        $ua = strtolower($userAgent);
        foreach (self::$bots as $key => $name) {
            if (str_contains($ua, $key)) {
                return $name;
            }
        }

        return null;
    }

    /**
     * Detect organic search referrer.
     */
    public function detectSearchEngine(?string $referrer): ?string
    {
        if (empty($referrer)) {
            return null;
        }

        $ref = strtolower($referrer);
        foreach (self::$searchEngines as $key => $name) {
            if (str_contains($ref, $key)) {
                return $name;
            }
        }

        return null;
    }

    /**
     * Generate Schema.org JSON-LD array for Article.
     *
     * @return array<string, mixed>
     */
    public function generateArticleSchema(Post $post): array
    {
        $appUrl = config('app.url', url('/'));
        $postUrl = route('posts.show', $post->slug);

        return [
            '@context' => 'https://schema.org',
            '@type' => $post->schema_type ?: 'Article',
            'mainEntityOfPage' => [
                '@type' => 'WebPage',
                '@id' => $postUrl,
            ],
            'headline' => $post->meta_title ?: $post->title,
            'description' => $post->meta_description ?: $post->excerpt,
            'image' => $post->og_image ?: $post->featured_image ?: "{$appUrl}/og-default.jpg",
            'datePublished' => $post->published_at ? $post->published_at->toIso8601String() : $post->created_at->toIso8601String(),
            'dateModified' => $post->updated_at->toIso8601String(),
            'author' => [
                '@type' => 'Person',
                'name' => $post->user ? $post->user->name : 'Editorial Staff',
            ],
            'publisher' => [
                '@type' => 'Organization',
                'name' => config('app.name', 'The Kelana Club'),
                'logo' => [
                    '@type' => 'ImageObject',
                    'url' => "{$appUrl}/logo.png",
                ],
            ],
            'keywords' => $post->focus_keyword ?: ($post->category ? $post->category->name : 'Journalism'),
            'articleSection' => $post->category ? $post->category->name : 'Essays',
            'inLanguage' => $post->geo_hreflang_code ?: 'id-ID',
            'spatialCoverage' => $post->geo_placename ? [
                '@type' => 'Place',
                'name' => $post->geo_placename,
                'geo' => ($post->geo_latitude && $post->geo_longitude) ? [
                    '@type' => 'GeoCoordinates',
                    'latitude' => $post->geo_latitude,
                    'longitude' => $post->geo_longitude,
                ] : null,
            ] : null,
        ];
    }

    /**
     * Generate Breadcrumbs Schema.org.
     *
     * @return array<string, mixed>
     */
    public function generateBreadcrumbsSchema(Post $post): array
    {
        $items = [
            [
                '@type' => 'ListItem',
                'position' => 1,
                'name' => 'Home',
                'item' => url('/'),
            ],
        ];

        if ($post->category) {
            $items[] = [
                '@type' => 'ListItem',
                'position' => 2,
                'name' => $post->category->name,
                'item' => route('category.show', $post->category->slug),
            ];
            $items[] = [
                '@type' => 'ListItem',
                'position' => 3,
                'name' => $post->title,
                'item' => route('posts.show', $post->slug),
            ];
        } else {
            $items[] = [
                '@type' => 'ListItem',
                'position' => 2,
                'name' => $post->title,
                'item' => route('posts.show', $post->slug),
            ];
        }

        return [
            '@context' => 'https://schema.org',
            '@type' => 'BreadcrumbList',
            'itemListElement' => $items,
        ];
    }

    /**
     * Generate dynamic XML Sitemap.
     */
    public function generateSitemapXml(): string
    {
        $posts = Post::published()->orderBy('updated_at', 'desc')->get();
        $categories = Category::all();
        $tags = Tag::all();

        $xml = '<?xml version="1.0" encoding="UTF-8"?>';
        $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">';

        // Homepage
        $xml .= '<url>';
        $xml .= '<loc>'.htmlspecialchars(url('/')).'</loc>';
        $xml .= '<lastmod>'.now()->toAtomString().'</lastmod>';
        $xml .= '<changefreq>daily</changefreq>';
        $xml .= '<priority>1.0</priority>';
        $xml .= '</url>';

        // Posts
        foreach ($posts as $post) {
            $xml .= '<url>';
            $xml .= '<loc>'.htmlspecialchars(route('posts.show', $post->slug)).'</loc>';
            $xml .= '<lastmod>'.$post->updated_at->toAtomString().'</lastmod>';
            $xml .= '<changefreq>weekly</changefreq>';
            $xml .= '<priority>'.($post->is_featured ? '0.9' : '0.8').'</priority>';
            $xml .= '</url>';
        }

        // Categories
        foreach ($categories as $cat) {
            $xml .= '<url>';
            $xml .= '<loc>'.htmlspecialchars(route('category.show', $cat->slug)).'</loc>';
            $xml .= '<lastmod>'.$cat->updated_at->toAtomString().'</lastmod>';
            $xml .= '<changefreq>weekly</changefreq>';
            $xml .= '<priority>0.6</priority>';
            $xml .= '</url>';
        }

        $xml .= '</urlset>';

        return $xml;
    }

    /**
     * Analyze Generative Engine Optimization (GEO) for AI search citations (ChatGPT, Perplexity, Gemini, Claude).
     *
     * @return array{
     *     score: int,
     *     status: string,
     *     checks: array<int, array{id: string, label: string, passed: bool, impact: string, message: string}>,
     *     aiSnippet: string
     * }
     */
    public function analyzeGeo(
        string $title,
        ?string $content,
        ?string $excerpt,
        ?string $focusKeyword
    ): array {
        $checks = [];
        $earnedScore = 0;
        $cleanContent = strip_tags((string) $content);

        // 1. Direct Answer / Executive Summary Check
        $hasSummary = ! empty(trim((string) $excerpt)) && strlen(trim((string) $excerpt)) >= 50;
        $checks[] = [
            'id' => 'direct_answer',
            'label' => 'Direct Answer / Executive Summary',
            'passed' => $hasSummary,
            'impact' => 'high',
            'message' => $hasSummary
                ? 'Concise executive thesis available for generative AI synthesis.'
                : 'Add a 1-2 sentence direct answer in the excerpt to help AI models cite your conclusion immediately.',
        ];
        if ($hasSummary) {
            $earnedScore += 20;
        }

        // 2. Factual / Numerical Statistics Density
        $numberMatches = preg_match_all('/\b\d+(?:[\.,]\d+)?(?:\s*(?:km|m|%|meters|kilometers|hours|days|years|IDR|USD|\$))?\b/i', $cleanContent);
        $hasStatistics = $numberMatches >= 3;
        $checks[] = [
            'id' => 'data_density',
            'label' => 'Factual & Numerical Data Points',
            'passed' => $hasStatistics,
            'impact' => 'high',
            'message' => $hasStatistics
                ? "Rich empirical grounding detected ({$numberMatches} numerical/statistical data points found)."
                : 'Include concrete numbers, elevations, distances, costs, or statistics to establish authoritative ground truth for LLMs.',
        ];
        if ($hasStatistics) {
            $earnedScore += 20;
        }

        // 3. Authoritative Quotes & Field Eyewitness Citations
        $hasQuotes = preg_match('/["“][^"”]{15,}["”]/u', $cleanContent) || str_contains($content ?? '', '<blockquote') || preg_match('/\b(according to|stated by|witnessed|reported)\b/i', $cleanContent);
        $checks[] = [
            'id' => 'authoritative_quotes',
            'label' => 'First-Hand Quotes & Citations',
            'passed' => (bool) $hasQuotes,
            'impact' => 'medium',
            'message' => $hasQuotes
                ? 'Attributed quotations and expert/eyewitness sources detected.'
                : 'Incorporate pull quotes, eyewitness accounts, or official references to elevate citation trust.',
        ];
        if ($hasQuotes) {
            $earnedScore += 20;
        }

        // 4. Conversational Question-Oriented Headings (Prompt Alignment)
        $hasQuestions = preg_match('/(?:^|\n)#{2,4}\s*(?:How|What|Why|Where|When|Who|Best|Guide|\?)/im', (string) $content)
            || preg_match('/<h[2-4][^>]*>(?:How|What|Why|Where|When|Who|Best|Guide|[^<]*\?)/i', (string) $content);
        $checks[] = [
            'id' => 'conversational_headings',
            'label' => 'Conversational Query Headings',
            'passed' => (bool) $hasQuestions,
            'impact' => 'medium',
            'message' => $hasQuestions
                ? 'Subheadings match natural user prompts and AI query formulations.'
                : 'Formulate at least one heading as a question (e.g. "How to reach...", "What to prepare...") to match AI prompts.',
        ];
        if ($hasQuestions) {
            $earnedScore += 20;
        }

        // 5. Structured Entity Lists & Checkpoints
        $hasLists = str_contains($content ?? '', '<ul') || str_contains($content ?? '', '<ol')
            || preg_match('/(?:^|\n)\s*[-*•\d+\.]\s+/m', (string) $content);
        $checks[] = [
            'id' => 'structured_entities',
            'label' => 'Structured Lists / Key Takeaways',
            'passed' => (bool) $hasLists,
            'impact' => 'medium',
            'message' => $hasLists
                ? 'Structured lists detected for easy bulleted AI card synthesis.'
                : 'Use bulleted lists for key recommendations, gear, or waypoint coordinates.',
        ];
        if ($hasLists) {
            $earnedScore += 20;
        }

        $geoScore = min(100, max(10, $earnedScore));
        $status = $geoScore >= 80 ? 'AI Citation Ready' : ($geoScore >= 50 ? 'Moderate GEO' : 'Needs Optimization');
        $aiSnippet = $excerpt ?: substr($cleanContent, 0, 220).'...';

        return [
            'score' => $geoScore,
            'status' => $status,
            'checks' => $checks,
            'aiSnippet' => $aiSnippet,
        ];
    }

    /**
     * Generate Schema.org JSON-LD tailored for Generative AI Models (ChatGPT, Perplexity, Gemini).
     *
     * @return array<string, mixed>
     */
    public function generateGeoAiSchema(Post $post): array
    {
        $appUrl = config('app.url', url('/'));
        $postUrl = route('posts.show', $post->slug);

        return [
            '@context' => 'https://schema.org',
            '@type' => 'Article',
            '@id' => "{$postUrl}#geo-ai",
            'headline' => $post->title,
            'abstract' => $post->excerpt ?: substr(strip_tags($post->content), 0, 260),
            'speakable' => [
                '@type' => 'SpeakableSpecification',
                'cssSelector' => ['.geo-ai-summary', 'article h1', 'article p:first-of-type'],
            ],
            'author' => [
                '@type' => 'Person',
                'name' => $post->user ? $post->user->name : 'Kelana Dispatcher',
            ],
            'publisher' => [
                '@type' => 'Organization',
                'name' => config('app.name', 'The Kelana Club'),
                'url' => $appUrl,
            ],
            'isAccessibleForFree' => true,
            'inLanguage' => $post->geo_hreflang_code ?: 'id-ID',
            'keywords' => $post->focus_keyword ?: 'Travel Route Intelligence',
        ];
    }
}
