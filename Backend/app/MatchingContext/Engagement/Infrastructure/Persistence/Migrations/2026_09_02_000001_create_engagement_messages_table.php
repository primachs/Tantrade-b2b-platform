<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('engagement_messages', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('session_id');
            $table->uuid('sender_business_id');
            $table->text('body');
            $table->timestamp('created_at')->useCurrent();

            $table->foreign('session_id')->references('id')->on('engagement_sessions')->cascadeOnDelete();
            $table->foreign('sender_business_id')->references('id')->on('businesses')->cascadeOnDelete();
            $table->index(['session_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('engagement_messages');
    }
};