<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rfs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('buyer_id');
            $table->string('title');
            $table->text('description');
            $table->uuid('service_type_id');
            $table->enum('project_size', ['SMALL', 'MEDIUM', 'LARGE']);
            $table->enum('expertise_level', ['BASIC', 'INTERMEDIATE', 'ADVANCED']);
            $table->enum('status', ['DRAFT', 'OPEN', 'MATCHED', 'CLOSED']);
            $table->timestamp('created_at')->useCurrent();

            $table->foreign('buyer_id')->references('id')->on('businesses')->cascadeOnDelete();
            $table->foreign('service_type_id')->references('id')->on('service_types')->cascadeOnDelete();
            $table->index('service_type_id');
        });

        Schema::create('rfs_constraints', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('rfs_id');
            $table->decimal('min_budget', 14, 2)->nullable();
            $table->decimal('max_budget', 14, 2)->nullable();
            $table->date('start_date')->nullable();
            $table->date('deadline')->nullable();
            $table->string('region')->nullable();
            $table->string('district')->nullable();

            $table->foreign('rfs_id')->references('id')->on('rfs')->cascadeOnDelete();
            $table->index(['region', 'district']);
        });

        Schema::create('rfs_preferences', function (Blueprint $table) {
            $table->uuid('rfs_id')->primary();
            $table->float('cost_weight');
            $table->float('quality_weight');
            $table->float('speed_weight');
            $table->float('experience_weight');
            $table->float('location_weight');

            $table->foreign('rfs_id')->references('id')->on('rfs')->cascadeOnDelete();
        });

    }

    public function down(): void
    {
        Schema::dropIfExists('rfs_preferences');
        Schema::dropIfExists('rfs_constraints');
        Schema::dropIfExists('rfs');
    }
};
