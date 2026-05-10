<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckPermission
{
    public function handle(Request $request, Closure $next, string ...$permissions): Response
    {
        if (! $request->user()) {
            return redirect()->route('login');
        }

        $user = $request->user();

        $allPermissions = [];
        foreach ($permissions as $permission) {
            $allPermissions = array_merge($allPermissions, explode('|', $permission));
        }

        $hasAnyPermission = false;
        foreach ($allPermissions as $permission) {
            if ($user->hasPermission(trim($permission))) {
                $hasAnyPermission = true;
                break;
            }
        }

        if (! $hasAnyPermission) {
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'Anda tidak memiliki izin untuk mengakses fitur ini.',
                ], 403);
            }

            abort(403, 'Anda tidak memiliki izin untuk mengakses fitur ini.');
        }

        return $next($request);
    }
}
