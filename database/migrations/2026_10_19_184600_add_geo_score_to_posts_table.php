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
        if (! Schema::hasColumn('posts', 'geo_score')) {
            Schema::table('posts', function (Blueprint $table) {
                $table->unsignedTinyInteger('geo_score')->default(75)->after('seo_score');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasColumn('posts', 'geo_score')) {
            Schema::table('posts', function (Blueprint $table) {
                $table->dropColumn('geo_score');
            });
        }
    }
};
