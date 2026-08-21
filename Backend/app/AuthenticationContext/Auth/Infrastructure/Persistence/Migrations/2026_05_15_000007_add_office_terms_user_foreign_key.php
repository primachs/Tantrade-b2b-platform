<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Adds the office_terms.user_id -> auth_users foreign key now that the
     * auth_users table exists (see
     * 2026_05_08_000003_create_market_governance_governance_tables.php for
     * context on why this was deferred).
     */
    public function up(): void
    {
        Schema::table('office_terms', function (Blueprint $table) {
            $table->foreign('user_id')->references('id')->on('auth_users')->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('office_terms', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
        });
    }
};