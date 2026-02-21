<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\Service;
use Illuminate\Database\Eloquent\Factories\Factory;

class BookingFactory extends Factory
{
    public function definition(): array
    {
        return [
            'client_id' => User::factory(),
            'agent_id' => User::factory(),
            'service_id' => Service::factory(),
            'status' => 'PENDING',
            'scheduled_at' => $this->faker->dateTimeBetween('now', '+1 month'),
            'address' => $this->faker->address,
            'total_price' => 5000,
            'notes' => $this->faker->sentence,
        ];
    }
}
