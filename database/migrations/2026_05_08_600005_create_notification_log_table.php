<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('notification_log', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('type');
            $table->json('payload');
            $table->boolean('success')->default(false);
            $table->integer('response_code')->nullable();
            $table->string('error_reason')->nullable();
            $table->timestamps();
            $table->index(['user_id', 'type', 'created_at']);
        });
    }
    public function down(): void { Schema::dropIfExists('notification_log'); }
};
