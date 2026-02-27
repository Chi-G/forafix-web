<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\PaymentMethod;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PaymentMethodController extends Controller
{
    public function index(Request $request)
    {
        return $request->user()->paymentMethods()->orderBy('is_default', 'desc')->get();
    }

    public function initialize(Request $request)
    {
        $url = config('services.paystack.url') . '/transaction/initialize';
        $email = $request->input('email', $request->user()->email);
        
        try {
            $response = Http::withToken(config('services.paystack.secret'))
                ->post($url, [
                    'amount' => 5000, 
                    'email' => $email,
                    'reference' => 'VERIFY-' . auth()->id() . '-' . time(),
                    'callback_url' => env('PAYSTACK_CALLBACK_URL', url('/dashboard')),
                    'channels' => ['card'],
                ]);

            if ($response->successful()) {
                $data = $response->json();
                $data['data']['email'] = $email; 
                return response()->json($data);
            }

            return response()->json($response->json(), $response->status());

        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to initialize verification'], 500);
        }
    }

    public function store(Request $request)
    {
        $request->validate([
            'reference' => 'required|string',
        ]);

        $reference = $request->reference;
        $url = config('services.paystack.url') . "/transaction/verify/" . rawurlencode($reference);

        $response = Http::withToken(config('services.paystack.secret'))->get($url);

        if (!$response->successful()) {
            return response()->json(['message' => 'Failed to verify transaction'], 400);
        }

        $data = $response->json()['data'];

        if ($data['status'] !== 'success') {
            return response()->json(['message' => 'Transaction was not successful'], 400);
        }

        $auth = $data['authorization'];

        // Only save if it's a card
        if ($auth['channel'] !== 'card') {
            return response()->json(['message' => 'Only card payments can be saved'], 400);
        }

        $request->user()->paymentMethods()->update(['is_default' => false]);

        $paymentMethod = $request->user()->paymentMethods()->create([
            'brand' => $auth['brand'],
            'last4' => $auth['last4'],
            'expiry' => $auth['exp_month'] . '/' . substr($auth['exp_year'], -2),
            'authorization_code' => $auth['authorization_code'],
            'cardholder_name' => $data['customer']['first_name'] . ' ' . $data['customer']['last_name'],
            'signature' => $auth['signature'],
            'is_default' => true,
        ]);

        return response()->json($paymentMethod, 201);
    }

    public function destroy(PaymentMethod $paymentMethod)
    {
        if ($paymentMethod->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $paymentMethod->delete();
        return response()->json(null, 204);
    }

    public function setDefault(Request $request, PaymentMethod $paymentMethod)
    {
        if ($paymentMethod->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->user()->paymentMethods()->update(['is_default' => false]);
        $paymentMethod->update(['is_default' => true]);

        return response()->json($paymentMethod);
    }
}
