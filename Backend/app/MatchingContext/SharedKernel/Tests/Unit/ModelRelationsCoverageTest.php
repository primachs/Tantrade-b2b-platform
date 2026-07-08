<?php

namespace App\MatchingContext\SharedKernel\Tests\Unit;

use App\MatchingContext\Business\Infrastructure\Models\BusinessCapabilityAttribute;
use App\MatchingContext\Business\Infrastructure\Models\BusinessTrustMetrics;
use App\MatchingContext\Business\Infrastructure\Models\BusinessVerification;
use App\MatchingContext\Engagement\Infrastructure\Models\SessionReport;
use App\MatchingContext\Matching\Infrastructure\Models\MatchCandidate;
use App\MatchingContext\Rfs\Infrastructure\Models\RfsConstraint;
use App\MatchingContext\Rfs\Infrastructure\Models\RfsPreference;
use App\MatchingContext\Signal\Infrastructure\Models\OutcomeSignal;
use App\MatchingContext\Taxonomy\Infrastructure\Models\AttributeValue;
use App\MatchingContext\Taxonomy\Infrastructure\Models\ServiceAttribute;
use App\MatchingContext\Taxonomy\Infrastructure\Models\ServiceCategory;
use App\MatchingContext\Taxonomy\Infrastructure\Models\ServiceType;
use Tests\TestCase;

class ModelRelationsCoverageTest extends TestCase
{
    public function test_taxonomy_relations(): void
    {
        $cat = new ServiceCategory;
        $this->assertNotNull($cat->parent());
        $this->assertNotNull($cat->children());

        $type = new ServiceType;
        $this->assertNotNull($type->category());

        $attr = new ServiceAttribute;
        $this->assertNotNull($attr->serviceType());

        $attrVal = new AttributeValue;
        $this->assertNotNull($attrVal->attribute());
    }

    public function test_rfs_relations(): void
    {
        $constraint = new RfsConstraint;
        $this->assertNotNull($constraint->rfs());

        $pref = new RfsPreference;
        $this->assertNotNull($pref->rfs());
    }

    public function test_business_relations(): void
    {
        $capAttr = new BusinessCapabilityAttribute;
        $this->assertNotNull($capAttr->capability());

        $trust = new BusinessTrustMetrics;
        $this->assertNotNull($trust->business());

        $ver = new BusinessVerification;
        $this->assertNotNull($ver->business());
    }

    public function test_engagement_and_matching_relations(): void
    {
        $report = new SessionReport;
        $this->assertNotNull($report->session());

        $match = new MatchCandidate;
        $this->assertNotNull($match->shortlist());
        $this->assertNotNull($match->seller());
    }

    public function test_signal_relations(): void
    {
        $signal = new OutcomeSignal;
        $this->assertNotNull($signal->session());
        $this->assertNotNull($signal->seller());
    }
}
