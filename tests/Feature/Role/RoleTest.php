<?php

namespace Tests\Feature\Role;

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RoleTest extends TestCase
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

    public function test_guests_are_redirected_to_login_when_accessing_role_index()
    {
        $this->get(route('role.index'))->assertRedirect(route('login'));
    }

    public function test_guests_cannot_store_role()
    {
        $this->post(route('role.store'), [])->assertRedirect(route('login'));
    }

    public function test_guests_cannot_update_role()
    {
        $this->seed(RolePermissionSeeder::class);

        $role = Role::first();

        $this->patch(route('role.update', $role), [])->assertRedirect(route('login'));
    }

    public function test_guests_cannot_delete_role()
    {
        $this->seed(RolePermissionSeeder::class);

        $role = Role::first();

        $this->delete(route('role.destroy', $role))->assertRedirect(route('login'));
    }

    // =========================================================================
    // Page Rendering
    // =========================================================================

    public function test_admin_can_view_role_index()
    {
        $admin = $this->createAdminUser();

        $this->actingAs($admin)
            ->get(route('role.index'))
            ->assertOk();
    }

    public function test_admin_can_view_role_create_page()
    {
        $admin = $this->createAdminUser();

        $this->actingAs($admin)
            ->get(route('role.create'))
            ->assertOk();
    }

    public function test_admin_can_view_role_edit_page()
    {
        $admin = $this->createAdminUser();
        $role = Role::where('name', 'bendahara')->first();

        $this->actingAs($admin)
            ->get(route('role.edit', $role))
            ->assertOk();
    }

    // =========================================================================
    // Store
    // =========================================================================

    public function test_admin_can_create_role()
    {
        $admin = $this->createAdminUser();

        $response = $this->actingAs($admin)->post(route('role.store'), [
            'name' => 'custom-role',
            'display_name' => 'Custom Role',
            'description' => 'A custom test role',
        ]);

        $response->assertRedirect(route('role.index'));

        $this->assertDatabaseHas('roles', [
            'name' => 'custom-role',
            'display_name' => 'Custom Role',
            'description' => 'A custom test role',
            'is_default' => false,
        ]);
    }

    public function test_admin_can_create_role_with_permissions()
    {
        $admin = $this->createAdminUser();

        $permissionIds = Permission::whereIn('name', [
            'dashboard.view',
            'pembayaran.masuk.view',
            'pembayaran.keluar.view',
        ])->pluck('id')->toArray();

        $response = $this->actingAs($admin)->post(route('role.store'), [
            'name' => 'limited-role',
            'display_name' => 'Limited Role',
            'permissions' => $permissionIds,
        ]);

        $response->assertRedirect(route('role.index'));

        $role = Role::where('name', 'limited-role')->first();

        foreach ($permissionIds as $permissionId) {
            $this->assertDatabaseHas('role_permission', [
                'role_id' => $role->id,
                'permission_id' => $permissionId,
            ]);
        }
    }

    // =========================================================================
    // Update
    // =========================================================================

    public function test_admin_can_update_role()
    {
        $admin = $this->createAdminUser();
        $role = Role::where('name', 'umum')->first();

        $permissionId = Permission::where('name', 'dashboard.view')->first()->id;

        $response = $this->actingAs($admin)->patch(route('role.update', $role), [
            'name' => 'umum',
            'display_name' => 'Umum Updated',
            'description' => 'Updated description',
            'permissions' => [$permissionId],
        ]);

        $response->assertRedirect(route('role.index'));

        $this->assertDatabaseHas('roles', [
            'id' => $role->id,
            'display_name' => 'Umum Updated',
            'description' => 'Updated description',
        ]);

        $this->assertDatabaseHas('role_permission', [
            'role_id' => $role->id,
            'permission_id' => $permissionId,
        ]);
    }

    // =========================================================================
    // Delete
    // =========================================================================

    public function test_admin_can_delete_role_without_users()
    {
        $admin = $this->createAdminUser();
        $role = Role::create([
            'name' => 'temp-role',
            'display_name' => 'Temporary Role',
        ]);

        $response = $this->actingAs($admin)->delete(route('role.destroy', $role));

        $response->assertRedirect(route('role.index'));

        $this->assertDatabaseMissing('roles', ['id' => $role->id]);
    }

    public function test_admin_cannot_delete_role_with_users()
    {
        $admin = $this->createAdminUser();
        $role = Role::where('name', 'bendahara')->first();
        $user = User::factory()->create();
        $user->roles()->attach($role->id);

        $response = $this->from(route('role.index'))
            ->actingAs($admin)
            ->delete(route('role.destroy', $role));

        $response->assertSessionHas('error', 'Role tidak dapat dihapus karena masih digunakan oleh pengguna!');

        $this->assertDatabaseHas('roles', ['id' => $role->id]);
    }

    // =========================================================================
    // Validation
    // =========================================================================

    public function test_store_validates_required_fields()
    {
        $admin = $this->createAdminUser();

        $response = $this->actingAs($admin)->post(route('role.store'), []);

        $response->assertSessionHasErrors(['name', 'display_name']);
    }

    public function test_store_validates_unique_name()
    {
        $admin = $this->createAdminUser();

        $response = $this->actingAs($admin)->post(route('role.store'), [
            'name' => 'admin',
            'display_name' => 'Duplicate Admin',
        ]);

        $response->assertSessionHasErrors(['name']);
    }
}
