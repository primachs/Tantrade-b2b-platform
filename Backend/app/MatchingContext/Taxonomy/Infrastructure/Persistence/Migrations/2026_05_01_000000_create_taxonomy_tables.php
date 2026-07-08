<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('service_categories', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->uuid('parent_id')->nullable();
            $table->unsignedInteger('level');
            $table->boolean('is_active');

            $table->foreign('parent_id')->references('id')->on('service_categories')->nullOnDelete();
        });

        Schema::create('service_types', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->uuid('category_id');
            $table->boolean('is_active');

            $table->foreign('category_id')->references('id')->on('service_categories')->cascadeOnDelete();
        });

        Schema::create('service_attributes', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('service_type_id');
            $table->string('name');

            $table->foreign('service_type_id')->references('id')->on('service_types')->cascadeOnDelete();
        });

        Schema::create('attribute_values', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('attribute_id');
            $table->string('value');

            $table->foreign('attribute_id')->references('id')->on('service_attributes')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('attribute_values');
        Schema::dropIfExists('service_attributes');
        Schema::dropIfExists('service_types');
        Schema::dropIfExists('service_categories');
    }
};
