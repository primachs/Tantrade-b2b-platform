<?php

namespace App\MatchingContext\Matching\Tests\Unit;

use App\MatchingContext\Matching\Infrastructure\Models\MatchShortlist;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MatchShortlistModelTest extends TestCase
{
    use RefreshDatabase;

    public function test_match_shortlist_relationships(): void
    {
        $model = new MatchShortlist;

        $this->assertInstanceOf(BelongsTo::class, $model->rfs());
        $this->assertInstanceOf(HasMany::class, $model->candidates());
    }
}
