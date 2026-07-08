<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('match_shortlists', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('rfs_id');
            $table->timestamp('created_at')->useCurrent();

            $table->foreign('rfs_id')->references('id')->on('rfs')->cascadeOnDelete();
        });

        Schema::create('match_candidates', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('shortlist_id');
            $table->uuid('seller_id');
            $table->float('score');
            $table->unsignedInteger('rank');

            $table->foreign('shortlist_id')->references('id')->on('match_shortlists')->cascadeOnDelete();
            $table->foreign('seller_id')->references('id')->on('businesses')->cascadeOnDelete();
            $table->index('seller_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('match_candidates');
        Schema::dropIfExists('match_shortlists');
    }
};
