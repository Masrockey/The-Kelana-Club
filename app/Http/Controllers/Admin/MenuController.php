<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Menu;
use App\Models\MenuItem;
use App\Models\Post;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MenuController extends Controller
{
    /**
     * Display the WordPress-style menu editor.
     */
    public function index(Request $request): Response
    {
        $menu = Menu::with(['items' => function ($q) {
            $q->orderBy('order');
        }])->firstOrCreate(
            ['location' => 'header'],
            ['name' => 'Header Primary Navigation']
        );

        $categories = Category::select('id', 'name', 'slug')->get();
        $posts = Post::published()->select('id', 'title', 'slug')->latest()->take(20)->get();

        return Inertia::render('admin/menus/index', [
            'menu' => $menu,
            'items' => $menu->items,
            'categories' => $categories,
            'posts' => $posts,
        ]);
    }

    /**
     * Batch save menu items (like WordPress "Save Menu").
     */
    public function save(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'menu_id' => 'required|exists:menus,id',
            'name' => 'required|string|max:100',
            'items' => 'present|array',
            'items.*.id' => 'nullable',
            'items.*.title' => 'required|string|max:100',
            'items.*.url' => 'required|string|max:255',
            'items.*.target' => 'nullable|string|in:_self,_blank',
            'items.*.type' => 'nullable|string|max:30',
            'items.*.type_id' => 'nullable|integer',
            'items.*.order' => 'required|integer',
        ]);

        $menu = Menu::findOrFail($validated['menu_id']);
        $menu->update(['name' => $validated['name']]);

        $itemIdsToKeep = [];

        foreach ($validated['items'] as $index => $itemData) {
            $itemId = $itemData['id'] ?? null;

            if ($itemId && is_numeric($itemId)) {
                $existingItem = MenuItem::where('menu_id', $menu->id)->where('id', $itemId)->first();
                if ($existingItem) {
                    $existingItem->update([
                        'title' => $itemData['title'],
                        'url' => $itemData['url'],
                        'target' => $itemData['target'] ?? '_self',
                        'type' => $itemData['type'] ?? 'custom',
                        'type_id' => $itemData['type_id'] ?? null,
                        'order' => $index + 1,
                    ]);
                    $itemIdsToKeep[] = $existingItem->id;

                    continue;
                }
            }

            // Create new menu item
            $newItem = MenuItem::create([
                'menu_id' => $menu->id,
                'title' => $itemData['title'],
                'url' => $itemData['url'],
                'target' => $itemData['target'] ?? '_self',
                'type' => $itemData['type'] ?? 'custom',
                'type_id' => $itemData['type_id'] ?? null,
                'order' => $index + 1,
            ]);
            $itemIdsToKeep[] = $newItem->id;
        }

        // Delete removed items
        MenuItem::where('menu_id', $menu->id)
            ->whereNotIn('id', $itemIdsToKeep)
            ->delete();

        return back()->with('success', 'Menu structure updated successfully.');
    }

    /**
     * Reset menu to default items.
     */
    public function reset(Request $request): RedirectResponse
    {
        $menu = Menu::where('location', 'header')->firstOrFail();
        $menu->items()->delete();

        $defaultItems = [
            ['title' => 'Home', 'url' => '/', 'order' => 1],
            ['title' => 'Destinations', 'url' => '#popular-categories', 'order' => 2],
            ['title' => 'Route Guides', 'url' => '#articles-feed', 'order' => 3],
            ['title' => 'Stories', 'url' => '#articles-feed', 'order' => 4],
            ['title' => 'About Us', 'url' => '#about-club', 'order' => 5],
        ];

        foreach ($defaultItems as $item) {
            MenuItem::create([
                'menu_id' => $menu->id,
                'title' => $item['title'],
                'url' => $item['url'],
                'target' => '_self',
                'type' => 'custom',
                'order' => $item['order'],
            ]);
        }

        return back()->with('success', 'Menu reset to default Kelana Club links.');
    }
}
