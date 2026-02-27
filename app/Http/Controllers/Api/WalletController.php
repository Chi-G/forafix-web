<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Transaction;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class WalletController extends Controller
{
    /**
     * Get transaction history for the authenticated user.
     */
    public function index(Request $request)
    {
        $transactions = $request->user()->transactions()
            ->latest()
            ->paginate(10);
            
        return response()->json($transactions);
    }

    /**
     * Initialize a Paystack transaction to fund the wallet.
     */
    public function initialize(Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric|min:100', // Minimum 100 Naira
        ]);

        $amount = $request->amount;
        $user = $request->user();
        
        $url = config('services.paystack.url') . '/transaction/initialize';
        $reference = 'FUND-' . $user->id . '-' . time();
        
        try {
            $response = Http::withToken(config('services.paystack.secret'))
                ->post($url, [
                    'amount' => $amount * 100, // Paystack expects amount in sub-units (kobo)
                    'email' => $user->email,
                    'reference' => $reference,
                    // Typically wallet funding implies a redirect back to settings
                    'callback_url' => url('/cl/settings?tab=billing'),
                ]);

            if ($response->successful()) {
                $data = $response->json();
                
                // Track as a pending transaction
                Transaction::create([
                    'user_id' => $user->id,
                    'amount' => $amount,
                    'type' => 'credit',
                    'source' => 'funding',
                    'description' => 'Wallet Funding via Paystack',
                    'reference' => $reference,
                    'status' => 'pending',
                ]);

                return response()->json($data);
            }

            return response()->json($response->json(), $response->status());

        } catch (\Exception $e) {
            Log::error('Paystack Initialization Error: ' . $e->getMessage());
            return response()->json(['message' => 'Failed to initialize wallet funding'], 500);
        }
    }

    /**
     * Verify the Paystack transaction and update user balance.
     */
    public function verify(Request $request)
    {
        $request->validate([
            'reference' => 'required|string',
        ]);

        $reference = $request->reference;
        $url = config('services.paystack.url') . "/transaction/verify/" . rawurlencode($reference);

        try {
            $response = Http::withToken(config('services.paystack.secret'))->get($url);

            if (!$response->successful()) {
                return response()->json(['message' => 'Failed to verify transaction'], 400);
            }

            $data = $response->json();

            if ($data['data']['status'] === 'success') {
                $amount = $data['data']['amount'] / 100; // Convert back to Naira
                $txnReference = $data['data']['reference'];
                
                // Apply funds within a database transaction
                return DB::transaction(function () use ($txnReference, $amount) {
                    $transaction = Transaction::where('reference', $txnReference)->first();
                    
                    if (!$transaction) {
                        return response()->json(['message' => 'Transaction not found'], 404);
                    }

                    if ($transaction->status === 'success') {
                        return response()->json(['message' => 'Transaction already processed', 'user' => $transaction->user]);
                    }

                    // Update transaction status
                    $transaction->update(['status' => 'success']);

                    // Update user balance
                    $user = $transaction->user;
                    $user->balance += $amount;
                    $user->save();

                    // Send Email and Dispatch Real-time Event
                    try {
                        \Illuminate\Support\Facades\Mail::to($user->email)
                            ->send(new \App\Mail\WalletFunded($transaction));
                        
                        event(new \App\Events\BalanceUpdated($user));
                    } catch (\Exception $e) {
                        Log::error('Failed to send wallet funding notification: ' . $e->getMessage());
                    }

                    return response()->json([
                        'message' => 'Wallet successfully funded!',
                        'amount' => $amount,
                        'user' => $user
                    ]);
                });
            }

            return response()->json(['message' => 'Transaction status: ' . $data['data']['status']], 400);

        } catch (\Exception $e) {
            Log::error('Paystack Verification Error: ' . $e->getMessage());
            return response()->json(['message' => 'An error occurred during verification'], 500);
        }
    }
}
