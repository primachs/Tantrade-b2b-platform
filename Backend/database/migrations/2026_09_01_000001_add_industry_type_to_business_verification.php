<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Adds an industry classification to a business's profile. This lets the
     * RFS creation form filter the service-category dropdown down to just
     * the categories relevant to that business (e.g. a TECHNOLOGY business
     * only sees software/IT categories instead of all 20).
     */
    public function up(): void
    {
        Schema::table('business_verification', function (Blueprint $table) {
            $table->string('industry_type')->default('OTHER')->after('verification_status');
        });
    }

    public function down(): void
    {
        Schema::table('business_verification', function (Blueprint $table) {
            $table->dropColumn('industry_type');
        });
    }
};