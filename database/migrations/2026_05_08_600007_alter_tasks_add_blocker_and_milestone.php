<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::table('tasks', function (Blueprint $table) {
            $table->foreignId('linked_milestone_id')->nullable()
                  ->after('section_id')
                  ->constrained('milestones')->nullOnDelete();
            $table->boolean('is_blocker')->default(false)->after('status');
            $table->boolean('on_critical_path')->default(false)->after('is_blocker');
            $table->index(['project_id', 'is_blocker']);
            $table->index(['project_id', 'on_critical_path']);
        });
    }
    public function down(): void {
        Schema::table('tasks', function (Blueprint $table) {
            $table->dropForeign(['linked_milestone_id']);
            $table->dropIndex(['project_id', 'is_blocker']);
            $table->dropIndex(['project_id', 'on_critical_path']);
            $table->dropColumn(['linked_milestone_id', 'is_blocker', 'on_critical_path']);
        });
    }
};
