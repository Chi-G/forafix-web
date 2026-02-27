<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Session;
use Carbon\Carbon;

class SessionController extends Controller
{
    /**
     * Get all active sessions for the current user.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $allSessions = collect();

        // 1. Get database sessions (if any)
        $dbSessions = DB::table('sessions')
            ->where('user_id', $user->id)
            ->get();

        foreach ($dbSessions as $s) {
            $isCurrent = $s->id === Session::getId();
            $allSessions->push([
                'id' => $s->id,
                'ip_address' => $s->ip_address,
                'user_agent' => $s->user_agent,
                'last_activity' => $s->last_activity,
                'is_current' => $isCurrent,
                'device' => $this->parseUserAgent($s->user_agent),
                'location' => $this->getLocation($s->ip_address),
                'time' => Carbon::createFromTimestamp($s->last_activity)->diffForHumans(),
                'type' => 'session'
            ]);
        }

        // 2. Get Sanctum tokens
        $tokens = $user->tokens()
            ->orderBy('last_used_at', 'desc')
            ->get();

        $currentTokenId = $user->currentAccessToken() ? $user->currentAccessToken()->id : null;

        foreach ($tokens as $t) {
            $isCurrent = $currentTokenId === $t->id;
            
            // Use stored metadata from the migration, fallback to name if missing (for old tokens)
            $ua = $t->user_agent ?: ($isCurrent ? $request->userAgent() : null);
            $ip = $t->ip_address ?: ($isCurrent ? $request->ip() : null);

            $allSessions->push([
                'id' => 'token_' . $t->id,
                'ip_address' => $ip ?: 'Unknown IP',
                'user_agent' => $ua ?: 'Unknown Device',
                'last_activity' => $t->last_used_at ? $t->last_used_at->timestamp : $t->created_at->timestamp,
                'is_current' => $isCurrent,
                'device' => $ua ? $this->parseUserAgent($ua) : ($t->name === 'auth_token' ? 'Previous Session' : $t->name),
                'location' => $this->getLocation($ip),
                'time' => $t->last_used_at ? $t->last_used_at->diffForHumans() : 'Created ' . $t->created_at->diffForHumans(),
                'type' => 'token'
            ]);
        }

        // Sort by last activity and return unique (by ID)
        return response()->json($allSessions->sortByDesc('last_activity')->unique('id')->values());
    }

    /**
     * Revoke a specific session or token.
     */
    public function destroy(Request $request, $id)
    {
        $user = $request->user();

        if (strpos($id, 'token_') === 0) {
            $tokenId = substr($id, 6);
            $token = $user->tokens()->find($tokenId);
            
            if (!$token) {
                return response()->json(['message' => 'Session not found.'], 404);
            }

            if ($user->currentAccessToken() && $token->id === $user->currentAccessToken()->id) {
                return response()->json(['message' => 'Cannot revoke current session.'], 400);
            }

            $token->delete();
            return response()->json(['message' => 'Session revoked successfully.']);
        }

        // Handle DB Session
        if ($id === Session::getId()) {
            return response()->json(['message' => 'Cannot revoke current session.'], 400);
        }

        $deleted = DB::table('sessions')
            ->where('id', $id)
            ->where('user_id', $user->id)
            ->delete();

        if ($deleted) {
            return response()->json(['message' => 'Session revoked successfully.']);
        }

        return response()->json(['message' => 'Session not found.'], 404);
    }

    /**
     * Revoke all other sessions and tokens.
     */
    public function revokeOthers(Request $request)
    {
        $user = $request->user();
        $currentTokenId = $user->currentAccessToken() ? $user->currentAccessToken()->id : null;
        $currentSessionId = Session::getId();

        // Delete all tokens except current
        if ($currentTokenId) {
            $user->tokens()->where('id', '!=', $currentTokenId)->delete();
        } else {
            $user->tokens()->delete();
        }

        // Delete all sessions except current
        DB::table('sessions')
            ->where('user_id', $user->id)
            ->where('id', '!=', $currentSessionId)
            ->delete();

        return response()->json(['message' => 'All other sessions have been revoked.']);
    }

    /**
     * Basic user agent parsing.
     */
    private function parseUserAgent($ua)
    {
        if (!$ua || $ua === 'Unknown Device') return 'Unknown Device';

        if (preg_match('/(iPhone|iPad|iPod)/i', $ua)) {
            $device = 'iOS Device';
        } elseif (preg_match('/Android/i', $ua)) {
            $device = 'Android Device';
        } elseif (preg_match('/Mobile/i', $ua)) {
            $device = 'Mobile Device';
        } elseif (preg_match('/Macintosh/i', $ua)) {
            $device = 'macOS';
        } elseif (preg_match('/Windows/i', $ua)) {
            $device = 'Windows';
        } elseif (preg_match('/Linux/i', $ua)) {
            $device = 'Linux';
        } else {
            $device = 'Desktop';
        }

        if (preg_match('/Chrome/i', $ua)) {
            $browser = 'Chrome';
        } elseif (preg_match('/Safari/i', $ua)) {
            $browser = 'Safari';
        } elseif (preg_match('/Firefox/i', $ua)) {
            $browser = 'Firefox';
        } elseif (preg_match('/Edge/i', $ua)) {
            $browser = 'Edge';
        } else {
            $browser = 'Browser';
        }

        return "$browser on $device";
    }

    /**
     * Get location from IP address.
     */
    private function getLocation($ip)
    {
        if (!$ip || $ip === 'Unknown IP') return 'Unknown Location';
        
        if ($ip === '127.0.0.1' || $ip === '::1') {
            return 'Localhost';
        }
        
        if (strpos($ip, '192.168.') === 0 || strpos($ip, '10.') === 0) {
            return 'Local Network';
        }

        // Since we are in local development, most IPs will be local.
        // For production, this is where a GeoIP provider would be used.
        return 'Remote Location';
    }
}
