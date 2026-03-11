<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Feedback;
use Illuminate\Http\Request;

use OpenApi\Attributes as OA;

#[OA\Tag(name: "Support", description: "Customer help and feedback")]
class SupportController extends Controller
{
    #[OA\Get(
        path: "/api/help-support",
        summary: "Get support contact information",
        tags: ["Support"]
    )]
    #[OA\Response(response: 200, description: "Success")]
    public function index()
    {
        return response()->json([
            'contacts' => [
                [
                    'icon' => 'Zap',
                    'title' => 'App Support',
                    'desc' => 'Report bugs or issues with the Forafix app.',
                    'action' => 'Contact App Support',
                    'href' => 'mailto:info@forafix.forahia.org.ng'
                ],
                [
                    'icon' => 'HelpCircle',
                    'title' => 'General Support',
                    'desc' => 'Questions about bookings, payments, or anything else.',
                    'action' => 'Contact Support',
                    'href' => 'mailto:info@forafix.forahia.org.ng'
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

    #[OA\Post(
        path: "/api/feedback",
        summary: "Submit user feedback",
        tags: ["Support"],
        security: [["sanctum" => []]]
    )]
    #[OA\RequestBody(
        required: true,
        content: new OA\JsonContent(
            required: ["content"],
            properties: [
                new OA\Property(property: "content", type: "string", minLength: 5)
            ]
        )
    )]
    #[OA\Response(response: 200, description: "Success")]
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
