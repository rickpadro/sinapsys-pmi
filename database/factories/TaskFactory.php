<?php

namespace Database\Factories;

use App\Models\Project;
use App\Models\Section;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class TaskFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id'    => User::factory(),
            'project_id' => Project::factory(),
            'section_id' => null,
            'name'       => $this->faker->sentence(4),
            'priority'   => $this->faker->numberBetween(1, 4),
            'category'   => $this->faker->randomElement(['personal', 'admin', 'cliente', 'desarrollo', 'soporte']),
            'due_date'   => $this->faker->dateTimeBetween('+1 day', '+30 days')->format('Y-m-d'),
            'estimated_time'   => $this->faker->randomElement([4, 8, 16, 24]),
            'notes'            => $this->faker->sentence(),
            'done'             => false,
            'is_blocker'       => false,
            'on_critical_path' => false,
            'status'           => 'todo',
            'order_in_section' => 0,
        ];
    }

    public function blocker(): static
    {
        return $this->state(['is_blocker' => true]);
    }

    public function done(): static
    {
        return $this->state(['done' => true, 'completed_at' => now()]);
    }
}
