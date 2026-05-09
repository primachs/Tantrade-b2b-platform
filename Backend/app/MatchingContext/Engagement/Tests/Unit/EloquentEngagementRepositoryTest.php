<?php

namespace App\MatchingContext\Engagement\Tests\Unit;

use App\MatchingContext\Business\Infrastructure\Models\Business;
use App\MatchingContext\Engagement\Domain\Factories\EngagementFactory;
use App\MatchingContext\Engagement\Infrastructure\Repositories\EloquentEngagementRepository;
use App\MatchingContext\Rfs\Infrastructure\Models\Rfs;
use App\MatchingContext\SharedKernel\Domain\ValueObjects\Uuid;
use App\MatchingContext\Taxonomy\Infrastructure\Models\ServiceCategory;
use App\MatchingContext\Taxonomy\Infrastructure\Models\ServiceType;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EloquentEngagementRepositoryTest extends TestCase
{
    use RefreshDatabase;

    public function test_engagement_repository_queries(): void
    {
        $buyer = Business::create([
            'name' => 'Buyer',
            'contact_person' => 'Owner',
            'phone' => '+255700000000',
            'email' => 'buyer.engagement@example.com',
        ]);

        $seller = Business::create([
            'name' => 'Seller',
            'contact_person' => 'Owner',
            'phone' => '+255700000111',
            'email' => 'seller.engagement@example.com',
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
            'status' => 'DRAFT',
            'created_at' => now(),
        ]);

        $factory = new EngagementFactory();
        $repository = new EloquentEngagementRepository($factory);

        $session = $factory->createSession([
            'rfs_id' => $rfs->id,
            'buyer_id' => $buyer->id,
            'seller_id' => $seller->id,
        ]);

        $repository->create($session);

        $sessions = $repository->listSessionsBySeller(Uuid::fromString($seller->id));
        $this->assertCount(1, $sessions);

        $closedCount = $repository->countClosedSessionsBySeller(Uuid::fromString($seller->id));
        $this->assertSame(0, $closedCount);

        $report = $factory->reportFromPayload(Uuid::fromString($session->id()->value()), [
            'reported_by' => 'BUYER',
            'outcome' => 'DEAL_CONFIRMED',
        ]);

        $repository->upsertReport($report);

        $found = $repository->findReport(Uuid::fromString($session->id()->value()), 'BUYER');
        $this->assertNotNull($found);
    }
}
