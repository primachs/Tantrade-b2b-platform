<?php

namespace App\MarketGovernanceContext\SharedKernel\Tests\Unit;

use App\MarketGovernanceContext\Governance\Infrastructure\Models\MarketOffice;
use App\MarketGovernanceContext\Governance\Infrastructure\Models\OfficeTerm;
use Tests\TestCase;

class ModelRelationsCoverageTest extends TestCase
{
    public function test_governance_relations(): void
    {
        $office = new MarketOffice;
        $this->assertNotNull($office->terms());

        $term = new OfficeTerm;
        $this->assertNotNull($term->office());
    }
}
