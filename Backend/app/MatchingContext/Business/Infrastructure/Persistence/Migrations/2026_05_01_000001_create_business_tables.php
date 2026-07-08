<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('businesses', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('contact_person');
            $table->string('phone');
            $table->string('email');
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();
        });

        Schema::create('business_verification', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('business_id');
            $table->string('tin_number');
            $table->string('brela_number');
            $table->enum('business_size', ['SMALL', 'MEDIUM', 'LARGE']);
            $table->boolean('is_owner');
            $table->enum('owner_gender', ['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']);
            $table->unsignedInteger('employee_count');
            $table->enum('revenue_range', ['BELOW_50M', 'BETWEEN_50M_500M', 'BETWEEN_500M_5B', 'ABOVE_5B']);
            $table->string('region');
            $table->string('district');
            $table->text('address');
            $table->enum('verification_status', ['UNVERIFIED', 'PARTIALLY_VERIFIED', 'VERIFIED']);

            $table->foreign('business_id')->references('id')->on('businesses')->cascadeOnDelete();
            $table->index(['region', 'district']);
        });

        Schema::create('business_capabilities', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('business_id');
            $table->uuid('service_type_id');

            $table->foreign('business_id')->references('id')->on('businesses')->cascadeOnDelete();
            $table->foreign('service_type_id')->references('id')->on('service_types')->cascadeOnDelete();
            $table->index('service_type_id');
        });

        Schema::create('business_capability_attributes', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('capability_id');
            $table->uuid('attribute_id');
            $table->string('value');

            $table->foreign('capability_id')->references('id')->on('business_capabilities')->cascadeOnDelete();
            $table->foreign('attribute_id')->references('id')->on('service_attributes')->cascadeOnDelete();
        });

        Schema::create('business_trust_metrics', function (Blueprint $table) {
            $table->uuid('business_id')->primary();
            $table->float('reliability_score');
            $table->float('success_rate');
            $table->float('response_rate');
            $table->float('dispute_rate');
            $table->float('avg_response_time')->nullable();
            $table->float('session_completion_rate')->nullable();

            $table->foreign('business_id')->references('id')->on('businesses')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('business_trust_metrics');
        Schema::dropIfExists('business_capability_attributes');
        Schema::dropIfExists('business_capabilities');
        Schema::dropIfExists('business_verification');
        Schema::dropIfExists('businesses');
    }
};
