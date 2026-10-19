<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Post extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'category_id',
        'title',
        'slug',
        'excerpt',
        'content',
        'featured_image',
        'status',
        'is_featured',
        'published_at',
        'read_time_minutes',
        'views_count',
        'meta_title',
        'meta_description',
        'focus_keyword',
        'canonical_url',
        'og_image',
        'schema_type',
        'seo_score',
        'geo_score',
        'geo_target_country',
        'geo_region',
        'geo_placename',
        'geo_latitude',
        'geo_longitude',
        'geo_hreflang_code',
    ];

    /**
     * @var array<int, string>
     */
    protected $appends = [
        'geo_score',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'published_at' => 'datetime',
            'is_featured' => 'boolean',
            'read_time_minutes' => 'integer',
            'views_count' => 'integer',
            'seo_score' => 'integer',
            'geo_score' => 'integer',
            'geo_latitude' => 'float',
            'geo_longitude' => 'float',
        ];
    }

    /**
     * Compute dynamic Generative Engine Optimization (GEO) score.
     */
    public function getGeoScoreAttribute(): int
    {
        if (isset($this->attributes['geo_score']) && $this->attributes['geo_score'] !== null) {
            return (int) $this->attributes['geo_score'];
        }

        $cleanContent = strip_tags((string) $this->content);
        $score = 0;

        if (! empty(trim((string) $this->excerpt)) && strlen(trim((string) $this->excerpt)) >= 50) {
            $score += 20;
        }

        if (preg_match_all('/\b\d+(?:[\.,]\d+)?(?:\s*(?:km|m|%|meters|kilometers|hours|days|years|IDR|USD|\$))?\b/i', $cleanContent) >= 3) {
            $score += 20;
        }

        if (preg_match('/["“][^"”]{15,}["”]/u', $cleanContent) || str_contains($this->content ?? '', '<blockquote') || preg_match('/\b(according to|stated by|witnessed|reported)\b/i', $cleanContent)) {
            $score += 20;
        }

        if (preg_match('/(?:^|\n)#{2,4}\s*(?:How|What|Why|Where|When|Who|Best|Guide|\?)/im', (string) $this->content) || preg_match('/<h[2-4][^>]*>(?:How|What|Why|Where|When|Who|Best|Guide|[^<]*\?)/i', (string) $this->content)) {
            $score += 20;
        }

        if (str_contains($this->content ?? '', '<ul') || str_contains($this->content ?? '', '<ol') || preg_match('/(?:^|\n)\s*[-*•\d+\.]\s+/m', (string) $this->content)) {
            $score += 20;
        }

        return min(100, max(20, $score));
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return BelongsTo<Category, $this>
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * @return BelongsToMany<Tag, $this>
     */
    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class);
    }

    /**
     * @return HasMany<Comment, $this>
     */
    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class);
    }

    /**
     * @return HasMany<PageVisit, $this>
     */
    public function visits(): HasMany
    {
        return $this->hasMany(PageVisit::class);
    }

    /**
     * Scope a query to only include published posts.
     *
     * @param  Builder<Post>  $query
     */
    public function scopePublished(Builder $query): void
    {
        $query->where('status', 'published')
            ->whereNotNull('published_at')
            ->where('published_at', '<=', now());
    }

    /**
     * Automatically compute reading time.
     */
    public static function estimateReadTime(string $content): int
    {
        $words = str_word_count(strip_tags($content));

        return max(1, (int) ceil($words / 200));
    }
}
