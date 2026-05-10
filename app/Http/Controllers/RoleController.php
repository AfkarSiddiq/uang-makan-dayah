<?php

namespace App\Http\Controllers;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RoleController extends Controller
{
    public function index()
    {
        $roles = Role::with('permissions')
            ->withCount('users')
            ->orderBy('name')
            ->get();

        return Inertia::render('role/index', [
            'roles' => $roles,
        ]);
    }

    public function create()
    {
        $permissions = Permission::orderBy('group')
            ->orderBy('display_name')
            ->get()
            ->groupBy('group');

        return Inertia::render('role/create', [
            'permissions' => $permissions,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:50|unique:roles,name',
            'display_name' => 'required|string|max:100',
            'description' => 'nullable|string|max:500',
            'is_default' => 'boolean',
            'permissions' => 'array',
            'permissions.*' => 'exists:permissions,id',
        ]);

        $role = Role::create([
            'name' => $validated['name'],
            'display_name' => $validated['display_name'],
            'description' => $validated['description'] ?? null,
            'is_default' => $validated['is_default'] ?? false,
        ]);

        if (! empty($validated['permissions'])) {
            $role->permissions()->attach($validated['permissions']);
        }

        return redirect()->route('role.index')->with('success', 'Role berhasil dibuat!');
    }

    public function show(Role $role)
    {
        $role->load('permissions');

        return Inertia::render('role/show', [
            'role' => $role,
        ]);
    }

    public function edit(Role $role)
    {
        $permissions = Permission::orderBy('group')
            ->orderBy('display_name')
            ->get()
            ->groupBy('group');

        $role->load('permissions');

        return Inertia::render('role/edit', [
            'role' => $role,
            'permissions' => $permissions,
        ]);
    }

    public function update(Request $request, Role $role)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:50|unique:roles,name,'.$role->id,
            'display_name' => 'required|string|max:100',
            'description' => 'nullable|string|max:500',
            'is_default' => 'boolean',
            'permissions' => 'array',
            'permissions.*' => 'exists:permissions,id',
        ]);

        $role->update([
            'name' => $validated['name'],
            'display_name' => $validated['display_name'],
            'description' => $validated['description'] ?? null,
            'is_default' => $validated['is_default'] ?? false,
        ]);

        $role->permissions()->sync($validated['permissions'] ?? []);

        return redirect()->route('role.index')->with('success', 'Role berhasil diperbarui!');
    }

    public function destroy(Role $role)
    {
        if ($role->users()->exists()) {
            return back()->with('error', 'Role tidak dapat dihapus karena masih digunakan oleh pengguna!');
        }

        $role->delete();

        return redirect()->route('role.index')->with('success', 'Role berhasil dihapus!');
    }

    public function getPermissions(Role $role): JsonResponse
    {
        $role->load('permissions');

        return response()->json([
            'permissions' => $role->permissions->pluck('id'),
        ]);
    }
}
