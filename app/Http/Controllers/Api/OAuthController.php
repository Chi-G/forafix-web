<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\AgentProfile;
use Illuminate\Http\Request;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Auth;

class OAuthController extends Controller
{
    public function redirectToGoogle()
    {
        try {
            // Check if client ID and secret are set
            if (!config('services.google.client_id') || !config('services.google.client_secret')) {
                throw new \Exception('Google OAuth credentials are not configured in services.php or .env file.');
            }

            return response()->json([
                'url' => Socialite::driver('google')
                    ->stateless()
                    ->redirect()
                    ->getTargetUrl(),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to initialize Google login: ' . $e->getMessage(),
                'trace' => config('app.debug') ? $e->getTraceAsString() : null
            ], 500);
        }
    }

    public function handleGoogleCallback(Request $request)
    {
        try {
            $googleUser = Socialite::driver('google')->stateless()->user();
            
            $user = User::where('google_id', $googleUser->id)
                ->orWhere('email', $googleUser->email)
                ->first();

            if ($user) {
                // Update existing user
                $user->update([
                    'google_id' => $googleUser->id,
                    'avatar' => $googleUser->avatar,
                ]);
            } else {
                // Create new user (default to CLIENT role)
                $user = User::create([
                    'name' => $googleUser->name,
                    'email' => $googleUser->email,
                    'google_id' => $googleUser->id,
                    'avatar' => $googleUser->avatar,
                    'password' => bcrypt(Str::random(16)),
                    'role' => 'CLIENT',
                    'email_verified_at' => now(),
                ]);

                event(new \Illuminate\Auth\Events\Registered($user));
                \Illuminate\Support\Facades\Mail::to($user->email)->send(new \App\Mail\WelcomeEmail($user));
            }

            $token = $user->createToken('auth_token')->plainTextToken;

            // Redirect back to frontend with token
            $frontendUrl = env('APP_URL', 'http://localhost:8000');
            return redirect($frontendUrl . '/auth/callback?token=' . $token);

        } catch (\Exception $e) {
            return response()->json(['error' => 'Authentication failed: ' . $e->getMessage()], 401);
        }
    }
}
