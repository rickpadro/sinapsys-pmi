<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProjectFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id'     => User::factory(),
            'name'        => $this->faker->words(3, true),
            'type'        => $this->faker->randomElement(['saas', 'idea', 'negocio', 'cliente', 'interno']),
            'methodology' => $this->faker->randomElement(['pmi', 'scrum', 'custom']),
            'default_view' => 'list',
            'priority'    => $this->faker->numberBetween(1, 4),
            'phase'       => $this->faker->numberBetween(0, 4),
            'impact'      => $this->faker->numberBetween(1, 10),
            'effort'      => $this->faker->numberBetween(1, 10),
            'viability_mercado'    => 5,
            'viability_financiero' => 5,
            'viability_tecnico'    => 5,
            'viability_riesgo'     => 5,
            'color'       => $this->faker->randomElement(['#4A6CF7', '#00CA72', '#FDAB3D', '#E44258', '#1D9E75']),
            'sort_order'  => 0,
        ];
    }
}
