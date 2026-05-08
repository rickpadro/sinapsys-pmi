<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('projects', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->enum('type', ['saas', 'idea', 'negocio', 'cliente', 'interno']);
            $table->tinyInteger('priority')->unsigned()->default(3);
            $table->tinyInteger('phase')->unsigned()->default(0);
            $table->tinyInteger('impact')->unsigned()->default(5);
            $table->tinyInteger('effort')->unsigned()->default(5);
            $table->text('description')->nullable();
            $table->json('tags')->nullable();
            $table->tinyInteger('viability_mercado')->unsigned()->default(5);
            $table->tinyInteger('viability_financiero')->unsigned()->default(5);
            $table->tinyInteger('viability_tecnico')->unsigned()->default(5);
            $table->tinyInteger('viability_riesgo')->unsigned()->default(5);
            $table->json('phase_tasks')->nullable();
            $table->string('color', 7)->default('#888780');
            $table->timestamps();
            $table->softDeletes();

            $table->index('type');
            $table->index('priority');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('projects');
    }
};
