<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('member_capacities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_member_id')->constrained()->cascadeOnDelete();
            $table->foreignId('section_id')->constrained()->cascadeOnDelete();
            $table->decimal('dedication_pct', 5, 2)->default(100.00);
            $table->integer('available_hours_per_week')->default(40);
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->unique(['project_member_id', 'section_id']);
        });
    }
    public function down(): void { Schema::dropIfExists('member_capacities'); }
};
