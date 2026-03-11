<?php

namespace App\Http\Controllers\Api;


use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

use OpenApi\Attributes as OA;

#[OA\Tag(name: "Notification Settings", description: "User notification preference management")]
class NotificationSettingsController extends Controller
{
    #[OA\Put(
        path: "/api/notification-settings",
        summary: "Update notification preferences",
        tags: ["Notification Settings"],
        security: [["sanctum" => []]]
    )]
    #[OA\RequestBody(
        required: true,
        content: new OA\JsonContent(
            properties: [
                new OA\Property(property: "preferences", type: "object")
            ]
        )
    )]
    #[OA\Response(response: 200, description: "Success")]
    public function update(Request $request)
    {
        $request->validate([
            'preferences' => 'required|array',
        ]);

        $user = $request->user();
        $user->notification_preferences = $request->preferences;
        $user->save();

        return response()->json([
            'message' => 'Notification preferences updated successfully',
            'preferences' => $user->notification_preferences,
        ]);
    }
}
