<?php

namespace App\Http\Middleware;

	use Closure;
use Illuminate\Http\Request;
use App\Models\IdempotencyKey;
use Carbon\Carbon;
use Symfony\Component\HttpFoundation\Response;

class IdempotencyMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $idempotencyKey = $request->header('X-Idempotency-Key');

        if (!$idempotencyKey) {
            return $next($request);
        }

        $storedKey = IdempotencyKey::where('key', $idempotencyKey)->first();

        if ($storedKey) {
            // Check if it's expired
            if (Carbon::now()->isAfter($storedKey->expires_at)) {
                $storedKey->delete();
            } else {
                // Return cached response if available
                if ($storedKey->response_body !== null) {
                    return response()->json(
                        $storedKey->response_body,
                        $storedKey->status_code
                    )->header('X-Idempotency-Cache', 'HIT');
                }
                
                // If it exists but has no response, it's likely still processing
                return response()->json([
                    'message' => 'Request is already being processed.',
                ], 409);
            }
        }

        // Create initial record
        IdempotencyKey::create([
            'key' => $idempotencyKey,
            'request_path' => $request->path(),
            'expires_at' => Carbon::now()->addHours(24),
        ]);

        $response = $next($request);

        // Store result if successful or worth caching
        if ($response instanceof \Illuminate\Http\JsonResponse) {
            IdempotencyKey::where('key', $idempotencyKey)->update([
                'response_body' => $response->getData(),
                'status_code' => $response->getStatusCode(),
            ]);
        }

        return $response;
    }
}
