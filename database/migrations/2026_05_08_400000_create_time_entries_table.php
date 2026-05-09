<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('time_entries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('task_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->integer('minutes');
            $table->date('logged_on');
            $table->text('description')->nullable();
            $table->timestamps();
            $table->index(['task_id', 'logged_on']);
        });
    }
    public function down(): void {
        Schema::dropIfExists('time_entries');
    }
};
