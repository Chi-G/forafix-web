<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Foundation\Auth\EmailVerificationRequest;
use Illuminate\Http\Request;
use Illuminate\Auth\Events\Verified;

use OpenApi\Attributes as OA;

#[OA\Tag(name: "Verification", description: "Email and identity verification")]
class VerificationController extends Controller
{
    #[OA\Get(
        path: "/api/email/verify/{id}/{hash}",
        summary: "Verify email address via signed link",
        tags: ["Verification"]
    )]
    #[OA\Parameter(name: "id", in: "path", required: true, schema: new OA\Schema(type: "integer"))]
    #[OA\Parameter(name: "hash", in: "path", required: true, schema: new OA\Schema(type: "string"))]
    #[OA\Response(response: 302, description: "Redirect to login")]
    public function verify(Request $request, $id, $hash)
    {
        $user = User::findOrFail($id);

        if (!hash_equals((string) $hash, sha1($user->getEmailForVerification()))) {
            return response()->json(['message' => 'Invalid verification link.'], 403);
        }

        if ($user->hasVerifiedEmail()) {
            return redirect(env('APP_URL') . '/login?verified=1');
        }

        if ($user->markEmailAsVerified()) {
            event(new Verified($user));
        }

        return redirect(env('APP_URL') . '/login?verified=1');
    }

    #[OA\Post(
        path: "/api/email/resend",
        summary: "Resend email verification link",
        tags: ["Verification"]
    )]
    #[OA\RequestBody(
        required: true,
        content: new OA\JsonContent(
            required: ["email"],
            properties: [
                new OA\Property(property: "email", type: "string", format: "email")
            ]
        )
    )]
    #[OA\Response(response: 200, description: "Link sent")]
    public function resend(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            // We return a generic message to avoid email enumeration
            return response()->json(['message' => 'If the email exists, a verification link has been sent.']);
        }

        if ($user->hasVerifiedEmail()) {
            return response()->json(['message' => 'Email already verified.'], 400);
        }

        try {
            $user->sendEmailVerificationNotification();
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Verification Resend Failed: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to send verification email. Please contact support or try again later.',
                'debug' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }

        return response()->json(['message' => 'Verification link sent.']);
    }
}
