<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('project_members', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('invited_by')->nullable()->constrained('users')->nullOnDelete();
            $table->enum('role', ['manager', 'contributor', 'viewer'])->default('contributor');
            $table->string('invitation_email');
            $table->string('invitation_token', 64)->nullable()->unique();
            $table->timestamp('accepted_at')->nullable();
            $table->timestamps();
            $table->unique(['project_id', 'invitation_email']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('project_members');
    }
};
