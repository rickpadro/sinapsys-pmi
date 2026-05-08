<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            $table->json('steps')->nullable()->after('notes');
        });

        Schema::table('projects', function (Blueprint $table) {
            $table->string('url_xampp')->nullable()->after('color');
            $table->json('links')->nullable()->after('url_xampp');
        });
    }

    public function down(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            $table->dropColumn('steps');
        });

        Schema::table('projects', function (Blueprint $table) {
            $table->dropColumn(['url_xampp', 'links']);
        });
    }
};
