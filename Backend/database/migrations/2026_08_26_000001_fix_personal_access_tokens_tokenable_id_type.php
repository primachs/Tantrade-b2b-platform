<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * The personal_access_tokens table was created with $table->morphs(),
     * which makes tokenable_id an unsigned big integer. This app's AuthUser
     * model (and every other entity in the system) uses UUID primary keys,
     * so every token insert truncates the UUID down to a number
     * (MySQL error 1265: "Data truncated for column 'tokenable_id'"),
     * silently breaking login/token issuance. This migration widens
     * tokenable_id to match the UUID columns used everywhere else.
     */
    public function up(): void
    {
        if (Schema::getConnection()->getDriverName() === 'sqlite') {
            // SQLite has no fixed column typing, so the mismatch never
            // manifests there - nothing to do.
            return;
        }

        DB::statement('ALTER TABLE personal_access_tokens MODIFY tokenable_id CHAR(36) NOT NULL');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::getConnection()->getDriverName() === 'sqlite') {
            return;
        }

        DB::statement('ALTER TABLE personal_access_tokens MODIFY tokenable_id BIGINT UNSIGNED NOT NULL');
    }
};