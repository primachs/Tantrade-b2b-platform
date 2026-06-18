<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('market_offices', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('market_id');
            $table->enum('office_type', ['CHAIRPERSON']);
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();

            $table->unique(['market_id', 'office_type']);
            $table->foreign('market_id')->references('id')->on('markets')->cascadeOnDelete();
        });

        Schema::create('office_terms', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('office_id');
            $table->uuid('user_id');
            $table->date('start_date');
            $table->date('end_date');
            $table->enum('status', ['ACTIVE', 'ENDED']);
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();

            $table->foreign('office_id')->references('id')->on('market_offices')->cascadeOnDelete();
            $table->foreign('user_id')->references('id')->on('auth_users')->cascadeOnDelete();
            $table->index(['office_id', 'status']);
            $table->index(['user_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('office_terms');
        Schema::dropIfExists('market_offices');
    }
};
