<?php

namespace App\MatchingContext\Rfs\Tests\Unit;

use App\MatchingContext\Rfs\Infrastructure\Models\Rfs;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RfsModelRelationsTest extends TestCase
{
    use RefreshDatabase;

    public function test_rfs_relationships(): void
    {
        $model = new Rfs;

        $this->assertInstanceOf(BelongsTo::class, $model->buyer());
        $this->assertInstanceOf(BelongsTo::class, $model->serviceType());
        $this->assertInstanceOf(HasOne::class, $model->constraints());
        $this->assertInstanceOf(HasOne::class, $model->preferences());
        $this->assertInstanceOf(HasMany::class, $model->shortlists());
        $this->assertInstanceOf(HasMany::class, $model->engagementSessions());
    }
}
