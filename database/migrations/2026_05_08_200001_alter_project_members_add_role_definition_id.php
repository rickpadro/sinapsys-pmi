<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('project_members', function (Blueprint $table) {
            $table->foreignId('role_definition_id')->nullable()
                  ->after('role')
                  ->constrained('project_role_definitions')
                  ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('project_members', function (Blueprint $table) {
            $table->dropForeign(['role_definition_id']);
            $table->dropColumn('role_definition_id');
        });
    }
};
