<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('risk_mitigations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('risk_id')->constrained()->cascadeOnDelete();
            $table->foreignId('task_id')->constrained()->cascadeOnDelete();
            $table->text('rationale')->nullable();
            $table->timestamps();
            $table->unique(['risk_id', 'task_id']);
        });
    }
    public function down(): void { Schema::dropIfExists('risk_mitigations'); }
};
