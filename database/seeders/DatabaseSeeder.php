<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Service;
use App\Models\AgentProfile;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Create Services
        $services = [
            ['name' => 'Home Cleaning', 'slug' => 'home-cleaning', 'category' => 'CLEANING', 'base_price' => 8000, 'icon' => 'Sparkles', 'description' => 'Professional home cleaning including dusting, vacuuming, and mopping.'],
            ['name' => 'AC Maintenance', 'slug' => 'ac-maintenance', 'category' => 'REPAIR', 'base_price' => 12000, 'icon' => 'Wind', 'description' => 'Full service for split and window AC units.'],
            ['name' => 'Plumbing Works', 'slug' => 'plumbing-works', 'category' => 'REPAIR', 'base_price' => 5000, 'icon' => 'Droplets', 'description' => 'Fixing leaks, toilets, and water heaters.'],
            ['name' => 'Laundry & Ironing', 'slug' => 'laundry-ironing', 'category' => 'CLEANING', 'base_price' => 4500, 'icon' => 'Shirt', 'description' => 'Wash and press services with pickup and delivery.'],
            ['name' => 'Generator Repair', 'slug' => 'generator-repair', 'category' => 'REPAIR', 'base_price' => 15000, 'icon' => 'Zap', 'description' => 'Servicing for Mikano, Perkins, and smaller gasoline generators.'],
            ['name' => 'Gardening', 'slug' => 'gardening', 'category' => 'CLEANING', 'base_price' => 7000, 'icon' => 'Leaf', 'description' => 'Hedge trimming, lawn mowing, and general garden maintenance.'],
        ];

        $serviceModels = [];
        foreach ($services as $svc) {
            $serviceModels[] = Service::updateOrCreate(['slug' => $svc['slug']], $svc);
        }

        // 2. Create Clients
        User::updateOrCreate(
            ['email' => 'client@forafix.com'],
            [
                'name' => 'Chijioke Newman',
                'password' => bcrypt('password'),
                'role' => 'CLIENT',
                'loyalty_points' => 150,
                'uuid' => (string) Str::uuid(),
            ]
        );

        // 3. Create a Test Agent
        $agentUser = User::updateOrCreate(
            ['email' => 'agent@forafix.com'],
            [
                'name' => 'Test Agent',
                'password' => bcrypt('password'),
                'role' => 'AGENT',
                'is_vetted' => true,
                'balance' => 10000,
                'uuid' => (string) Str::uuid(),
            ]
        );

        AgentProfile::updateOrCreate(
            ['user_id' => $agentUser->id],
            [
                'bio' => 'Top-rated service provider in Abuja.',
                'skills' => 'Home Cleaning, AC Maintenance',
                'location_base' => 'Maitama, Abuja',
                'is_available' => true,
            ]
        );

        // Attach to first service
        if (!empty($serviceModels)) {
            $agentUser->services()->sync([$serviceModels[0]->id]);
        }
    }
}
