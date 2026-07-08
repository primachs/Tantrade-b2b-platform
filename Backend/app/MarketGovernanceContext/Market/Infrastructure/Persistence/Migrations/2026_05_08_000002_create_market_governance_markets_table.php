<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('markets', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('market_name');
            $table->string('region');
            $table->string('district');
            $table->string('ward')->nullable();
            $table->text('address');
            $table->enum('status', ['ACTIVE', 'INACTIVE']);
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();

            $table->index(['region', 'district']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('markets');
    }
};
