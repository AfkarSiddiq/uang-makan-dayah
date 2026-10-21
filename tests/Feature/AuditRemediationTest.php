<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Permission;
use App\Models\Role;
use App\Models\SppMonth;
use App\Models\SppPayment;
use App\Models\Student;
use App\Models\Transaction;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
use Tests\TestCase;

class AuditRemediationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolePermissionSeeder::class);
    }

    public function test_pembayaran_import_permission_is_seeded_and_assigned()
    {
        $permission = Permission::where('name', 'pembayaran.import')->first();
        $this->assertNotNull($permission, 'Permission pembayaran.import should exist');

        $bendahara = Role::where('name', 'bendahara')->first();
        $this->assertTrue(
            $bendahara->permissions()->where('permissions.id', $permission->id)->exists(),
            'Bendahara should have pembayaran.import permission'
        );
    }

    public function test_student_detail_requires_siswa_view_permission()
    {
        $userWithoutPerm = User::factory()->create();
        $this->actingAs($userWithoutPerm);

        $student = Student::create([
            'name' => 'Ahmad Test',
            'nisn' => '1234567890',
            'gender' => 'L',
            'class' => '1',
            'status' => 'aktif',
            'entry_year' => 2026,
            'entry_month' => 7,
        ]);

        $response = $this->get("/siswa/{$student->id}");
        $response->assertForbidden();
    }

    public function test_payment_sort_by_student_name_preserves_transaction_id()
    {
        $admin = User::factory()->create();
        $admin->roles()->attach(Role::where('name', 'admin')->first());
        $this->actingAs($admin);

        $student = Student::create([
            'name' => 'Zaid Test',
            'nisn' => '9998887771',
            'gender' => 'L',
            'class' => '2',
            'status' => 'aktif',
            'entry_year' => 2026,
            'entry_month' => 7,
        ]);

        $transaction = Transaction::create([
            'transaction_id' => 'TRX-TEST-001',
            'type' => 'in',
            'category' => 'SPP Bulanan',
            'amount' => 500000,
            'transaction_date' => now()->toDateString(),
            'student_id' => $student->id,
            'user_id' => $admin->id,
            'note' => 'Pembayaran SPP Zaid',
        ]);

        $response = $this->get('/payment?sort_by=student_name&sort_dir=asc');
        $response->assertOk();

        // Transaction ID in database should match and not be overridden by student ID
        $this->assertDatabaseHas('transactions', [
            'id' => $transaction->id,
            'transaction_id' => 'TRX-TEST-001',
            'student_id' => $student->id,
        ]);
    }

    public function test_deleting_transaction_reverses_spp_payments()
    {
        $admin = User::factory()->create();
        $admin->roles()->attach(Role::where('name', 'admin')->first());
        $this->actingAs($admin);

        $student = Student::create([
            'name' => 'Fulan Test',
            'nisn' => '1112223334',
            'gender' => 'L',
            'class' => '1',
            'status' => 'aktif',
            'entry_year' => 2026,
            'entry_month' => 7,
        ]);

        $month = SppMonth::create([
            'name' => 'Juli',
            'month' => 7,
            'year' => 2026,
        ]);

        $transaction = Transaction::create([
            'transaction_id' => 'TRX-REVERSE-001',
            'type' => 'in',
            'category' => 'SPP Bulanan',
            'amount' => 500000,
            'transaction_date' => now()->toDateString(),
            'student_id' => $student->id,
            'user_id' => $admin->id,
        ]);

        $sppPayment = SppPayment::create([
            'student_id' => $student->id,
            'spp_month_id' => $month->id,
            'transaction_id' => $transaction->id,
            'paid_amount' => 500000,
            'status' => 'paid',
            'paid_at' => now(),
        ]);

        // Delete the transaction
        $response = $this->delete("/payment/{$transaction->id}");
        $response->assertRedirect();

        // Transaction is deleted
        $this->assertDatabaseMissing('transactions', ['id' => $transaction->id]);

        // SPP Payment is reversed to unpaid
        $sppPayment->refresh();
        $this->assertEquals('unpaid', $sppPayment->status);
        $this->assertEquals(0, $sppPayment->paid_amount);
        $this->assertNull($sppPayment->paid_at);
        $this->assertNull($sppPayment->transaction_id);
    }

    public function test_idempotency_middleware_blocks_concurrent_duplicate_requests()
    {
        $admin = User::factory()->create();
        $admin->roles()->attach(Role::where('name', 'admin')->first());
        $this->actingAs($admin);

        $idempotencyKey = (string) Str::uuid();

        // 1. Concurrent in-flight request lock
        $lock = Cache::lock("idempotency:lock:{$admin->id}:{$idempotencyKey}", 15);
        $lock->get();

        $response = $this->withHeaders([
            'X-Idempotency-Key' => $idempotencyKey,
            'Accept' => 'application/json',
        ])->post('/payment', [
            'type' => 'in',
            'category' => 'Infaq',
            'amount' => 100000,
            'transaction_date' => now()->toDateString(),
            'note' => 'Test Idempotency',
        ]);

        // Returns 429 Too Many Requests when lock is already held
        $response->assertStatus(429);
        $lock->release();
    }

    public function test_idempotency_middleware_prevents_duplicate_replay_after_success()
    {
        $admin = User::factory()->create();
        $admin->roles()->attach(Role::where('name', 'admin')->first());
        $this->actingAs($admin);

        $idempotencyKey = (string) Str::uuid();
        $cachedKey = "idempotency:resp:{$admin->id}:{$idempotencyKey}";
        Cache::put($cachedKey, true, now()->addMinutes(2));

        $countBefore = Transaction::count();

        $response = $this->withHeaders([
            'X-Idempotency-Key' => $idempotencyKey,
        ])->post('/payment', [
            'type' => 'in',
            'category' => 'Infaq',
            'amount' => 100000,
            'transaction_date' => now()->toDateString(),
            'note' => 'Test Duplicate Replay',
        ]);

        // Redirects back without executing transaction insertion
        $response->assertRedirect();
        $this->assertEquals($countBefore, Transaction::count());
    }
}
