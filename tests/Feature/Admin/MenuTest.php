<?php

use App\Models\Menu;
use App\Models\MenuItem;
use App\Models\User;

test('guests are redirected from menu editor', function () {
    $response = $this->get('/admin/menus');
    $response->assertRedirect('/login');
});

test('authenticated user can view menu editor', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $response = $this->get('/admin/menus');
    $response->assertOk();
    $response->assertInertia(fn ($page) => $page->component('admin/menus/index'));
});

test('admin can batch save menu items', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $menu = Menu::firstOrCreate(['location' => 'header'], ['name' => 'Header Primary Menu']);

    $response = $this->post('/admin/menus/save', [
        'menu_id' => $menu->id,
        'name' => 'Custom Kelana Header',
        'items' => [
            [
                'title' => 'Home Base',
                'url' => '/',
                'target' => '_self',
                'type' => 'custom',
                'order' => 1,
            ],
            [
                'title' => 'Sumatra Trails',
                'url' => '/category/sumatra',
                'target' => '_blank',
                'type' => 'category',
                'order' => 2,
            ],
        ],
    ]);

    $response->assertSessionHas('success');
    expect($menu->fresh()->name)->toBe('Custom Kelana Header');
    expect(MenuItem::where('menu_id', $menu->id)->count())->toBe(2);
    expect(MenuItem::where('menu_id', $menu->id)->where('title', 'Home Base')->exists())->toBeTrue();
});

test('admin can reset menu items to default', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $menu = Menu::firstOrCreate(['location' => 'header'], ['name' => 'Header Primary Menu']);

    $response = $this->post('/admin/menus/reset');
    $response->assertSessionHas('success');

    expect(MenuItem::where('menu_id', $menu->id)->count())->toBe(5);
});
