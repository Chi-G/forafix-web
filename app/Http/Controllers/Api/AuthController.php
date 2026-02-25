<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\AgentProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'role' => 'required|string|in:CLIENT,AGENT',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
        ]);

        if ($request->role === 'AGENT') {
            AgentProfile::create([
                'user_id' => $user->id,
                'is_available' => true,
            ]);
        }

        event(new \Illuminate\Auth\Events\Registered($user));
        \Illuminate\Support\Facades\Mail::to($user->email)->send(new \App\Mail\WelcomeEmail($user));

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user->load('agentProfile'),
            'message' => 'Registration successful. Please verify your email.'
        ]);
    }

    public function login(Request $request)
    {
        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json([
                'message' => 'Invalid login details'
            ], 401);
        }

        $user = User::where('email', $request->email)->firstOrFail();

        if (!$user->hasVerifiedEmail()) {
            return response()->json([
                'message' => 'Your email address is not verified.',
                'error_code' => 'EMAIL_NOT_VERIFIED'
            ], 403);
        }

        if ($user->two_factor_confirmed_at) {
            return response()->json([
                'message' => 'Two-factor authentication required.',
                'error_code' => 'TWO_FACTOR_REQUIRED',
                'email' => $user->email
            ], 202);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user->load('agentProfile'),
        ]);
    }

    public function me(Request $request)
    {
        return response()->json($request->user()->load('agentProfile'));
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Successfully logged out']);
    }

    public function updateProfile(\App\Http\Requests\UpdateProfileRequest $request)
    {
        $user = $request->user();
        $user->update($request->validated());

        return response()->json($user->load('agentProfile'));
    }

    public function showByUuid($uuid)
    {
        $user = User::where('uuid', $uuid)->with('agentProfile')->firstOrFail();
        return response()->json($user->makeHidden(['email']));
    }
}
