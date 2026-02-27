<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StatsController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        
        // Basic counts
        $totalBookings = Booking::where('client_id', $user->id)->count();
        $completedBookings = Booking::where('client_id', $user->id)->where('status', 'COMPLETED')->count();
        
        // Unique agents
        $uniqueAgents = Booking::where('client_id', $user->id)
            ->whereNotNull('agent_id')
            ->distinct('agent_id')
            ->count();
            
        // Recent history
        $recentHistory = Booking::where('client_id', $user->id)
            ->with(['service', 'agent'])
            ->latest()
            ->limit(4)
            ->get()
            ->map(function ($b) {
                $statusColors = [
                    'COMPLETED' => 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400',
                    'PENDING'   => 'bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400',
                    'CANCELLED' => 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400',
                    'ACCEPTED'  => 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400',
                ];
                
                return [
                    'service' => $b->service->name ?? 'Service',
                    'date'    => $b->scheduled_at->format('M d, Y'),
                    'status'  => ucfirst(strtolower($b->status)),
                    'color'   => $statusColors[$b->status] ?? 'bg-neutral-100 text-neutral-600',
                ];
            });

        // Top relationships (agents booked most often)
        $topRelationships = Booking::where('client_id', $user->id)
            ->whereNotNull('agent_id')
            ->select('agent_id', DB::raw('count(*) as jobs_count'))
            ->groupBy('agent_id')
            ->orderByDesc('jobs_count')
            ->limit(3)
            ->with('agent.agentProfile')
            ->get()
            ->map(function ($b) {
                return [
                    'name'    => $b->agent->name,
                    'service' => $b->agent->agentProfile->location_base ?? 'Professional', // Fallback or more specific skill
                    'rating'  => 5, // Simulated for now
                    'jobs'    => $b->jobs_count,
                ];
            });

        return response()->json([
            'stats' => [
                'total_bookings' => $totalBookings,
                'completed'      => $completedBookings,
                'profile_views'  => rand(100, 200), // Simulated
                'unique_agents'  => $uniqueAgents,
            ],
            'recent_history'    => $recentHistory,
            'top_relationships' => $topRelationships,
        ]);
    }
}
