<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('color', 30)->default('#C2410C');
            $table->timestamps();
        });

        Schema::create('tags', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->timestamps();
        });

        Schema::create('posts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('category_id')->nullable()->constrained()->nullOnDelete();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('excerpt')->nullable();
            $table->longText('content');
            $table->string('featured_image')->nullable();
            $table->string('status', 20)->default('draft'); // draft, published, scheduled
            $table->boolean('is_featured')->default(false);
            $table->timestamp('published_at')->nullable()->index();
            $table->unsignedInteger('read_time_minutes')->default(3);
            $table->unsignedBigInteger('views_count')->default(0);

            // SEO Optimizer Fields
            $table->string('meta_title')->nullable();
            $table->text('meta_description')->nullable();
            $table->string('focus_keyword')->nullable();
            $table->string('canonical_url')->nullable();
            $table->string('og_image')->nullable();
            $table->string('schema_type', 50)->default('Article');
            $table->unsignedTinyInteger('seo_score')->default(70);

            // GEO Optimizer Fields
            $table->string('geo_target_country', 10)->default('ALL'); // ISO 2-letter, e.g. ID, US, GB, ALL
            $table->string('geo_region', 50)->nullable(); // e.g. ID-JK, US-CA
            $table->string('geo_placename', 100)->nullable(); // e.g. Jakarta, Tokyo
            $table->decimal('geo_latitude', 10, 7)->nullable();
            $table->decimal('geo_longitude', 10, 7)->nullable();
            $table->string('geo_hreflang_code', 15)->default('id-ID'); // e.g. id-ID, en-US

            $table->timestamps();
        });

        Schema::create('post_tag', function (Blueprint $table) {
            $table->id();
            $table->foreignId('post_id')->constrained()->cascadeOnDelete();
            $table->foreignId('tag_id')->constrained()->cascadeOnDelete();
            $table->unique(['post_id', 'tag_id']);
        });

        Schema::create('comments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('post_id')->constrained()->cascadeOnDelete();
            $table->foreignId('parent_id')->nullable()->constrained('comments')->cascadeOnDelete();
            $table->string('author_name');
            $table->string('author_email');
            $table->string('author_website')->nullable();
            $table->text('content');
            $table->string('status', 20)->default('approved'); // approved, pending, spam
            $table->timestamps();
        });

        Schema::create('page_visits', function (Blueprint $table) {
            $table->id();
            $table->foreignId('post_id')->nullable()->constrained()->nullOnDelete();
            $table->string('url');
            $table->string('ip_address', 45)->nullable();
            $table->string('session_id', 100)->nullable();
            $table->text('user_agent')->nullable();

            // Geo tracking
            $table->string('country_code', 10)->nullable()->index();
            $table->string('country_name', 100)->nullable();
            $table->string('city', 100)->nullable();
            $table->string('region', 100)->nullable();
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();

            // Client info
            $table->string('device_type', 30)->default('desktop'); // desktop, mobile, tablet
            $table->string('browser', 50)->nullable();
            $table->string('os', 50)->nullable();

            // Referrer & SEO Bot tracking
            $table->text('referrer')->nullable();
            $table->string('referrer_domain', 150)->nullable();
            $table->boolean('is_bot')->default(false)->index();
            $table->string('bot_name', 60)->nullable()->index();
            $table->boolean('is_unique')->default(true);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('page_visits');
        Schema::dropIfExists('comments');
        Schema::dropIfExists('post_tag');
        Schema::dropIfExists('posts');
        Schema::dropIfExists('tags');
        Schema::dropIfExists('categories');
    }
};
