<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::table('sections', function (Blueprint $table) {
            $table->enum('type', ['sprint','discovery','continuous'])
                  ->default('sprint')
                  ->after('status');
            $table->index(['project_id', 'type']);
        });
    }
    public function down(): void {
        Schema::table('sections', function (Blueprint $table) {
            $table->dropIndex(['project_id', 'type']);
            $table->dropColumn('type');
        });
    }
};
