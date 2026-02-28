<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class LocationController extends Controller
{
    private string $googleMapsUrl;
    private string $apiKey;

    public function __construct()
    {
        $this->googleMapsUrl = config('services.google.maps_url', 'https://maps.googleapis.com/maps/api');
        $this->apiKey = config('services.google.key') ?? '';
    }

    /**
     * Reverse geocode: coordinates → address/area name
     */
    public function reverseGeocode(Request $request)
    {
        $request->validate([
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
        ]);

        $lat = round($request->latitude, 6);
        $lng = round($request->longitude, 6);

        $cacheKey = "geocode_v5:{$lat}:{$lng}";
        
        // Return cached result if specific
        $cached = Cache::get($cacheKey);
        if ($cached && is_array($cached) && isset($cached['area']) && !in_array($cached['area'], ['Unknown', 'Unknown Area', 'Abuja'])) {
            return response()->json($cached);
        }

        $result = [];

        // 1. Google (if API key available)
        if ($this->apiKey) {
            $executed = RateLimiter::attempt(
                "geocoding:{$this->apiKey}",
                100, // per minute
                function () use ($lat, $lng) {
                    $res = $this->fetchFromGoogle($lat, $lng);
                    return $res ? $res->getData(true) : null;
                }
            );
            if (is_array($executed)) {
                $result = $executed;
            }
        }

        // 2. OpenStreetMap if Google was skipped or yielded generic results
        $isGeneric = empty($result) || (isset($result['area']) && in_array($result['area'], ['Abuja', 'Unknown Area', 'Unknown']));
        if ($isGeneric) {
            $osmRes = $this->reverseGeocodeOpenStreetMap($lat, $lng);
            if ($osmRes->getStatusCode() === 200) {
                $osmData = $osmRes->getData(true);
                // Prefer OSM if it's specific
                if ($osmData && isset($osmData['area']) && !in_array($osmData['area'], ['Abuja', 'Unknown Area', 'Unknown'])) {
                    $result = $osmData;
                    $isGeneric = false;
                } else if (empty($result)) {
                    $result = $osmData;
                }
            }
        }

        // 3. Mandatory Database Fallback for Abuja
        if ($isGeneric || (isset($result['area']) && in_array($result['area'], ['Abuja', 'Unknown Area', 'Unknown']))) {
            $city = $result['city'] ?? 'Abuja';
            if (str_contains(strtolower($city), 'abuja')) {
                $nearest = $this->findNearestServiceArea($lat, $lng);
                if ($nearest) {
                    $result['area'] = $nearest->name;
                }
            }
        }

        // Ensure we have basic structure if all else fails
        if (empty($result)) {
            $result = [
                'area' => 'Abuja',
                'city' => 'Abuja',
                'state' => 'FCT',
                'country' => 'Nigeria',
                'formattedAddress' => 'Abuja, Nigeria',
                'coordinates' => ['lat' => $lat, 'lng' => $lng]
            ];
        }

        // Cache named results
        if (isset($result['area']) && !in_array($result['area'], ['Unknown', 'Unknown Area'])) {
            Cache::put($cacheKey, $result, 3600);
        }

        return response()->json($result);
    }

    private function fetchFromGoogle(float $lat, float $lng)
    {
        try {
            $response = Http::timeout(5)->withoutVerifying()->get("{$this->googleMapsUrl}/geocode/json", [
                'latlng' => "{$lat},{$lng}",
                'key' => $this->apiKey,
                'result_type' => 'street_address|route|neighborhood|sublocality|locality|administrative_area_level_2',
                'language' => 'en',
            ]);

            if (!$response->successful() || empty($response['results'])) {
                return null;
            }

            $firstResult = $response['results'][0];
            $components = $this->parseAddressComponents($firstResult['address_components']);
            $city = $components['locality'] ?? $components['administrative_area_level_1'] ?? 'Abuja';
            $area = $components['area'] ?? $components['neighborhood'] ?? null;

            if (str_contains(strtolower($city), 'abuja')) {
                $nearest = $this->findNearestServiceArea($lat, $lng);
                if ($nearest) $area = $nearest->name;
            }

            return response()->json([
                'formattedAddress' => $firstResult['formatted_address'],
                'area' => $area ?? 'Abuja',
                'district' => $components['administrative_area_level_2'] ?? 'Municipal Area Council',
                'city' => $city,
                'state' => $components['administrative_area_level_1'] ?? 'FCT',
                'country' => $components['country'] ?? 'Nigeria',
                'postalCode' => $components['postal_code'] ?? null,
                'coordinates' => ['lat' => $lat, 'lng' => $lng],
                'placeId' => $firstResult['place_id'],
            ]);
        } catch (\Exception $e) {
            Log::error("Google Geocode Fail: " . $e->getMessage());
            return null;
        }
    }

    private function parseAddressComponents(array $components): array
    {
        $parsed = [];
        foreach ($components as $component) {
            foreach ($component['types'] as $type) {
                if (!isset($parsed[$type])) $parsed[$type] = $component['long_name'];
            }
            if (in_array('neighborhood', $component['types']) || in_array('sublocality', $component['types'])) {
                $parsed['area'] = $component['long_name'];
            }
        }
        return $parsed;
    }

    public function reverseGeocodeOpenStreetMap(float $lat, float $lng)
    {
        try {
            $response = Http::timeout(5)->withoutVerifying()->withHeaders([
                'User-Agent' => 'ForaFix/1.0 (contact@forafix.com)'
            ])->get('https://nominatim.openstreetmap.org/reverse', [
                'lat' => $lat,
                'lon' => $lng,
                'format' => 'json',
                'addressdetails' => 1,
            ]);

            $data = $response->json();
            if (!$response->successful() || !$data || isset($data['error'])) {
                return response()->json(['error' => 'Geocode failed'], 404);
            }

            $addr = $data['address'] ?? [];
            $city = $addr['city'] ?? $addr['town'] ?? 'Abuja';
            $area = $addr['suburb'] ?? $addr['neighbourhood'] ?? $addr['village'] ?? $addr['town'] ?? $addr['hamlet'] ?? null;

            if (str_contains(strtolower($city), 'abuja')) {
                $nearest = $this->findNearestServiceArea($lat, $lng);
                if ($nearest) $area = $nearest->name;
            }

            return response()->json([
                'formattedAddress' => $data['display_name'] ?? 'Abuja, Nigeria',
                'area' => $area ?? 'Abuja',
                'district' => $addr['county'] ?? 'Municipal Area Council',
                'city' => $city,
                'state' => $addr['state'] ?? 'FCT',
                'country' => $addr['country'] ?? 'Nigeria',
                'postalCode' => $addr['postcode'] ?? null,
                'coordinates' => ['lat' => $lat, 'lng' => $lng],
                'placeId' => $data['place_id'] ?? null,
            ]);
        } catch (\Exception $e) {
            Log::error("OSM Geocode Fail: " . $e->getMessage());
            return response()->json(['error' => 'Geocode exception'], 500);
        }
    }

    private function findNearestServiceArea(float $lat, float $lng)
    {
        try {
            return DB::table('service_areas')
                ->select('name')
                ->selectRaw("
                    (6371 * acos(cos(radians(?)) * cos(radians(center_lat)) * cos(radians(center_lng) - radians(?)) + sin(radians(?)) * sin(radians(center_lat)))) AS distance
                ", [$lat, $lng, $lat])
                ->where('is_active', true)
                ->orderBy('distance')
                ->first();
        } catch (\Exception $e) {
            Log::error("Nearest search fail: " . $e->getMessage());
            return null;
        }
    }

    public function searchPlaces(Request $request)
    {
        $request->validate(['q' => 'required|string|min:3|max:100']);
        $query = $request->q;

        if ($this->apiKey) {
            $response = Http::get("{$this->googleMapsUrl}/place/autocomplete/json", [
                'input' => $query,
                'key' => $this->apiKey,
                'components' => 'country:ng',
                'location' => '9.0765,7.3986',
                'radius' => 50000,
                'types' => 'geocode|establishment',
                'language' => 'en',
            ]);

            if ($response->successful()) {
                $predictions = collect($response['predictions'] ?? [])->map(function ($place) {
                    return [
                        'id' => $place['place_id'],
                        'placeId' => $place['place_id'],
                        'description' => $place['description'],
                        'mainText' => $place['structured_formatting']['main_text'] ?? '',
                        'secondaryText' => $place['structured_formatting']['secondary_text'] ?? '',
                    ];
                });
                return response()->json(['predictions' => $predictions]);
            }
        }

        return response()->json(['predictions' => []]);
    }

    public function getPlaceDetails(string $placeId)
    {
        if (!$this->apiKey) return response()->json(['error' => 'Google API Key missing'], 400);

        $response = Http::get("{$this->googleMapsUrl}/place/details/json", [
            'place_id' => $placeId,
            'key' => $this->apiKey,
            'fields' => 'geometry,formatted_address,address_component',
        ]);

        if (!$response->successful() || empty($response['result'])) {
            return response()->json(['error' => 'Place not found'], 404);
        }

        $result = $response['result'];
        $location = $result['geometry']['location'];
        $components = $this->parseAddressComponents($result['address_components']);

        return response()->json([
            'latitude' => $location['lat'],
            'longitude' => $location['lng'],
            'address' => $result['formatted_address'],
            'area' => $components['area'] ?? $components['neighborhood'] ?? 'Unknown',
            'district' => $components['administrative_area_level_2'] ?? 'Unknown',
        ]);
    }
}
