<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tasks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('project_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name');
            $table->tinyInteger('priority')->unsigned()->default(3);
            $table->enum('category', ['personal', 'admin', 'cliente', 'desarrollo', 'soporte'])->default('personal');
            $table->date('due_date')->nullable();
            $table->decimal('estimated_time', 5, 2)->nullable();
            $table->text('notes')->nullable();
            $table->boolean('done')->default(false);
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->index('due_date');
            $table->index('done');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tasks');
    }
};
