<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use PragmaRX\Google2FALaravel\Facade as Google2FA;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

use OpenApi\Attributes as OA;

#[OA\Tag(name: "Security")]
class TwoFactorController extends Controller
{
    #[OA\Post(
        path: "/api/two-factor/enable",
        summary: "Enable 2FA (Generates Secret & QR Code)",
        tags: ["Security"],
        security: [["sanctum" => []]]
    )]
    #[OA\Response(response: 200, description: "Success")]
    public function enable(Request $request)
    {
        $user = $request->user();

        if ($user->two_factor_confirmed_at) {
            return response()->json(['message' => '2FA is already enabled.'], 400);
        }

        $secret = Google2FA::generateSecretKey();
        
        $user->forceFill([
            'two_factor_secret' => encrypt($secret),
        ])->save();

        $qrCodeInline = Google2FA::getQRCodeInline(
            config('app.name'),
            $user->email,
            $secret
        );

        return response()->json([
            'qr_code' => $qrCodeInline,
            'secret' => $secret,
        ]);
    }

    /**
     * Confirm 2FA setup.
     */
    #[OA\Post(
        path: "/api/two-factor/confirm",
        summary: "Confirm 2FA setup with a code",
        tags: ["Security"],
        security: [["sanctum" => []]]
    )]
    #[OA\RequestBody(
        required: true,
        content: new OA\JsonContent(
            required: ["code"],
            properties: [
                new OA\Property(property: "code", type: "string", example: "123456")
            ]
        )
    )]
    #[OA\Response(response: 200, description: "Success")]
    #[OA\Response(response: 422, description: "Invalid Code")]
    public function confirm(Request $request)
    {
        $request->validate([
            'code' => 'required',
        ]);

        $user = $request->user();
        $secret = decrypt($user->two_factor_secret);

        if (Google2FA::verifyKey($secret, $request->code)) {
            $recoveryCodes = $this->generateRecoveryCodes();
            $user->forceFill([
                'two_factor_confirmed_at' => now(),
                'two_factor_recovery_codes' => encrypt(json_encode($recoveryCodes)),
            ])->save();

            return response()->json([
                'message' => '2FA enabled successfully.',
                'recovery_codes' => $recoveryCodes,
            ]);
        }

        return response()->json(['message' => 'Invalid verification code.'], 422);
    }

    #[OA\Post(
        path: "/api/two-factor/disable",
        summary: "Disable 2FA",
        tags: ["Security"],
        security: [["sanctum" => []]]
    )]
    #[OA\RequestBody(
        required: true,
        content: new OA\JsonContent(
            required: ["password"],
            properties: [
                new OA\Property(property: "password", type: "string", format: "password")
            ]
        )
    )]
    #[OA\Response(response: 200, description: "Success")]
    public function disable(Request $request)
    {
        $request->validate([
            'password' => 'required',
        ]);

        $user = $request->user();

        if (!Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Invalid password.'], 422);
        }

        $user->forceFill([
            'two_factor_secret' => null,
            'two_factor_recovery_codes' => null,
            'two_factor_confirmed_at' => null,
        ])->save();

        return response()->json(['message' => '2FA disabled successfully.']);
    }

    #[OA\Post(
        path: "/api/two-factor/challenge",
        summary: "Verify 2FA code during login",
        tags: ["Security"]
    )]
    #[OA\RequestBody(
        required: true,
        content: new OA\JsonContent(
            required: ["email", "code"],
            properties: [
                new OA\Property(property: "email", type: "string", format: "email"),
                new OA\Property(property: "code", type: "string")
            ]
        )
    )]
    #[OA\Response(response: 200, description: "Success")]
    #[OA\Response(response: 422, description: "Invalid Code")]
    public function challenge(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'code' => 'required',
        ]);

        $user = User::where('email', $request->email)->firstOrFail();

        if (!$user->two_factor_confirmed_at) {
            return response()->json(['message' => '2FA is not enabled.'], 400);
        }

        $secret = decrypt($user->two_factor_secret);

        if (Google2FA::verifyKey($secret, $request->code)) {
            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'access_token' => $token,
                'token_type' => 'Bearer',
                'user' => $user->load('agentProfile'),
            ]);
        }

        return response()->json(['message' => 'Invalid verification code.'], 422);
    }

    protected function generateRecoveryCodes()
    {
        return collect(range(1, 8))->map(function () {
            return str_pad(mt_rand(0, 99999999), 8, '0', STR_PAD_LEFT);
        })->all();
    }
}
