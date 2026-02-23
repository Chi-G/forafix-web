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
        $clients = [
            ['name' => 'Chijioke Newman', 'email' => 'client@forafix.com'],
            ['name' => 'Sarah Johnson', 'email' => 'sarah@example.com'],
            ['name' => 'Ibrahim Musa', 'email' => 'musa@example.com'],
        ];

        foreach ($clients as $c) {
            User::updateOrCreate(
                ['email' => $c['email']],
                [
                    'name' => $c['name'],
                    'password' => bcrypt('password'),
                    'role' => 'CLIENT',
                    'loyalty_points' => 150,
                    'uuid' => (string) Str::uuid(),
                ]
            );
        }

        // 3. Create Robust Agent Data
        $agentNames = [
            'John Doe', 'Jane Smith', 'David Okoro', 'Blessing Udoh', 
            'Samuel Adeleke', 'Grace Onu', 'Michael Obi', 'Fatima Bello',
            'Emma Wilson', 'Chris Evans', 'Anita Joseph', 'Peter Parker',
            'Bisi Akande', 'Uche Jombo', 'Tunde Ednut', 'Zainab Shuaibu',
            'Oluwatobi Bakre', 'Cynthia Morgan', 'Dapo Oyebanjo', 'Tiwa Savage',
            'Ayodeji Balogun', 'Damini Ogulu', 'Olamide Adedeji', 'Phyno Nelson'
        ];

        $abujaDistricts = ['Maitama', 'Asokoro', 'Wuse 2', 'Garki 1', 'Garki 2', 'Jabi', 'Utako', 'Guzape', 'Lugbe', 'Kubwa', 'Gwarinpa', 'Apo'];
        $cleaningSkills = ['Deep Cleaning', 'Organization', 'Laundry', 'Ironing', 'Gardening', 'Window Cleaning'];
        $repairSkills = ['AC Repair', 'Plumbing', 'Electrical', 'Wiring', 'Generator Servicing', 'Painting'];

        foreach ($agentNames as $index => $name) {
            $isCleaning = $index < 12; // First 12 are cleaning, next 12 are repair
            $categoryType = $isCleaning ? 'CLEANING' : 'REPAIR';
            $email = strtolower(str_replace(' ', '.', $name)) . ($index + 1) . "@forafix.com";
            
            $agent = User::updateOrCreate(
                ['email' => $email],
                [
                    'name' => $name,
                    'password' => bcrypt('password'),
                    'role' => 'AGENT',
                    'is_vetted' => ($index % 3 !== 0), // 66% chance vetted
                    'balance' => 5000 + ($index * 1000),
                    'uuid' => (string) Str::uuid(),
                ]
            );

            $district = $abujaDistricts[$index % count($abujaDistricts)];
            $skills = $isCleaning 
                ? implode(', ', [$cleaningSkills[0], $cleaningSkills[1], $cleaningSkills[($index % 4) + 2]])
                : implode(', ', [$repairSkills[0], $repairSkills[1], $repairSkills[($index % 4) + 2]]);

            AgentProfile::updateOrCreate(
                ['user_id' => $agent->id],
                [
                    'bio' => "Professional $categoryType specialist with over " . (($index % 5) + 2) . " years of experience serving $district and surrounding areas.",
                    'skills' => $skills,
                    'location_base' => "$district, Abuja",
                    'is_available' => true,
                ]
            );

            // Attach to relevant services
            $relevantServices = array_filter($serviceModels, fn($s) => $s->category === $categoryType);
            if (!empty($relevantServices)) {
                $svcIds = array_map(fn($s) => $s->id, array_values($relevantServices));
                $agent->services()->sync([$svcIds[$index % count($svcIds)]]);
            }
        }
    }
}
