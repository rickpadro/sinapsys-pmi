<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('risks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->cascadeOnDelete();
            $table->string('code', 10);
            $table->string('name');
            $table->text('description');
            $table->enum('probability', ['low','medium','high'])->default('medium');
            $table->enum('impact', ['low','medium','high','critical'])->default('medium');
            $table->enum('status', ['open','mitigated','materialized','closed'])->default('open');
            $table->text('mitigation_plan')->nullable();
            $table->foreignId('owner_id')->nullable()->constrained('users')->nullOnDelete();
            $table->date('identified_on');
            $table->date('closed_on')->nullable();
            $table->timestamps();
            $table->unique(['project_id', 'code']);
            $table->index(['project_id', 'status']);
        });
    }
    public function down(): void { Schema::dropIfExists('risks'); }
};
