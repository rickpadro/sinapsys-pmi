<?php

namespace Database\Factories;

use App\Models\Project;
use Illuminate\Database\Eloquent\Factories\Factory;

class SectionFactory extends Factory
{
    public function definition(): array
    {
        return [
            'project_id' => Project::factory(),
            'name'       => $this->faker->words(2, true),
            'type'       => 'sprint',
            'status'     => 'planned',
            'order'      => $this->faker->numberBetween(0, 10),
        ];
    }

    public function sprint(): static
    {
        return $this->state(['type' => 'sprint']);
    }

    public function discovery(): static
    {
        return $this->state(['type' => 'discovery']);
    }

    public function continuous(): static
    {
        return $this->state(['type' => 'continuous']);
    }
}
