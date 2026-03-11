<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

use OpenApi\Attributes as OA;

#[OA\Tag(name: "Notifications", description: "In-app notification management")]
class NotificationController extends Controller
{
    #[OA\Get(
        path: "/api/users/notifications",
        summary: "List authenticated user notifications",
        tags: ["Notifications"],
        security: [["sanctum" => []]]
    )]
    #[OA\Response(response: 200, description: "Success")]
    public function index(Request $request)
    {
        $notifications = $request->user()->notifications()
            ->latest()
            ->paginate(20);

        return response()->json($notifications);
    }

    #[OA\Post(
        path: "/api/users/notifications/read-all",
        summary: "Mark all notifications as read",
        tags: ["Notifications"],
        security: [["sanctum" => []]]
    )]
    #[OA\Response(response: 200, description: "Success")]
    public function markAllAsRead(Request $request)
    {
        $request->user()->unreadNotifications()
            ->update(['read_at' => now()]);

        return response()->json(['message' => 'All notifications marked as read']);
    }

    #[OA\Post(
        path: "/api/users/notifications/{uuid}/read",
        summary: "Mark specific notification as read",
        tags: ["Notifications"],
        security: [["sanctum" => []]]
    )]
    #[OA\Parameter(name: "uuid", in: "path", required: true, schema: new OA\Schema(type: "string", format: "uuid"))]
    #[OA\Response(response: 200, description: "Success")]
    public function markAsRead(Request $request, $uuid)
    {
        $notification = $request->user()->notifications()
            ->where('uuid', $uuid)
            ->firstOrFail();

        $notification->update(['read_at' => now()]);

        return response()->json($notification);
    }

    #[OA\Delete(
        path: "/api/users/notifications",
        summary: "Clear all notifications",
        tags: ["Notifications"],
        security: [["sanctum" => []]]
    )]
    #[OA\Response(response: 200, description: "Success")]
    public function clearAll(Request $request)
    {
        $request->user()->notifications()->delete();

        return response()->json(['message' => 'All notifications cleared']);
    }
}
