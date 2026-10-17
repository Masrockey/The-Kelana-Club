<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PageVisit extends Model
{
    use HasFactory;

    protected $fillable = [
        'post_id',
        'url',
        'ip_address',
        'session_id',
        'user_agent',
        'country_code',
        'country_name',
        'city',
        'region',
        'latitude',
        'longitude',
        'device_type',
        'browser',
        'os',
        'referrer',
        'referrer_domain',
        'is_bot',
        'bot_name',
        'is_unique',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_bot' => 'boolean',
            'is_unique' => 'boolean',
            'latitude' => 'float',
            'longitude' => 'float',
        ];
    }

    /**
     * @return BelongsTo<Post, $this>
     */
    public function post(): BelongsTo
    {
        return $this->belongsTo(Post::class);
    }
}
