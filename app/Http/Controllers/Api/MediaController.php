<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class MediaController extends Controller
{
    public function uploadAvatar(Request $request)
    {
        $request->validate([
            'avatar' => 'required|image|mimes:jpeg,png,jpg|max:2048',
        ]);

        $user = $request->user();
        
        if ($request->hasFile('avatar')) {
            // delete old avatar if exists
            if ($user->avatar_url && Storage::disk('public')->exists(str_replace('/storage/', '', $user->avatar_url))) {
                Storage::disk('public')->delete(str_replace('/storage/', '', $user->avatar_url));
            }

            $path = $request->file('avatar')->store('avatars', 'public');
            $user->update(['avatar_url' => Storage::disk('public')->url($path)]);
        }

        return response()->json($user->load('agentProfile'));
    }

    public function uploadVerification(Request $request)
    {
        $request->validate([
            'document' => 'required|file|mimes:pdf,jpeg,png,jpg|max:5120',
        ]);

        $user = $request->user();
        if ($user->role !== 'AGENT') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($request->hasFile('document')) {
            $path = $request->file('document')->store('verification', 'private');
            
            // In a real app, we'd save this path to the agent_profiles table and set a status
            $user->agentProfile->update([
                'is_verified' => false,
            ]);

            // For now, let's just log it or simulate a pending state
            // Log::info("Agent {$user->id} uploaded verification document: {$path}");
        }

        return response()->json(['message' => 'Document uploaded successfully and pending verification.']);
    }
}
