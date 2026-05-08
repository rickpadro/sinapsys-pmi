<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->string('methodology')->default('pmi')->after('type');
            $table->string('default_view')->default('list')->after('methodology');
            $table->foreignId('template_id')->nullable()->after('default_view')
                  ->constrained('methodology_templates')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->dropConstrainedForeignId('template_id');
            $table->dropColumn(['methodology', 'default_view']);
        });
    }
};
