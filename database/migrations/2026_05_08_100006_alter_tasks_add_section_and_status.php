<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            $table->foreignId('section_id')->nullable()->after('project_id')
                  ->constrained()->nullOnDelete();
            $table->integer('order_in_section')->default(0)->after('section_id');
            $table->enum('status', ['todo', 'in_progress', 'done', 'blocked'])
                  ->default('todo')->after('order_in_section');

            $table->index(['section_id', 'order_in_section']);
        });
    }

    public function down(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            $table->dropIndex(['section_id', 'order_in_section']);
            $table->dropConstrainedForeignId('section_id');
            $table->dropColumn(['order_in_section', 'status']);
        });
    }
};
