<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call(DemoProjectSeeder::class);
        $this->call(MethodologyTemplatesSeeder::class);
        $this->call(EfAi360Seeder::class);
    }
}
