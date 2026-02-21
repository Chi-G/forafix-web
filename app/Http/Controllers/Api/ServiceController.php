<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Service;
use Illuminate\Http\Request;

class ServiceController extends Controller
{
    public function index()
    {
        return response()->json(Service::all());
    }

    public function show($slug)
    {
        $service = Service::where('slug', $slug)->with('agents.agentProfile')->firstOrFail();
        return response()->json($service);
    }
}
