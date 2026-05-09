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
            $table->uuid('person_id');
            $table->uuid('market_id');
            $table->enum('broker_type', [
                'PRODUCE_BROKER',
                'LIVESTOCK_BROKER',
                'FREIGHT_BROKER',
                'EXPORT_BROKER',
                'IMPORT_BROKER',
                'COMMISSION_AGENT',
            ]);
            $table->enum('status', ['ACTIVE', 'INACTIVE']);
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();

            $table->foreign('person_id')->references('id')->on('persons')->cascadeOnDelete();
            $table->foreign('market_id')->references('id')->on('markets')->cascadeOnDelete();
            $table->index(['market_id', 'status']);
            $table->index(['person_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('broker_registrations');
    }
};
