<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use PragmaRX\Google2FALaravel\Facade as Google2FA;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class TwoFactorController extends Controller
{
    /**
     * Enable 2FA for the user.
     */
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

    /**
     * Disable 2FA.
     */
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

    /**
     * Handle 2FA challenge during login.
     */
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
