<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        if (DB::getDriverName() === 'sqlite') {
            // SQLite stores verification_status as text; no enum alteration needed.
            return;
        }

        DB::statement("ALTER TABLE business_verification MODIFY verification_status ENUM('UNVERIFIED', 'PARTIALLY_VERIFIED', 'VERIFIED', 'REJECTED') NOT NULL DEFAULT 'UNVERIFIED'");
    }

    public function down(): void
    {
        if (DB::getDriverName() === 'sqlite') {
            return;
        }

        DB::statement("ALTER TABLE business_verification MODIFY verification_status ENUM('UNVERIFIED', 'PARTIALLY_VERIFIED', 'VERIFIED') NOT NULL DEFAULT 'UNVERIFIED'");
    }
};
