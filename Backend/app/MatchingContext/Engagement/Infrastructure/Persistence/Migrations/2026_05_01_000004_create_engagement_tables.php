<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('engagement_sessions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('rfs_id');
            $table->uuid('buyer_id');
            $table->uuid('seller_id');
            $table->enum('status', ['INITIATED', 'ACCEPTED', 'REJECTED', 'ACTIVE', 'STALLED', 'CLOSED']);
            $table->enum('outcome', ['DEAL_CONFIRMED', 'NO_AGREEMENT', 'NO_RESPONSE', 'OUT_OF_SCOPE', 'MOVED_OFF_PLATFORM', 'DISPUTED'])->nullable();
            $table->float('confidence_score')->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('closed_at')->nullable();

            $table->foreign('rfs_id')->references('id')->on('rfs')->cascadeOnDelete();
            $table->foreign('buyer_id')->references('id')->on('businesses')->cascadeOnDelete();
            $table->foreign('seller_id')->references('id')->on('businesses')->cascadeOnDelete();
            $table->index('status');
        });

        Schema::create('session_reports', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('session_id');
            $table->enum('reported_by', ['BUYER', 'SELLER']);
            $table->enum('outcome', ['DEAL_CONFIRMED', 'NO_AGREEMENT', 'NO_RESPONSE', 'OUT_OF_SCOPE', 'MOVED_OFF_PLATFORM', 'DISPUTED']);
            $table->timestamp('created_at')->useCurrent();

            $table->foreign('session_id')->references('id')->on('engagement_sessions')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('session_reports');
        Schema::dropIfExists('engagement_sessions');
    }
};
