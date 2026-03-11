<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\AgentProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

use OpenApi\Attributes as OA;

#[OA\Tag(name: "Authentication", description: "User registration and session management")]
class AuthController extends Controller
{
    #[OA\Post(
        path: "/api/register",
        summary: "Register a new user",
        tags: ["Authentication"]
    )]
    #[OA\RequestBody(
        required: true,
        content: new OA\JsonContent(
            required: ["name", "email", "password", "password_confirmation", "role"],
            properties: [
                new OA\Property(property: "name", type: "string", example: "John Doe"),
                new OA\Property(property: "email", type: "string", format: "email", example: "john@example.com"),
                new OA\Property(property: "password", type: "string", format: "password", example: "password123"),
                new OA\Property(property: "password_confirmation", type: "string", format: "password", example: "password123"),
                new OA\Property(property: "role", type: "string", enum: ["CLIENT", "AGENT"], example: "CLIENT")
            ]
        )
    )]
    #[OA\Response(response: 200, description: "Success")]
    #[OA\Response(response: 422, description: "Validation Error")]
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
        $tokenInstance = $user->createToken('auth_token');
        $tokenInstance->accessToken->ip_address = $request->ip();
        $tokenInstance->accessToken->user_agent = $request->userAgent();
        $tokenInstance->accessToken->save();
        $token = $tokenInstance->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user->load('agentProfile'),
            'message' => 'Registration successful. Please verify your email.'
        ]);
    }

    #[OA\Post(
        path: "/api/login",
        summary: "Login a user",
        tags: ["Authentication"]
    )]
    #[OA\RequestBody(
        required: true,
        content: new OA\JsonContent(
            required: ["email", "password"],
            properties: [
                new OA\Property(property: "email", type: "string", format: "email", example: "john@example.com"),
                new OA\Property(property: "password", type: "string", format: "password", example: "password123")
            ]
        )
    )]
    #[OA\Response(response: 200, description: "Success")]
    #[OA\Response(response: 401, description: "Invalid Credentials")]
    #[OA\Response(response: 403, description: "Email Not Verified")]
    #[OA\Response(response: 202, description: "Two-Factor Required")]
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

        $tokenInstance = $user->createToken('auth_token');
        $tokenInstance->accessToken->ip_address = $request->ip();
        $tokenInstance->accessToken->user_agent = $request->userAgent();
        $tokenInstance->accessToken->save();
        $token = $tokenInstance->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user->load('agentProfile'),
        ]);
    }

    #[OA\Get(
        path: "/api/me",
        summary: "Get authenticated user details",
        tags: ["Authentication"],
        security: [["sanctum" => []]]
    )]
    #[OA\Response(response: 200, description: "Success")]
    public function me(Request $request)
    {
        return response()->json($request->user()->load('agentProfile'));
    }

    #[OA\Post(
        path: "/api/logout",
        summary: "Logout user",
        tags: ["Authentication"],
        security: [["sanctum" => []]]
    )]
    #[OA\Response(response: 200, description: "Success")]
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Successfully logged out']);
    }

    #[OA\Post(
        path: "/api/profile",
        summary: "Update user profile",
        tags: ["Authentication"],
        security: [["sanctum" => []]]
    )]
    #[OA\RequestBody(
        required: true,
        content: new OA\JsonContent(
            properties: [
                new OA\Property(property: "name", type: "string", example: "John Doe"),
                new OA\Property(property: "phone", type: "string", example: "+1234567890"),
                new OA\Property(property: "address", type: "string", example: "123 Main St"),
                new OA\Property(property: "city", type: "string", example: "New York"),
                new OA\Property(property: "postal_code", type: "string", example: "10001")
            ]
        )
    )]
    #[OA\Response(response: 200, description: "Success")]
    public function updateProfile(\App\Http\Requests\UpdateProfileRequest $request)
    {
        $user = $request->user();
        $user->update($request->validated());

        return response()->json($user->load('agentProfile'));
    }

    #[OA\Delete(
        path: "/api/user",
        summary: "Delete user account",
        tags: ["Authentication"],
        security: [["sanctum" => []]]
    )]
    #[OA\Response(response: 200, description: "Success")]
    public function deleteAccount(Request $request)
    {
        $user = $request->user();
        
        // Revoke all tokens
        $user->tokens()->delete();
        
        // Delete the user
        $user->delete();
        
        return response()->json(['message' => 'Account successfully deleted.']);
    }

    #[OA\Get(
        path: "/api/users/{uuid}",
        summary: "Get public user profile by UUID",
        tags: ["Authentication"]
    )]
    #[OA\Parameter(
        name: "uuid",
        in: "path",
        required: true,
        schema: new OA\Schema(type: "string", format: "uuid")
    )]
    #[OA\Response(response: 200, description: "Success")]
    #[OA\Response(response: 404, description: "User Not Found")]
    public function showByUuid($uuid)
    {
        $user = User::where('uuid', $uuid)->with('agentProfile')->firstOrFail();
        return response()->json($user->makeHidden(['email']));
    }
}
