<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('auth_permission_role', function (Blueprint $table) {
            $table->uuid('permission_id');
            $table->uuid('role_id');
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();

            $table->primary(['permission_id', 'role_id']);
            $table->foreign('permission_id')->references('id')->on('auth_permissions')->cascadeOnDelete();
            $table->foreign('role_id')->references('id')->on('auth_roles')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('auth_permission_role');
    }
};
