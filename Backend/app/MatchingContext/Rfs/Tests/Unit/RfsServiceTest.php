<?php

namespace App\MatchingContext\Rfs\Tests\Unit;

use App\MatchingContext\Rfs\Application\RfsService;
use App\MatchingContext\Rfs\Infrastructure\Models\Rfs;
use App\MatchingContext\Rfs\Infrastructure\Models\RfsConstraint;
use App\MatchingContext\Taxonomy\Infrastructure\Models\ServiceCategory;
use App\MatchingContext\Taxonomy\Infrastructure\Models\ServiceType;
use App\MatchingContext\Business\Infrastructure\Models\Business;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\TestCase;

class RfsServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_open_requires_draft_status(): void
    {
        [$business, $serviceType] = $this->seedRfsDependencies();
        $rfs = Rfs::create([
            'buyer_id' => $business->id,
            'title' => 'Test',
            'description' => 'Test',
            'service_type_id' => $serviceType->id,
            'project_size' => 'SMALL',
            'expertise_level' => 'BASIC',
            'status' => 'OPEN',
            'created_at' => Carbon::now(),
        ]);

        $service = app(RfsService::class);

        $this->expectException(\RuntimeException::class);
        $service->open($rfs);
    }

    public function test_open_requires_constraints(): void
    {
        [$business, $serviceType] = $this->seedRfsDependencies();
        $rfs = Rfs::create([
            'buyer_id' => $business->id,
            'title' => 'Test',
            'description' => 'Test',
            'service_type_id' => $serviceType->id,
            'project_size' => 'SMALL',
            'expertise_level' => 'BASIC',
            'status' => 'DRAFT',
            'created_at' => Carbon::now(),
        ]);

        $service = app(RfsService::class);

        $this->expectException(\RuntimeException::class);
        $service->open($rfs);
    }

    public function test_open_validates_budget(): void
    {
        [$business, $serviceType] = $this->seedRfsDependencies();
        $rfs = Rfs::create([
            'buyer_id' => $business->id,
            'title' => 'Test',
            'description' => 'Test',
            'service_type_id' => $serviceType->id,
            'project_size' => 'SMALL',
            'expertise_level' => 'BASIC',
            'status' => 'DRAFT',
            'created_at' => Carbon::now(),
        ]);

        RfsConstraint::create([
            'rfs_id' => $rfs->id,
            'min_budget' => 5000,
            'max_budget' => 1000,
        ]);

        $service = app(RfsService::class);

        $this->expectException(\RuntimeException::class);
        $service->open($rfs->refresh());
    }

    public function test_open_validates_timeline(): void
    {
        [$business, $serviceType] = $this->seedRfsDependencies();
        $rfs = Rfs::create([
            'buyer_id' => $business->id,
            'title' => 'Test',
            'description' => 'Test',
            'service_type_id' => $serviceType->id,
            'project_size' => 'SMALL',
            'expertise_level' => 'BASIC',
            'status' => 'DRAFT',
            'created_at' => Carbon::now(),
        ]);

        RfsConstraint::create([
            'rfs_id' => $rfs->id,
            'start_date' => Carbon::now()->addDays(5),
            'deadline' => Carbon::now()->addDays(1),
        ]);

        $service = app(RfsService::class);

        $this->expectException(\RuntimeException::class);
        $service->open($rfs->refresh());
    }

    public function test_update_rejects_closed_rfs(): void
    {
        [$business, $serviceType] = $this->seedRfsDependencies();
        $rfs = Rfs::create([
            'buyer_id' => $business->id,
            'title' => 'Test',
            'description' => 'Test',
            'service_type_id' => $serviceType->id,
            'project_size' => 'SMALL',
            'expertise_level' => 'BASIC',
            'status' => 'CLOSED',
            'created_at' => Carbon::now(),
        ]);

        $service = app(RfsService::class);

        $this->expectException(\RuntimeException::class);
        $service->update($rfs, ['title' => 'Updated']);
    }

    private function seedRfsDependencies(): array
    {
        $business = Business::create([
            'name' => 'Buyer',
            'contact_person' => 'Owner',
            'phone' => '+255700000000',
            'email' => 'buyer@example.com',
        ]);

        $category = ServiceCategory::create([
            'name' => 'Logistics',
            'parent_id' => null,
            'level' => 1,
            'is_active' => true,
        ]);

        $subcategory = ServiceCategory::create([
            'name' => 'Fleet Services',
            'parent_id' => $category->id,
            'level' => 2,
            'is_active' => true,
        ]);

        $serviceType = ServiceType::create([
            'name' => 'Vehicle Maintenance',
            'category_id' => $subcategory->id,
            'is_active' => true,
        ]);

        return [$business, $serviceType];
    }
}
