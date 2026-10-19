<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('menus', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('location')->unique(); // 'header', 'footer'
            $table->timestamps();
        });

        Schema::create('menu_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('menu_id')->constrained()->cascadeOnDelete();
            $table->foreignId('parent_id')->nullable()->constrained('menu_items')->cascadeOnDelete();
            $table->string('title');
            $table->string('url');
            $table->string('target', 20)->default('_self');
            $table->string('type', 30)->default('custom'); // custom, category, post
            $table->unsignedBigInteger('type_id')->nullable();
            $table->integer('order')->default(0);
            $table->timestamps();
        });

        // Seed default header menu and items
        $menuId = DB::table('menus')->insertGetId([
            'name' => 'Header Primary Menu',
            'location' => 'header',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $defaultItems = [
            ['title' => 'Home', 'url' => '/', 'order' => 1],
            ['title' => 'Destinations', 'url' => '#popular-categories', 'order' => 2],
            ['title' => 'Route Guides', 'url' => '#articles-feed', 'order' => 3],
            ['title' => 'Stories', 'url' => '#articles-feed', 'order' => 4],
            ['title' => 'About Us', 'url' => '#about-club', 'order' => 5],
        ];

        foreach ($defaultItems as $item) {
            DB::table('menu_items')->insert([
                'menu_id' => $menuId,
                'title' => $item['title'],
                'url' => $item['url'],
                'target' => '_self',
                'type' => 'custom',
                'order' => $item['order'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('menu_items');
        Schema::dropIfExists('menus');
    }
};
