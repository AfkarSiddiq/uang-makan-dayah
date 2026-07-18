<?php

namespace Tests\Feature\Payment;

use App\Models\Category;
use App\Models\Role;
use App\Models\SppMonth;
use App\Models\Student;
use App\Models\Transaction;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PaymentTest extends TestCase
{
    use RefreshDatabase;

    private function createAdminUser(): User
    {
        $this->seed(RolePermissionSeeder::class);

        $user = User::factory()->create();
        $user->roles()->attach(Role::where('name', 'admin')->first());

        return $user;
    }

    private function createUserWithoutPermissions(): User
    {
        $this->seed(RolePermissionSeeder::class);

        return User::factory()->create();
    }

    // =========================================================================
    // Guest Access
    // =========================================================================

    public function test_guests_are_redirected_to_login_when_accessing_payment_index()
    {
        $this->get(route('payment.index'))->assertRedirect(route('login'));
    }

    public function test_guests_cannot_store_payment()
    {
        $this->post(route('payment.store'), [])->assertRedirect(route('login'));
    }

    public function test_guests_cannot_update_payment()
    {
        $transaction = Transaction::factory()->create();

        $this->patch(route('payment.update', $transaction))->assertRedirect(route('login'));
    }

    public function test_guests_cannot_delete_payment()
    {
        $transaction = Transaction::factory()->create();

        $this->delete(route('payment.destroy', $transaction))->assertRedirect(route('login'));
    }

    public function test_guests_cannot_print_payment()
    {
        $transaction = Transaction::factory()->create();

        $this->get(route('payment.print', $transaction))->assertRedirect(route('login'));
    }

    // =========================================================================
    // Permission Denied (User without roles)
    // =========================================================================

    public function test_user_without_permission_cannot_view_payment_index()
    {
        $user = $this->createUserWithoutPermissions();

        $this->actingAs($user)
            ->get(route('payment.index'))
            ->assertForbidden();
    }

    public function test_user_without_permission_cannot_view_payment_create()
    {
        $user = $this->createUserWithoutPermissions();

        $this->actingAs($user)
            ->get(route('payment.create'))
            ->assertForbidden();
    }

    public function test_user_without_permission_cannot_store_payment()
    {
        $user = $this->createUserWithoutPermissions();

        $this->actingAs($user)
            ->post(route('payment.store'), [
                'type' => 'in',
                'category' => 'SPP',
                'amount' => 100000,
                'transaction_date' => '2026-07-14',
            ])
            ->assertForbidden();
    }

    public function test_user_without_permission_cannot_view_payment_edit()
    {
        $user = $this->createUserWithoutPermissions();
        $transaction = Transaction::factory()->create();

        $this->actingAs($user)
            ->get(route('payment.edit', $transaction))
            ->assertForbidden();
    }

    public function test_user_without_permission_cannot_update_payment()
    {
        $user = $this->createUserWithoutPermissions();
        $transaction = Transaction::factory()->create();

        $this->actingAs($user)
            ->patch(route('payment.update', $transaction), [
                'type' => 'in',
                'category' => 'SPP',
                'amount' => 100000,
                'transaction_date' => '2026-07-14',
            ])
            ->assertForbidden();
    }

    public function test_user_without_permission_cannot_delete_payment()
    {
        $user = $this->createUserWithoutPermissions();
        $transaction = Transaction::factory()->create();

        $this->actingAs($user)
            ->delete(route('payment.destroy', $transaction))
            ->assertForbidden();
    }

    public function test_user_without_permission_cannot_print_payment()
    {
        $user = $this->createUserWithoutPermissions();
        $transaction = Transaction::factory()->create();

        $this->actingAs($user)
            ->get(route('payment.print', $transaction))
            ->assertForbidden();
    }

    public function test_admin_can_view_payment_index()
    {
        $user = $this->createAdminUser();
        Transaction::factory()->count(3)->create(['user_id' => $user->id]);

        $this->actingAs($user)
            ->get(route('payment.index'))
            ->assertOk();
    }

    // =========================================================================
    // Create Page
    // =========================================================================

    public function test_admin_can_view_payment_create_page()
    {
        $user = $this->createAdminUser();
        Student::factory()->count(3)->create();

        $this->actingAs($user)
            ->get(route('payment.create'))
            ->assertOk();
    }

    // =========================================================================
    // Edit Page
    // =========================================================================

    public function test_admin_can_view_payment_edit_page()
    {
        $user = $this->createAdminUser();
        $transaction = Transaction::factory()->create(['user_id' => $user->id]);

        $this->actingAs($user)
            ->get(route('payment.edit', $transaction))
            ->assertOk();
    }

    // =========================================================================
    // Store
    // =========================================================================

    public function test_admin_can_create_in_transaction()
    {
        $user = $this->createAdminUser();

        $response = $this->actingAs($user)->post(route('payment.store'), [
            'type' => 'in',
            'category' => 'Uang Pangkal',
            'amount' => 100000,
            'transaction_date' => '2026-07-14',
            'note' => 'Test pemasukan',
        ]);

        $response->assertRedirect(route('payment.index'));

        $this->assertDatabaseHas('transactions', [
            'type' => 'in',
            'category' => 'Uang Pangkal',
            'amount' => 100000,
            'note' => 'Test pemasukan',
            'user_id' => $user->id,
        ]);
    }

    public function test_admin_can_create_out_transaction()
    {
        $user = $this->createAdminUser();

        $response = $this->actingAs($user)->post(route('payment.store'), [
            'type' => 'out',
            'category' => 'Listrik',
            'amount' => 50000,
            'transaction_date' => '2026-07-14',
            'note' => 'Test pengeluaran',
        ]);

        $response->assertRedirect(route('payment.index'));

        $this->assertDatabaseHas('transactions', [
            'type' => 'out',
            'category' => 'Listrik',
            'amount' => 50000,
            'note' => 'Test pengeluaran',
        ]);
    }

    // =========================================================================
    // Update
    // =========================================================================

    public function test_admin_can_update_transaction()
    {
        $user = $this->createAdminUser();
        $transaction = Transaction::factory()->create([
            'type' => 'in',
            'category' => 'SPP',
            'amount' => 50000,
            'user_id' => $user->id,
        ]);

        $response = $this->actingAs($user)->patch(route('payment.update', $transaction), [
            'type' => 'in',
            'category' => 'Uang Pangkal',
            'amount' => 75000,
            'transaction_date' => '2026-07-14',
        ]);

        $response->assertRedirect(route('payment.index'));

        $this->assertDatabaseHas('transactions', [
            'id' => $transaction->id,
            'category' => 'Uang Pangkal',
            'amount' => 75000,
        ]);
    }

    // =========================================================================
    // Delete
    // =========================================================================

    public function test_admin_can_delete_transaction()
    {
        $user = $this->createAdminUser();
        $transaction = Transaction::factory()->create(['user_id' => $user->id]);

        $response = $this->actingAs($user)->delete(route('payment.destroy', $transaction));

        $response->assertRedirect(route('payment.index'));

        $this->assertDatabaseMissing('transactions', ['id' => $transaction->id]);
    }

    // =========================================================================
    // Validation
    // =========================================================================

    public function test_store_validates_required_fields()
    {
        $user = $this->createAdminUser();

        $response = $this->actingAs($user)->post(route('payment.store'), []);

        $response->assertSessionHasErrors(['type', 'category', 'amount', 'transaction_date']);
    }

    public function test_store_requires_student_id_for_spp_category()
    {
        $user = $this->createAdminUser();

        $response = $this->actingAs($user)->post(route('payment.store'), [
            'type' => 'in',
            'category' => 'SPP',
            'amount' => 100000,
            'transaction_date' => '2026-07-14',
        ]);

        $response->assertSessionHasErrors(['student_id']);
    }

    public function test_update_validates_required_fields()
    {
        $user = $this->createAdminUser();
        $transaction = Transaction::factory()->create(['user_id' => $user->id]);

        $response = $this->actingAs($user)->patch(route('payment.update', $transaction), []);

        $response->assertSessionHasErrors(['type', 'category', 'amount', 'transaction_date']);
    }

    // =========================================================================
    // SPP Allocation
    // =========================================================================

    public function test_spp_transaction_creates_spp_payments()
    {
        $user = $this->createAdminUser();

        $student = Student::factory()->create([
            'entry_month' => 1,
            'entry_year' => 2026,
        ]);

        $sppMonth1 = SppMonth::create(['month' => 1, 'year' => 2026, 'amount' => 100000]);
        $sppMonth2 = SppMonth::create(['month' => 2, 'year' => 2026, 'amount' => 100000]);

        $response = $this->actingAs($user)->post(route('payment.store'), [
            'type' => 'in',
            'category' => 'SPP',
            'amount' => 200000,
            'student_id' => $student->id,
            'transaction_date' => '2026-01-15',
            'note' => 'Bayar SPP 2 bulan',
        ]);

        $response->assertRedirect(route('payment.index'));

        $this->assertDatabaseHas('spp_payments', [
            'student_id' => $student->id,
            'spp_month_id' => $sppMonth1->id,
            'paid_amount' => 100000,
            'status' => 'paid',
        ]);

        $this->assertDatabaseHas('spp_payments', [
            'student_id' => $student->id,
            'spp_month_id' => $sppMonth2->id,
            'paid_amount' => 100000,
            'status' => 'paid',
        ]);
    }

    public function test_spp_partial_payment_creates_partial_status()
    {
        $user = $this->createAdminUser();

        $student = Student::factory()->create([
            'entry_month' => 1,
            'entry_year' => 2026,
        ]);

        $sppMonth = SppMonth::create(['month' => 1, 'year' => 2026, 'amount' => 100000]);

        $response = $this->actingAs($user)->post(route('payment.store'), [
            'type' => 'in',
            'category' => 'SPP',
            'amount' => 30000,
            'student_id' => $student->id,
            'transaction_date' => '2026-01-15',
        ]);

        $response->assertRedirect(route('payment.index'));

        $this->assertDatabaseHas('spp_payments', [
            'student_id' => $student->id,
            'spp_month_id' => $sppMonth->id,
            'paid_amount' => 30000,
            'status' => 'partial',
        ]);
    }

    // =========================================================================
    // Print / PDF
    // =========================================================================

    public function test_print_returns_pdf_download()
    {
        $user = $this->createAdminUser();
        $student = Student::factory()->create();
        $transaction = Transaction::factory()->create([
            'user_id' => $user->id,
            'student_id' => $student->id,
        ]);

        $response = $this->actingAs($user)->get(route('payment.print', $transaction));

        $response->assertOk();
        $response->assertHeader('Content-Type', 'application/pdf');
    }
}
