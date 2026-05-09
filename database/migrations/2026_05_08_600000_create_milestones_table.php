<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('milestones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->text('description')->nullable();
            $table->date('target_date');
            $table->date('actual_date')->nullable();
            $table->enum('status', ['planned','at_risk','met','missed'])->default('planned');
            $table->enum('criticality', ['low','medium','high','critical'])->default('medium');
            $table->string('color', 7)->nullable();
            $table->integer('order')->default(0);
            $table->timestamps();
            $table->index(['project_id', 'target_date']);
        });
    }
    public function down(): void { Schema::dropIfExists('milestones'); }
};
