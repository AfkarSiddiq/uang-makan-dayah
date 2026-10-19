<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Symfony\Component\HttpFoundation\Response;

class EnsureIdempotentRequest
{
    /**
     * Handle an incoming request and prevent duplicate execution.
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Hanya terapkan pada mutasi data (POST, PUT, PATCH, DELETE)
        if (! in_array($request->method(), ['POST', 'PUT', 'PATCH', 'DELETE'])) {
            return $next($request);
        }

        $idempotencyKey = $request->header('X-Idempotency-Key') ?? $request->input('idempotency_key');

        // Jika client tidak menyertakan key, lanjutkan request biasa
        if (! $idempotencyKey) {
            return $next($request);
        }

        $userId = $request->user()?->id ?? 'guest';
        $lockKey = "idempotency:lock:{$userId}:{$idempotencyKey}";
        $cachedResponseKey = "idempotency:resp:{$userId}:{$idempotencyKey}";

        // 1. Cek apakah request dengan key yang sama sudah pernah berhasil diproses?
        if (Cache::has($cachedResponseKey)) {
            $cached = Cache::get($cachedResponseKey);
            if ($request->expectsJson() || $request->header('X-Inertia')) {
                return back()->with('info', 'Transaksi sudah diproses sebelumnya.');
            }
            return redirect()->back();
        }

        // 2. Kunci request secara atomic (15 detik) untuk menahan double-click atau network retry
        $lock = Cache::lock($lockKey, 15);

        if (! $lock->get()) {
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'Transaksi sedang diproses oleh sistem. Mohon tunggu...',
                ], 429);
            }

            return back()->with('warning', 'Transaksi sedang diproses oleh sistem. Mohon tunggu beberapa saat...');
        }

        try {
            $response = $next($request);

            // Jika status response sukses (2xx atau redirect 302)
            if ($response->getStatusCode() >= 200 && $response->getStatusCode() < 400) {
                Cache::put($cachedResponseKey, true, now()->addMinutes(2));
            }

            return $response;
        } finally {
            optional($lock)->release();
        }
    }
}
