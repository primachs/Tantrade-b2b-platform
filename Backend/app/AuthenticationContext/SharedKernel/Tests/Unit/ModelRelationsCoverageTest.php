<?php

namespace App\AuthenticationContext\SharedKernel\Tests\Unit;

use App\AuthenticationContext\Auth\Infrastructure\Models\Permission;
use Tests\TestCase;

class ModelRelationsCoverageTest extends TestCase
{
    public function test_auth_relations(): void
    {
        $perm = new Permission;
        $this->assertNotNull($perm->roles());
    }
}
