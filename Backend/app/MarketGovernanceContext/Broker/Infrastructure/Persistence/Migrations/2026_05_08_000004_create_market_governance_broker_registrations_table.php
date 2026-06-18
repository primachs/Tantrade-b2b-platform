<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('broker_registrations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('market_id');
            $table->enum('broker_type', [
                'PRODUCE_BROKER',
                'LIVESTOCK_BROKER',
                'FREIGHT_BROKER',
                'EXPORT_BROKER',
                'IMPORT_BROKER',
                'COMMISSION_AGENT',
            ]);
            // Person identity fields — brokers are standalone data entries
            $table->string('first_name');
            $table->string('middle_name')->nullable();
            $table->string('surname');
            $table->string('nida_number')->nullable();
            $table->string('mobile')->nullable();
            $table->string('address')->nullable();
            $table->enum('status', ['ACTIVE', 'INACTIVE'])->default('ACTIVE');
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();

            $table->foreign('market_id')->references('id')->on('markets')->cascadeOnDelete();
            $table->index(['market_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('broker_registrations');
    }
};

