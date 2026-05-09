<?php

namespace App\MatchingContext\Engagement\Tests\Unit;

use App\MatchingContext\Engagement\Infrastructure\Models\EngagementSession;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EngagementSessionModelTest extends TestCase
{
    use RefreshDatabase;

    public function test_engagement_session_relationships(): void
    {
        $model = new EngagementSession;

        $this->assertInstanceOf(BelongsTo::class, $model->rfs());
        $this->assertInstanceOf(BelongsTo::class, $model->buyer());
        $this->assertInstanceOf(BelongsTo::class, $model->seller());
        $this->assertInstanceOf(HasMany::class, $model->reports());
    }
}
