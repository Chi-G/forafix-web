<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Feedback;
use Illuminate\Http\Request;

class SupportController extends Controller
{
    public function index()
    {
        return response()->json([
            'contacts' => [
                [
                    'icon' => 'Zap',
                    'title' => 'App Support',
                    'desc' => 'Report bugs or issues with the Forafix app.',
                    'action' => 'Contact App Support',
                    'href' => 'mailto:app-support@forafix.com'
                ],
                [
                    'icon' => 'HelpCircle',
                    'title' => 'General Support',
                    'desc' => 'Questions about bookings, payments, or anything else.',
                    'action' => 'Contact Support',
                    'href' => 'mailto:support@forafix.com'
                ],
                [
                    'icon' => 'Star',
                    'title' => 'Feedback',
                    'desc' => 'Love something? Want to suggest a feature? Tell us!',
                    'action' => null,
                    'href' => null
                ],
            ]
        ]);
    }

    public function storeFeedback(Request $request)
    {
        $request->validate([
            'content' => 'required|string|min:5',
        ]);

        Feedback::create([
            'user_id' => $request->user()->id,
            'content' => $request->content,
        ]);

        return response()->json([
            'message' => 'Feedback submitted successfully. Thank you for your input!'
        ]);
    }
}
