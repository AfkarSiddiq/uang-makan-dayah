<?php

namespace Tests\Feature\User;

use App\Models\Role;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class UserTest extends TestCase
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

    public function test_guests_are_redirected_to_login_when_accessing_users_index()
    {
        $this->get(route('users.index'))->assertRedirect(route('login'));
    }

    public function test_guests_cannot_store_user()
    {
        $this->post(route('users.store'), [])->assertRedirect(route('login'));
    }

    public function test_guests_cannot_update_user()
    {
        $user = User::factory()->create();

        $this->patch(route('users.update', $user), [])->assertRedirect(route('login'));
    }

    public function test_guests_cannot_delete_user()
    {
        $user = User::factory()->create();

        $this->delete(route('users.destroy', $user))->assertRedirect(route('login'));
    }

    // =========================================================================
    // Page Rendering
    // =========================================================================

    public function test_admin_can_view_users_index()
    {
        $admin = $this->createAdminUser();
        User::factory()->count(3)->create();

        $this->actingAs($admin)
            ->get(route('users.index'))
            ->assertOk();
    }

    public function test_admin_can_view_users_create_page()
    {
        $admin = $this->createAdminUser();

        $this->actingAs($admin)
            ->get(route('users.create'))
            ->assertOk();
    }

    public function test_admin_can_view_users_edit_page()
    {
        $admin = $this->createAdminUser();
        $user = User::factory()->create();

        $this->actingAs($admin)
            ->get(route('users.edit', $user))
            ->assertOk();
    }

    // =========================================================================
    // Store
    // =========================================================================

    public function test_admin_can_create_user()
    {
        $admin = $this->createAdminUser();
        $role = Role::where('name', 'bendahara')->first();

        $response = $this->actingAs($admin)->post(route('users.store'), [
            'name' => 'New User',
            'email' => 'newuser@test.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'roles' => [$role->id],
        ]);

        $response->assertRedirect(route('users.index'));

        $this->assertDatabaseHas('users', [
            'name' => 'New User',
            'email' => 'newuser@test.com',
        ]);
    }

    public function test_admin_can_create_user_with_roles()
    {
        $admin = $this->createAdminUser();
        $role = Role::where('name', 'bendahara')->first();

        $response = $this->actingAs($admin)->post(route('users.store'), [
            'name' => 'User With Role',
            'email' => 'withrole@test.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'roles' => [$role->id],
        ]);

        $response->assertRedirect(route('users.index'));

        $user = User::where('email', 'withrole@test.com')->first();

        $this->assertDatabaseHas('role_user', [
            'user_id' => $user->id,
            'role_id' => $role->id,
        ]);
    }

    // =========================================================================
    // Update
    // =========================================================================

    public function test_admin_can_update_user()
    {
        $admin = $this->createAdminUser();
        $role = Role::where('name', 'bendahara')->first();
        $user = User::factory()->create([
            'name' => 'Original Name',
            'email' => 'original@test.com',
        ]);

        $response = $this->actingAs($admin)->patch(route('users.update', $user), [
            'name' => 'Updated Name',
            'email' => 'updated@test.com',
            'roles' => [$role->id],
        ]);

        $response->assertRedirect(route('users.index'));

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'name' => 'Updated Name',
            'email' => 'updated@test.com',
        ]);
    }

    public function test_admin_can_update_user_with_password()
    {
        $admin = $this->createAdminUser();
        $role = Role::where('name', 'bendahara')->first();
        $user = User::factory()->create([
            'password' => Hash::make('oldpassword'),
        ]);

        $response = $this->actingAs($admin)->patch(route('users.update', $user), [
            'name' => $user->name,
            'email' => $user->email,
            'password' => 'newpassword123',
            'password_confirmation' => 'newpassword123',
            'roles' => [$role->id],
        ]);

        $response->assertRedirect(route('users.index'));

        $user->refresh();
        $this->assertTrue(Hash::check('newpassword123', $user->password));
    }

    // =========================================================================
    // Delete
    // =========================================================================

    public function test_admin_can_delete_other_user()
    {
        $admin = $this->createAdminUser();
        $user = User::factory()->create();

        $response = $this->actingAs($admin)->delete(route('users.destroy', $user));

        $response->assertRedirect(route('users.index'));

        $this->assertDatabaseMissing('users', ['id' => $user->id]);
    }

    public function test_admin_cannot_delete_self()
    {
        $admin = $this->createAdminUser();

        $response = $this->from(route('users.index'))
            ->actingAs($admin)
            ->delete(route('users.destroy', $admin));

        $response->assertSessionHas('error', 'Anda tidak dapat menghapus akun sendiri!');

        $this->assertDatabaseHas('users', ['id' => $admin->id]);
    }

    // =========================================================================
    // Validation
    // =========================================================================

    public function test_store_validates_required_fields()
    {
        $admin = $this->createAdminUser();

        $response = $this->actingAs($admin)->post(route('users.store'), []);

        $response->assertSessionHasErrors(['name', 'email', 'password']);
    }

    public function test_store_validates_unique_email()
    {
        $admin = $this->createAdminUser();
        User::factory()->create(['email' => 'existing@test.com']);

        $response = $this->actingAs($admin)->post(route('users.store'), [
            'name' => 'Test',
            'email' => 'existing@test.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertSessionHasErrors(['email']);
    }
}
