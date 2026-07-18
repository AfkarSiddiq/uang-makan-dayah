<?php

namespace Tests\Feature\Siswa;

use App\Models\Role;
use App\Models\Student;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SiswaTest extends TestCase
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

    public function test_guests_are_redirected_to_login_when_accessing_siswa_index()
    {
        $this->get(route('siswa.index'))->assertRedirect(route('login'));
    }

    public function test_guests_are_redirected_to_login_when_accessing_siswa_create()
    {
        $this->get(route('siswa.create'))->assertRedirect(route('login'));
    }

    public function test_guests_cannot_store_siswa()
    {
        $this->post(route('siswa.store'), [])->assertRedirect(route('login'));
    }

    public function test_guests_are_redirected_to_login_when_accessing_siswa_edit()
    {
        $student = Student::factory()->create();

        $this->get(route('siswa.edit', $student->id))->assertRedirect(route('login'));
    }

    public function test_guests_cannot_update_siswa()
    {
        $student = Student::factory()->create();

        $this->put(route('siswa.update', $student->id), [])->assertRedirect(route('login'));
    }

    public function test_guests_cannot_delete_siswa()
    {
        $student = Student::factory()->create();

        $this->delete(route('siswa.destroy', $student->id))->assertRedirect(route('login'));
    }

    // =========================================================================
    // Page Rendering
    // =========================================================================

    public function test_admin_can_view_siswa_index()
    {
        $admin = $this->createAdminUser();
        Student::factory()->count(3)->create();

        $this->actingAs($admin)
            ->get(route('siswa.index'))
            ->assertOk();
    }

    public function test_admin_can_view_siswa_create_page()
    {
        $admin = $this->createAdminUser();

        $this->actingAs($admin)
            ->get(route('siswa.create'))
            ->assertOk();
    }

    public function test_admin_can_view_siswa_edit_page()
    {
        $admin = $this->createAdminUser();
        $student = Student::factory()->create();

        $this->actingAs($admin)
            ->get(route('siswa.edit', $student->id))
            ->assertOk();
    }

    // =========================================================================
    // Store
    // =========================================================================

    public function test_admin_can_create_siswa()
    {
        $admin = $this->createAdminUser();

        $response = $this->actingAs($admin)->post(route('siswa.store'), [
            'nisn' => '001234567890',
            'name' => 'Ahmad Santri',
            'gender' => 'L',
            'class' => '1',
            'entry_month' => 7,
            'entry_year' => 2025,
        ]);

        $response->assertRedirect(route('siswa.index'));

        $this->assertDatabaseHas('students', [
            'nisn' => '001234567890',
            'name' => 'Ahmad Santri',
            'gender' => 'L',
            'class' => '1',
            'status' => 'aktif',
            'student_type' => 'umum',
            'entry_month' => 7,
            'entry_year' => 2025,
            'exit_month' => null,
            'exit_year' => null,
        ]);
    }

    public function test_admin_can_create_siswa_with_exit_fields()
    {
        $admin = $this->createAdminUser();

        $response = $this->actingAs($admin)->post(route('siswa.store'), [
            'nisn' => '001234567891',
            'name' => 'Pindah Santri',
            'gender' => 'P',
            'class' => '3',
            'status' => 'pindah',
            'entry_month' => 1,
            'entry_year' => 2024,
            'exit_month' => 6,
            'exit_year' => 2026,
        ]);

        $response->assertRedirect(route('siswa.index'));

        $this->assertDatabaseHas('students', [
            'nisn' => '001234567891',
            'status' => 'pindah',
            'exit_month' => 6,
            'exit_year' => 2026,
        ]);
    }

    // =========================================================================
    // Update
    // =========================================================================

    public function test_admin_can_update_siswa()
    {
        $admin = $this->createAdminUser();
        $student = Student::factory()->create([
            'name' => 'Original Name',
            'nisn' => '001234567890',
            'gender' => 'L',
        ]);

        $response = $this->actingAs($admin)->put(route('siswa.update', $student->id), [
            'nisn' => '009999999999',
            'name' => 'Updated Name',
            'gender' => 'L',
            'status' => 'aktif',
            'entry_month' => 1,
            'entry_year' => 2025,
        ]);

        $response->assertRedirect(route('santriwan.show', $student->id));

        $this->assertDatabaseHas('students', [
            'id' => $student->id,
            'name' => 'Updated Name',
            'nisn' => '009999999999',
        ]);
    }

    // =========================================================================
    // Delete
    // =========================================================================

    public function test_admin_can_delete_siswa()
    {
        $admin = $this->createAdminUser();
        $student = Student::factory()->create();

        $response = $this->actingAs($admin)->delete(route('siswa.destroy', $student->id));

        $response->assertRedirect(route('siswa.index'));

        $this->assertDatabaseMissing('students', ['id' => $student->id]);
    }

    // =========================================================================
    // Validation
    // =========================================================================

    public function test_store_validates_required_fields()
    {
        $admin = $this->createAdminUser();

        $response = $this->actingAs($admin)->post(route('siswa.store'), []);

        $response->assertSessionHasErrors(['nisn', 'name', 'gender', 'entry_month', 'entry_year']);
    }

    public function test_store_validates_unique_nisn()
    {
        $admin = $this->createAdminUser();
        Student::factory()->create(['nisn' => '001234567890']);

        $response = $this->actingAs($admin)->post(route('siswa.store'), [
            'nisn' => '001234567890',
            'name' => 'Duplicate NISN',
            'gender' => 'L',
            'entry_month' => 1,
            'entry_year' => 2026,
        ]);

        $response->assertSessionHasErrors(['nisn']);
    }

    public function test_store_validates_exit_not_before_entry()
    {
        $admin = $this->createAdminUser();

        $response = $this->actingAs($admin)->post(route('siswa.store'), [
            'nisn' => '001234567890',
            'name' => 'Invalid Exit',
            'gender' => 'L',
            'status' => 'pindah',
            'entry_month' => 6,
            'entry_year' => 2026,
            'exit_month' => 1,
            'exit_year' => 2025,
        ]);

        $response->assertSessionHasErrors(['exit_month', 'exit_year']);
    }
}
