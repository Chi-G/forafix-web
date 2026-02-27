<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Report;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ReportController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'agent_name'  => 'required|string|max:255',
            'agent_uuid'  => 'nullable|string|max:255',
            'type'        => 'required|string|max:255',
            'description' => 'required|string|min:10',
            'evidence'    => 'nullable|string' // Expecting base64 for now based on frontend
        ]);

        // 1. Verify Agent existence
        if ($request->agent_uuid) {
            $agent = User::where('uuid', $request->agent_uuid)->where('role', 'AGENT')->first();
            if (!$agent) {
                return response()->json([
                    'message' => 'The provided Agent ID/UUID is invalid or does not belong to a registered agent.'
                ], 422);
            }
        } else {
            // Fallback to name search if UUID is not provided
            $agentExists = User::where('name', 'like', '%' . $request->agent_name . '%')
                ->where('role', 'AGENT')
                ->exists();
            
            if (!$agentExists) {
                return response()->json([
                    'message' => "We couldn't find a registered agent named '{$request->agent_name}'."
                ], 422);
            }
        }

        $evidenceUrl = null;

        if ($request->evidence && preg_match('/^data:image\/(\w+);base64,/', $request->evidence, $type)) {
            $data = substr($request->evidence, strpos($request->evidence, ',') + 1);
            $type = strtolower($type[1]); // jpg, png, etc

            if (!in_array($type, ['jpg', 'jpeg', 'png', 'gif'])) {
                return response()->json(['message' => 'Invalid image type'], 422);
            }

            $data = base64_decode($data);

            if ($data === false) {
                return response()->json(['message' => 'Base64 decode failed'], 422);
            }

            $fileName = 'reports/evidence_' . Str::random(10) . '.' . $type;
            Storage::disk('public')->put($fileName, $data);
            $evidenceUrl = Storage::disk('public')->url($fileName);
        }

        $report = Report::create([
            'reporter_id' => $request->user()->id,
            'agent_name' => $request->agent_name,
            'agent_uuid' => $request->agent_uuid,
            'type' => $request->type,
            'description' => $request->description,
            'evidence_url' => $evidenceUrl,
        ]);

        return response()->json([
            'message' => 'Report submitted successfully. Our team will review it shortly.',
            'report' => $report
        ], 201);
    }
}
