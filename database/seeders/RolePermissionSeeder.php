<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        $permissions = [
            'dashboard.view' => ['Dashboard', 'Melihat dashboard'],

            'siswa.view' => ['Siswa', 'Melihat daftar siswa'],
            'siswa.create' => ['Siswa', 'Menambah siswa baru'],
            'siswa.edit' => ['Siswa', 'Mengedit data siswa'],
            'siswa.delete' => ['Siswa', 'Menghapus siswa'],
            'siswa.import' => ['Siswa', 'Mengimport data siswa'],
            'siswa.export' => ['Siswa', 'Mengexport data siswa'],

            'pembayaran.view' => ['Pembayaran', 'Melihat daftar transaksi'],
            'pembayaran.create' => ['Pembayaran', 'Menambah transaksi baru'],
            'pembayaran.edit' => ['Pembayaran', 'Mengedit transaksi'],
            'pembayaran.delete' => ['Pembayaran', 'Menghapus transaksi'],
            'pembayaran.export' => ['Pembayaran', 'Mengexport transaksi'],
            'pembayaran.print' => ['Pembayaran', 'Mencetak struk transaksi'],

            'kategori.view' => ['Kategori', 'Melihat daftar kategori'],
            'kategori.create' => ['Kategori', 'Menambah kategori baru'],
            'kategori.edit' => ['Kategori', 'Mengedit kategori'],
            'kategori.delete' => ['Kategori', 'Menghapus kategori'],

            'spp.view' => ['SPP', 'Melihat daftar SPP'],
            'spp.create' => ['SPP', 'Menambah pembayaran SPP'],
            'spp.edit' => ['SPP', 'Mengedit pembayaran SPP'],
            'spp.delete' => ['SPP', 'Menghapus pembayaran SPP'],
            'spp.tunggakan' => ['SPP', 'Melihat tunggakan SPP'],

            'kenaikan.view' => ['Kenaikan Kelas', 'Melihat kenaikan kelas'],
            'kenaikan.process' => ['Kenaikan Kelas', 'Memproses kenaikan kelas'],

            'users.view' => ['Pengguna', 'Melihat daftar pengguna'],
            'users.create' => ['Pengguna', 'Menambah pengguna baru'],
            'users.edit' => ['Pengguna', 'Mengedit data pengguna'],
            'users.delete' => ['Pengguna', 'Menghapus pengguna'],
            'users.roles' => ['Pengguna', 'Mengatur role pengguna'],

            'pengaturan.view' => ['Pengaturan', 'Melihat pengaturan'],
            'pengaturan.edit' => ['Pengaturan', 'Mengedit pengaturan'],
        ];

        foreach ($permissions as $name => [$group, $description]) {
            Permission::updateOrCreate(
                ['name' => $name],
                [
                    'display_name' => $description,
                    'group' => $group,
                ]
            );
        }

        $adminRole = Role::updateOrCreate(
            ['name' => 'admin'],
            [
                'display_name' => 'Administrator',
                'description' => 'Akses penuh ke semua fitur',
                'is_default' => false,
            ]
        );
        $adminRole->syncPermissions(Permission::pluck('id')->toArray());

        $bendaharaRole = Role::updateOrCreate(
            ['name' => 'bendahara'],
            [
                'display_name' => 'Bendahara',
                'description' => 'Akses untuk bendahara',
                'is_default' => true,
            ]
        );
        $bendaharaRole->syncPermissions(Permission::whereIn('name', [
            'dashboard.view',
            'siswa.view',
            'siswa.create',
            'siswa.edit',
            'siswa.import',
            'siswa.export',
            'pembayaran.view',
            'pembayaran.create',
            'pembayaran.edit',
            'pembayaran.delete',
            'pembayaran.export',
            'pembayaran.print',
            'kategori.view',
            'kategori.create',
            'kategori.edit',
            'spp.view',
            'spp.create',
            'spp.edit',
            'spp.delete',
            'spp.tunggakan',
            'kenaikan.view',
            'kenaikan.process',
        ])->pluck('id')->toArray());

        $umumRole = Role::updateOrCreate(
            ['name' => 'umum'],
            [
                'display_name' => 'Umum',
                'description' => 'Role default untuk umum',
                'is_default' => false,
            ]
        );
        $umumRole->syncPermissions(Permission::whereIn('name', [
            'dashboard.view',
            'pembayaran.view',
            'pembayaran.create',
        ])->pluck('id')->toArray());
    }
}
