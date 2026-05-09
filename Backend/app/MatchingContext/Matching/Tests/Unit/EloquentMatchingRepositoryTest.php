<?php

namespace App\MatchingContext\Matching\Tests\Unit;

use App\MatchingContext\Business\Domain\Factories\BusinessFactory;
use App\MatchingContext\Business\Infrastructure\Models\Business;
use App\MatchingContext\Matching\Domain\Entities\MatchCandidate;
use App\MatchingContext\Matching\Domain\Entities\MatchShortlist;
use App\MatchingContext\Matching\Infrastructure\Repositories\EloquentMatchingRepository;
use App\MatchingContext\Rfs\Infrastructure\Models\Rfs;
use App\MatchingContext\SharedKernel\Domain\ValueObjects\Uuid;
use App\MatchingContext\Taxonomy\Infrastructure\Models\ServiceCategory;
use App\MatchingContext\Taxonomy\Infrastructure\Models\ServiceType;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EloquentMatchingRepositoryTest extends TestCase
{
    use RefreshDatabase;

    public function test_matching_repository_methods(): void
    {
        $repository = new EloquentMatchingRepository(new BusinessFactory());
        $this->assertSame([], $repository->findCandidatesByServiceTypes([]));

        $buyer = Business::create([
            'name' => 'Buyer',
            'contact_person' => 'Owner',
            'phone' => '+255700000000',
            'email' => 'buyer.matching@example.com',
        ]);

        $seller = Business::create([
            'name' => 'Seller',
            'contact_person' => 'Owner',
            'phone' => '+255700000111',
            'email' => 'seller.matching@example.com',
        ]);

        $category = ServiceCategory::create([
            'name' => 'Logistics',
            'parent_id' => null,
            'level' => 1,
            'is_active' => true,
        ]);

        $serviceType = ServiceType::create([
            'name' => 'Vehicle Maintenance',
            'category_id' => $category->id,
            'is_active' => true,
        ]);

        $rfs = Rfs::create([
            'buyer_id' => $buyer->id,
            'title' => 'Need service',
            'description' => 'Looking for support',
            'service_type_id' => $serviceType->id,
            'project_size' => 'SMALL',
            'expertise_level' => 'BASIC',
            'status' => 'OPEN',
            'created_at' => now(),
        ]);

        $shortlist = new MatchShortlist(
            Uuid::random(),
            Uuid::fromString($rfs->id),
            new \DateTimeImmutable('2026-01-01'),
            [
                new MatchCandidate(null, Uuid::fromString($seller->id), 0.9, 1),
            ]
        );

        $repository->storeShortlist($shortlist);

        $found = $repository->findLatestShortlist(Uuid::fromString($rfs->id));
        $this->assertNotNull($found);
        $this->assertSame($rfs->id, $found->toArray()['rfs_id']);
    }
}
