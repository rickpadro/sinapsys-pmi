<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('project_decisions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->cascadeOnDelete();
            $table->string('code', 20);
            $table->string('title');
            $table->text('description');
            $table->enum('status', ['confirmed','pending','rejected'])->default('pending');
            $table->text('blocks_description')->nullable();
            $table->foreignId('blocks_section_id')->nullable()->constrained('sections')->nullOnDelete();
            $table->foreignId('blocks_milestone_id')->nullable()->constrained('milestones')->nullOnDelete();
            $table->foreignId('decided_by')->nullable()->constrained('users')->nullOnDelete();
            $table->date('decided_on')->nullable();
            $table->json('tags')->nullable();
            $table->integer('order')->default(0);
            $table->timestamps();
            $table->unique(['project_id', 'code']);
            $table->index(['project_id', 'status']);
        });
    }
    public function down(): void { Schema::dropIfExists('project_decisions'); }
};
