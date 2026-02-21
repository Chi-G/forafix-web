<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class AgentController extends Controller
{
    public function index(Request $request)
    {
        $query = User::where('role', 'AGENT')
            ->with(['agentProfile', 'services'])
            ->where('is_vetted', true);

        if ($request->has('category')) {
            $query->whereHas('services', function ($q) use ($request) {
                $q->where('category', $request->category);
            });
        }

        if ($request->has('location')) {
            $query->whereHas('agentProfile', function ($q) use ($request) {
                $q->where('location_base', 'like', '%' . $request->location . '%');
            });
        }
        
        return response()->json($query->get());
    }

    public function show($uuid)
    {
        $agent = User::where('uuid', $uuid)
            ->where('role', 'AGENT')
            ->with(['agentProfile', 'services'])
            ->firstOrFail();
            
        return response()->json($agent);
    }

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
}
