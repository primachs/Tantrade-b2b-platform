<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('outcome_signals', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('session_id');
            $table->uuid('seller_id');
            $table->enum('outcome', ['DEAL_CONFIRMED', 'NO_AGREEMENT', 'NO_RESPONSE', 'OUT_OF_SCOPE', 'MOVED_OFF_PLATFORM', 'DISPUTED']);
            $table->float('confidence_score');
            $table->timestamp('created_at')->useCurrent();

            $table->foreign('session_id')->references('id')->on('engagement_sessions')->cascadeOnDelete();
            $table->foreign('seller_id')->references('id')->on('businesses')->cascadeOnDelete();
            $table->index('seller_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('outcome_signals');
    }
};
