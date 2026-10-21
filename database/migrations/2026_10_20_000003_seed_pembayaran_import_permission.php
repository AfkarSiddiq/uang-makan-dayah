<?php

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $permission = Permission::firstOrCreate(
            ['name' => 'pembayaran.import'],
            [
                'display_name' => 'Mengimport transaksi',
                'group' => 'Pembayaran',
            ]
        );

        $roles = Role::whereIn('name', ['admin', 'bendahara'])->get();
        foreach ($roles as $role) {
            if (! $role->permissions()->where('permissions.id', $permission->id)->exists()) {
                $role->permissions()->attach($permission->id);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $permission = Permission::where('name', 'pembayaran.import')->first();
        if ($permission) {
            $permission->roles()->detach();
            $permission->delete();
        }
    }
};
