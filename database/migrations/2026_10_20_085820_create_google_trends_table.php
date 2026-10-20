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
        Schema::create('google_trends', function (Blueprint $table) {
            $table->id();
            $table->string('geo', 10)->index();
            $table->string('query');
            $table->string('approx_traffic')->nullable();
            $table->text('description')->nullable();
            $table->text('picture_url')->nullable();
            $table->text('news_title')->nullable();
            $table->text('news_url')->nullable();
            $table->string('news_source')->nullable();
            $table->timestamp('published_at')->nullable();
            $table->timestamp('fetched_at')->index();
            $table->timestamps();

            $table->index(['geo', 'fetched_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('google_trends');
    }
};
