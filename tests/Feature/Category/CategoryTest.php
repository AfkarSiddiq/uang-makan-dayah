<?php

namespace Tests\Feature\Category;

use App\Models\Category;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CategoryTest extends TestCase
{
    use RefreshDatabase;

    private function createAdminUser(): User
    {
        $this->seed(RolePermissionSeeder::class);

        $user = User::factory()->create();
        $user->roles()->attach(Role::where('name', 'admin')->first());

        return $user;
    }

    // =========================================================================
    // Guest Access
    // =========================================================================

    public function test_guests_are_redirected_to_login_when_accessing_category_index()
    {
        $this->get(route('category.index'))->assertRedirect(route('login'));
    }

    public function test_guests_cannot_store_category()
    {
        $this->post(route('category.store'), [])->assertRedirect(route('login'));
    }

    public function test_guests_cannot_update_category()
    {
        $category = Category::create([
            'name' => 'Test',
            'type' => 'in',
        ]);

        $this->patch(route('category.update', $category), [])->assertRedirect(route('login'));
    }

    public function test_guests_cannot_delete_category()
    {
        $category = Category::create([
            'name' => 'Test',
            'type' => 'in',
        ]);

        $this->delete(route('category.destroy', $category))->assertRedirect(route('login'));
    }

    // =========================================================================
    // Page Rendering
    // =========================================================================

    public function test_admin_can_view_category_index()
    {
        $admin = $this->createAdminUser();
        Category::create(['name' => 'SPP', 'type' => 'in', 'is_active' => true]);
        Category::create(['name' => 'Listrik', 'type' => 'out', 'is_active' => true]);

        $this->actingAs($admin)
            ->get(route('category.index'))
            ->assertOk();
    }

    // =========================================================================
    // Store
    // =========================================================================

    public function test_admin_can_create_category()
    {
        $admin = $this->createAdminUser();

        $response = $this->actingAs($admin)->post(route('category.store'), [
            'name' => 'Uang Pangkal',
            'type' => 'in',
        ]);

        $response->assertSessionHas('success', 'Kategori berhasil ditambahkan.');

        $this->assertDatabaseHas('categories', [
            'name' => 'Uang Pangkal',
            'type' => 'in',
            'is_active' => true,
        ]);
    }

    public function test_admin_can_create_category_with_type_both()
    {
        $admin = $this->createAdminUser();

        $response = $this->actingAs($admin)->post(route('category.store'), [
            'name' => 'Donasi',
            'type' => 'both',
        ]);

        $response->assertSessionHas('success');

        $this->assertDatabaseHas('categories', [
            'name' => 'Donasi',
            'type' => 'both',
        ]);
    }

    // =========================================================================
    // Update
    // =========================================================================

    public function test_admin_can_update_category()
    {
        $admin = $this->createAdminUser();
        $category = Category::create([
            'name' => 'Old Name',
            'type' => 'in',
            'is_active' => true,
        ]);

        $response = $this->actingAs($admin)->put(route('category.update', $category), [
            'name' => 'New Name',
            'type' => 'out',
        ]);

        $response->assertSessionHas('success', 'Kategori berhasil diperbarui.');

        $this->assertDatabaseHas('categories', [
            'id' => $category->id,
            'name' => 'New Name',
            'type' => 'out',
        ]);
    }

    // =========================================================================
    // Delete (Soft Delete: is_active = false)
    // =========================================================================

    public function test_admin_can_delete_category()
    {
        $admin = $this->createAdminUser();
        $category = Category::create([
            'name' => 'To Delete',
            'type' => 'in',
            'is_active' => true,
        ]);

        $response = $this->actingAs($admin)->delete(route('category.destroy', $category));

        $response->assertSessionHas('success', 'Kategori berhasil dihapus.');

        $this->assertDatabaseHas('categories', [
            'id' => $category->id,
            'is_active' => false,
        ]);
    }

    // =========================================================================
    // Validation
    // =========================================================================

    public function test_store_validates_required_fields()
    {
        $admin = $this->createAdminUser();

        $response = $this->actingAs($admin)->post(route('category.store'), []);

        $response->assertSessionHasErrors(['name', 'type']);
    }

    public function test_store_validates_type_must_be_valid()
    {
        $admin = $this->createAdminUser();

        $response = $this->actingAs($admin)->post(route('category.store'), [
            'name' => 'Invalid',
            'type' => 'invalid-type',
        ]);

        $response->assertSessionHasErrors(['type']);
    }
}
