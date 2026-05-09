<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('persons', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->unsignedBigInteger('user_id');
            $table->string('nida_number');
            $table->string('first_name');
            $table->string('middle_name')->nullable();
            $table->string('surname');
            $table->enum('gender', ['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']);
            $table->string('mobile');
            $table->string('email');
            $table->text('address');
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();

            $table->unique('user_id');
            $table->unique('nida_number');
            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('persons');
    }
};
