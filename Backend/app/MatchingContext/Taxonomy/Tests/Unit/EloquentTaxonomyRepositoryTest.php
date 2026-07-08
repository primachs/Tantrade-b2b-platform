<?php

namespace App\MatchingContext\Taxonomy\Tests\Unit;

use App\MatchingContext\SharedKernel\Domain\ValueObjects\Uuid;
use App\MatchingContext\Taxonomy\Domain\Factories\TaxonomyFactory;
use App\MatchingContext\Taxonomy\Infrastructure\Repositories\EloquentTaxonomyRepository;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class EloquentTaxonomyRepositoryTest extends TestCase
{
    use RefreshDatabase;

    public function test_find_category_returns_null_when_not_found(): void
    {
        $factory = new TaxonomyFactory;
        $repository = new EloquentTaxonomyRepository($factory);

        $this->assertNull($repository->findCategoryById(Uuid::fromString((string) Str::uuid())));
    }

    public function test_find_type_returns_null_when_not_found(): void
    {
        $factory = new TaxonomyFactory;
        $repository = new EloquentTaxonomyRepository($factory);

        $this->assertNull($repository->findServiceTypeById(Uuid::fromString((string) Str::uuid())));
    }
}
