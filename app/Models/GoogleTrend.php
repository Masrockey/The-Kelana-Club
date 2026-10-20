<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GoogleTrend extends Model
{
    protected $fillable = [
        'geo',
        'query',
        'approx_traffic',
        'description',
        'picture_url',
        'news_title',
        'news_url',
        'news_source',
        'published_at',
        'fetched_at',
        'payload',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'published_at' => 'datetime',
            'fetched_at' => 'datetime',
            'payload' => 'array',
        ];
    }
}
