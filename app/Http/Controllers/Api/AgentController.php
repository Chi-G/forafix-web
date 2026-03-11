<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

use OpenApi\Attributes as OA;

#[OA\Tag(name: "Agents", description: "Vetted service professional management")]
class AgentController extends Controller
{
    #[OA\Get(
        path: "/api/agents",
        summary: "List vetted agents with optional filters",
        tags: ["Agents"]
    )]
    #[OA\Parameter(name: "category", in: "query", schema: new OA\Schema(type: "string"))]
    #[OA\Parameter(name: "location", in: "query", schema: new OA\Schema(type: "string"))]
    #[OA\Response(response: 200, description: "Success")]
    public function index(Request $request)
    {
        $query = User::where('role', 'AGENT')
            ->with(['agentProfile', 'services'])
            ->where('is_vetted', true);

        if ($request->has('category')) {
            $query->whereHas('services', function ($q) use ($request) {
                $q->where('category', 'like', '%' . $request->category . '%')
                  ->orWhere('slug', 'like', '%' . strtolower($request->category) . '%')
                  ->orWhere('name', 'like', '%' . $request->category . '%');
            });
        }

        if ($request->has('location')) {
            $query->whereHas('agentProfile', function ($q) use ($request) {
                $q->where('location_base', 'like', '%' . $request->location . '%');
            });
        }
        
        return response()->json($query->get());
    }

    #[OA\Get(
        path: "/api/agents/{uuid}",
        summary: "Get specific agent by UUID",
        tags: ["Agents"]
    )]
    #[OA\Parameter(name: "uuid", in: "path", required: true, schema: new OA\Schema(type: "string", format: "uuid"))]
    #[OA\Response(response: 200, description: "Success")]
    public function show($uuid)
    {
        $agent = User::where('uuid', $uuid)
            ->where('role', 'AGENT')
            ->with(['agentProfile', 'services'])
            ->firstOrFail();
            
        return response()->json($agent);
    }

    #[OA\Post(
        path: "/api/agent/profile",
        summary: "Update agent-specific profile details",
        tags: ["Agents"],
        security: [["sanctum" => []]]
    )]
    #[OA\RequestBody(
        required: true,
        content: new OA\JsonContent(
            properties: [
                new OA\Property(property: "bio", type: "string"),
                new OA\Property(property: "is_available", type: "boolean"),
                new OA\Property(property: "location_base", type: "string")
            ]
        )
    )]
    #[OA\Response(response: 200, description: "Success")]
    public function update(\App\Http\Requests\UpdateAgentProfileRequest $request)
    {
        $user = $request->user();
        $profile = $user->agentProfile;
        
        if (!$profile) {
            return response()->json(['message' => 'Agent profile not found'], 404);
        }

        $profile->update($request->validated());

        return response()->json($user->load('agentProfile'));
    }

    #[OA\Post(
        path: "/api/agents/{agentId}/preferred",
        summary: "Toggle agent in user's preferred list",
        tags: ["Agents"],
        security: [["sanctum" => []]]
    )]
    #[OA\Parameter(name: "agentId", in: "path", required: true, schema: new OA\Schema(type: "integer"))]
    #[OA\Response(response: 200, description: "Success")]
    public function togglePreferred(Request $request, $agentId)
    {
        $user = $request->user();
        $agent = User::where('id', $agentId)->where('role', 'AGENT')->firstOrFail();

        $user->preferredAgents()->toggle($agent->id);

        $isPreferred = $user->preferredAgents()->where('agent_id', $agentId)->exists();

        return response()->json([
            'message' => $isPreferred ? 'Added to preferred' : 'Removed from preferred',
            'is_preferred' => $isPreferred
        ]);
    }
}
