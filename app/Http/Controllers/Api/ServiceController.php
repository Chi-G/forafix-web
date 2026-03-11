<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Service;
use Illuminate\Http\Request;

use OpenApi\Attributes as OA;

#[OA\Tag(name: "Services", description: "Service categories and catalog")]
class ServiceController extends Controller
{
    #[OA\Get(
        path: "/api/services",
        summary: "List all service categories",
        tags: ["Services"]
    )]
    #[OA\Response(response: 200, description: "Success")]
    public function index()
    {
        return response()->json(Service::all());
    }

    #[OA\Get(
        path: "/api/services/{slug}",
        summary: "Get specific service by slug",
        tags: ["Services"]
    )]
    #[OA\Parameter(name: "slug", in: "path", required: true, schema: new OA\Schema(type: "string"))]
    #[OA\Response(response: 200, description: "Success")]
    public function show($slug)
    {
        $service = Service::where('slug', $slug)->with('agents.agentProfile')->firstOrFail();
        return response()->json($service);
    }
}
