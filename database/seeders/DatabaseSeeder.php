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
        // 0. Cleanup old services
        Service::truncate();

        // 1. Create Services first
        $services = [
            ['name' => 'Home Cleaning', 'category' => 'Cleaning', 'price' => 25000, 'icon' => 'Sparkles'],
            ['name' => 'Laundry & Ironing', 'category' => 'Cleaning', 'price' => 15000, 'icon' => 'Wind'],
            ['name' => 'AC Maintenance', 'category' => 'Repairs', 'price' => 12000, 'icon' => 'Wind'],
            ['name' => 'Plumbing Works', 'category' => 'Repairs', 'price' => 8000, 'icon' => 'Droplets'],
            ['name' => 'Generator Repair', 'category' => 'Repairs', 'price' => 20000, 'icon' => 'Settings'],
            ['name' => 'Gardening', 'category' => 'Maintenance', 'price' => 10000, 'icon' => 'Sprout'],
        ];

        $allServices = [];
        foreach ($services as $s) {
            $allServices[] = Service::updateOrCreate(
                ['name' => $s['name']],
                [
                    'category' => strtoupper($s['category']),
                    'description' => "Professional {$s['name']} services for your home and office.",
                    'base_price' => $s['price'],
                    'icon' => $s['icon'],
                ]
            );
        }

        // 2. Create Admin
        User::updateOrCreate(
            ['email' => 'admin@forafix.com'],
            [
                'name' => 'Admin User',
                'password' => bcrypt('password'),
                'role' => 'ADMIN',
                'balance' => 0.00,
                'uuid' => (string) Str::uuid(),
            ]
        );

        // 3. Create Clients (10)
        $clientNames = ['Chijioke', 'Sarah', 'Ibrahim', 'Emeka', 'Amaka', 'Tunde', 'Ngozi', 'Musa', 'Fatima', 'Bisi'];
        $lastNames = ['Newman', 'Johnson', 'Musa', 'Okonkwo', 'Bello', 'Adeyemi', 'Gidado', 'Umar', 'Ahmed', 'Balogun'];

        for ($i = 0; $i < 10; $i++) {
            User::updateOrCreate(
                ['email' => "client{$i}@forafix.com"],
                [
                    'name' => "{$clientNames[$i]} {$lastNames[$i]}",
                    'password' => bcrypt('password'),
                    'role' => 'CLIENT',
                    'loyalty_points' => rand(50, 500),
                    'balance' => rand(0, 10000),
                    'uuid' => (string) Str::uuid(),
                ]
            );
        }

        // 4. Create Agents (70)
        $districts = ['Maitama', 'Wuse 2', 'Asokoro', 'Garki', 'Guzape', 'Jabi', 'Utako', 'Lugbe', 'Kubwa', 'Gwarinpa'];
        $firstNames = ['Kene', 'Zainab', 'Chidi', 'Aminu', 'Joy', 'Samuel', 'Blessing', 'David', 'Grace', 'Victor', 'Esther', 'Peter', 'Ruth', 'John', 'Mercy', 'Ade', 'Kemi', 'Yusuf', 'Halima', 'Tochi'];
        
        $agentBios = [
            "Certified professional with over 5 years of experience in high-end service delivery.",
            "Dedicated specialist focused on detail and customer satisfaction in various Abuja districts.",
            "Hardworking and reliable expert ready to tackle any cleaning or repair challenge.",
            "Punctual and efficient professional catering to residential and corporate clients.",
            "Committed to excellence with a track record of top-rated service delivery in Nigeria.",
        ];

        $agentCount = 1;
        foreach ($districts as $district) {
            for ($j = 0; $j < 7; $j++) { // 10 districts * 7 agents = 70 agents
                $firstName = $firstNames[rand(0, count($firstNames) - 1)];
                $lastName = $lastNames[rand(0, count($lastNames) - 1)];
                $name = "{$firstName} {$lastName}";
                $email = strtolower($firstName . "." . $lastName . "." . $agentCount . "@forafix.com");

                $agent = User::updateOrCreate(
                    ['email' => $email],
                    [
                        'name' => $name,
                        'password' => bcrypt('password'),
                        'role' => 'AGENT',
                        'is_vetted' => (bool)rand(0, 1),
                        'balance' => rand(1000, 50000),
                        'uuid' => (string) Str::uuid(),
                    ]
                );

                // Create Profile
                AgentProfile::updateOrCreate(
                    ['user_id' => $agent->id],
                    [
                        'bio' => $agentBios[rand(0, count($agentBios) - 1)],
                        'location_base' => $district,
                        'skills' => ['Punctuality', 'Efficiency', 'Quality Work'],
                        'is_available' => true,
                        'avatar_url' => "https://ui-avatars.com/api/?name=" . urlencode($name) . "&background=random",
                    ]
                );

                // Assign 1-3 random services
                $randomServiceKeys = array_rand($allServices, rand(1, 3));
                if (is_array($randomServiceKeys)) {
                    foreach ($randomServiceKeys as $idx) {
                        $agent->services()->syncWithoutDetaching([$allServices[$idx]->id]);
                    }
                } else {
                    $agent->services()->syncWithoutDetaching([$allServices[$randomServiceKeys]->id]);
                }

                $agentCount++;
            }
        }
    }
}
