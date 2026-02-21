<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class ServiceFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => $this->faker->word . ' Service',
            'category' => $this->faker->word,
            'description' => $this->faker->sentence,
            'base_price' => $this->faker->randomFloat(2, 2000, 20000),
            'icon' => $this->faker->word,
        ];
    }
}
