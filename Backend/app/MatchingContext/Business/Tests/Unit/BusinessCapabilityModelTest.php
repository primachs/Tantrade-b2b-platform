<?php

namespace App\MatchingContext\Business\Tests\Unit;

use App\MatchingContext\Business\Infrastructure\Models\BusinessCapability;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BusinessCapabilityModelTest extends TestCase
{
    use RefreshDatabase;

    public function test_capability_relationships(): void
    {
        $model = new BusinessCapability;

        $this->assertInstanceOf(BelongsTo::class, $model->business());
        $this->assertInstanceOf(BelongsTo::class, $model->serviceType());
        $this->assertInstanceOf(HasMany::class, $model->capabilityAttributes());
    }
}
