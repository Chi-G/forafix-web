<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\PaymentMethod;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

use OpenApi\Attributes as OA;

#[OA\Tag(name: "Payment Methods", description: "Credit card and authorization management")]
class PaymentMethodController extends Controller
{
    #[OA\Get(
        path: "/api/payment-methods",
        summary: "List user saved payment methods",
        tags: ["Payment Methods"],
        security: [["sanctum" => []]]
    )]
    #[OA\Response(response: 200, description: "Success")]
    public function index(Request $request)
    {
        return $request->user()->paymentMethods()->orderBy('is_default', 'desc')->get();
    }

    #[OA\Post(
        path: "/api/payment-methods/initialize",
        summary: "Initialize card verification (N50 charge)",
        tags: ["Payment Methods"],
        security: [["sanctum" => []]]
    )]
    #[OA\Response(response: 200, description: "Initialization session created")]
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

    #[OA\Post(
        path: "/api/payment-methods",
        summary: "Verify and save card after Paystack checkout",
        tags: ["Payment Methods"],
        security: [["sanctum" => []]]
    )]
    #[OA\RequestBody(
        required: true,
        content: new OA\JsonContent(
            required: ["reference"],
            properties: [
                new OA\Property(property: "reference", type: "string")
            ]
        )
    )]
    #[OA\Response(response: 201, description: "Card saved")]
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

    #[OA\Delete(
        path: "/api/payment-methods/{paymentMethod}",
        summary: "Delete saved card",
        tags: ["Payment Methods"],
        security: [["sanctum" => []]]
    )]
    #[OA\Parameter(name: "paymentMethod", in: "path", required: true, schema: new OA\Schema(type: "integer"))]
    #[OA\Response(response: 204, description: "Deleted")]
    public function destroy(PaymentMethod $paymentMethod)
    {
        if ($paymentMethod->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $paymentMethod->delete();
        return response()->json(null, 204);
    }

    #[OA\Patch(
        path: "/api/payment-methods/{paymentMethod}/default",
        summary: "Set card as default",
        tags: ["Payment Methods"],
        security: [["sanctum" => []]]
    )]
    #[OA\Parameter(name: "paymentMethod", in: "path", required: true, schema: new OA\Schema(type: "integer"))]
    #[OA\Response(response: 200, description: "Success")]
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
