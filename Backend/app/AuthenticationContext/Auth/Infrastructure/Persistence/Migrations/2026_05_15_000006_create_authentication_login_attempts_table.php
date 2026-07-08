<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('auth_login_attempts', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->uuid('user_id')->nullable();
            $table->string('email');
            $table->string('ip', 45);
            $table->text('user_agent')->nullable();
            $table->boolean('success');
            $table->timestamp('created_at')->useCurrent();

            $table->index('email');
            $table->index('user_id');
            $table->foreign('user_id')->references('id')->on('auth_users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('auth_login_attempts');
    }
};
