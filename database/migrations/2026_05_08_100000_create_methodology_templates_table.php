<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('methodology_templates', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('name');
            $table->text('description')->nullable();
            $table->json('default_sections');
            $table->json('default_fields');
            $table->string('default_view')->default('list');
            $table->json('default_roles');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('methodology_templates');
    }
};
