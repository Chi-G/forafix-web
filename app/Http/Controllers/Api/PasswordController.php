<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

use OpenApi\Attributes as OA;

#[OA\Tag(name: "Security", description: "Password and 2FA management")]
class PasswordController extends Controller
{
    #[OA\Post(
        path: "/api/password/update",
        summary: "Change account password",
        tags: ["Security"],
        security: [["sanctum" => []]]
    )]
    #[OA\RequestBody(
        required: true,
        content: new OA\JsonContent(
            required: ["current_password", "password", "password_confirmation"],
            properties: [
                new OA\Property(property: "current_password", type: "string", format: "password"),
                new OA\Property(property: "password", type: "string", format: "password"),
                new OA\Property(property: "password_confirmation", type: "string", format: "password")
            ]
        )
    )]
    #[OA\Response(response: 200, description: "Success")]
    #[OA\Response(response: 422, description: "Validation Error")]
    public function update(Request $request)
    {
        $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => ['required', 'confirmed', Password::defaults()],
        ]);

        $request->user()->update([
            'password' => Hash::make($request->password),
        ]);

        return response()->json([
            'message' => 'Password updated successfully.',
        ]);
    }
}
