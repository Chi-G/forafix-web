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

        // 3. Create 40 Agents (20 per category)
        $abujaDistricts = ['Maitama', 'Asokoro', 'Wuse 2', 'Garki 1', 'Garki 2', 'Jabi', 'Utako', 'Guzape', 'Lugbe', 'Kubwa', 'Gwarinpa', 'Apo'];
        $cleaningSkills = ['Deep Cleaning', 'Organization', 'Laundry', 'Ironing', 'Gardening', 'Window Cleaning'];
        $repairSkills = ['AC Repair', 'Plumbing', 'Electrical', 'Wiring', 'Generator Servicing', 'Painting'];

        $categories = [
            'CLEANING' => 20,
            'REPAIR' => 20
        ];

        foreach ($categories as $categoryType => $count) {
            $relevantServices = array_filter($serviceModels, fn($s) => $s->category === $categoryType);
            
            for ($i = 1; $i <= $count; $i++) {
                $name = fake()->name();
                $email = strtolower(str_replace(' ', '.', $name)) . $i . "@forafix.com";
                
                $agent = User::create([
                    'name' => $name,
                    'email' => $email,
                    'password' => bcrypt('password'),
                    'role' => 'AGENT',
                    'is_vetted' => fake()->boolean(80), // 80% chance being vetted
                    'balance' => fake()->randomFloat(2, 5000, 100000),
                    'uuid' => (string) Str::uuid(),
                ]);

                $district = $abujaDistricts[array_rand($abujaDistricts)];
                $skillsArray = $categoryType === 'CLEANING' 
                    ? fake()->randomElements($cleaningSkills, 3) 
                    : fake()->randomElements($repairSkills, 3);

                AgentProfile::create([
                    'user_id' => $agent->id,
                    'bio' => fake()->paragraph(),
                    'skills' => implode(', ', $skillsArray),
                    'location_base' => "$district, Abuja",
                    'is_available' => true,
                ]);

                // Attach to 1-2 relevant services
                $agentServices = fake()->randomElements($relevantServices, fake()->numberBetween(1, 2));
                foreach ($agentServices as $svc) {
                    $agent->services()->attach($svc->id);
                }
            }
        }
    }
}
