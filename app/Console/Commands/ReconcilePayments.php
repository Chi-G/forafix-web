<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Transaction;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ReconcilePayments extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'payments:reconcile {--days=1 : Number of days to look back}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Reconcile local transactions with Paystack';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $days = $this->option('days');
        $this->info("Starting reconciliation for the last $days day(s)...");

        $url = config('services.paystack.url') . "/transaction";
        $secret = config('services.paystack.secret');

        try {
            $response = Http::withToken($secret)->get($url, [
                'from' => now()->subDays($days)->toIso8601String(),
            ]);

            if (!$response->successful()) {
                $this->error("Failed to fetch transactions from Paystack: " . $response->body());
                return 1;
            }

            $paystackTxns = $response->json()['data'] ?? [];
            $discrepancies = 0;

            foreach ($paystackTxns as $pTxn) {
                if ($pTxn['status'] !== 'success') continue;

                $reference = $pTxn['reference'];
                $localTxn = Transaction::where('reference', $reference)->first();

                if (!$localTxn) {
                    $this->warn("MISSING: Transaction $reference found on Paystack but not locally.");
                    $discrepancies++;
                    // Optional: Auto-create or log to a special audit table
                    continue;
                }

                if ($localTxn->status !== 'success') {
                    $this->warn("MISMATCH: Transaction $reference is 'success' on Paystack but '{$localTxn->status}' locally.");
                    $discrepancies++;
                    
                    // Critical: Resolve mismatch if it was a successful payment
                    if ($pTxn['status'] === 'success') {
                        $this->info("Attempting to auto-resolve $reference...");
                        // Trigger the same logic as webhook/verify here
                        // For safety, we just log it for now or provide a --fix flag
                    }
                }
            }

            $this->info("Reconciliation complete. Found $discrepancies discrepancy(ies).");

        } catch (\Exception $e) {
            $this->error("Error during reconciliation: " . $e->getMessage());
            Log::error("Reconciliation Error: " . $e->getMessage());
            return 1;
        }

        return 0;
    }
}
