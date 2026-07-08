<?php

namespace App\MatchingContext\Matching\Tests\Unit;

use App\MatchingContext\Business\Infrastructure\Models\Business;
use App\MatchingContext\Business\Infrastructure\Models\BusinessCapability;
use App\MatchingContext\Business\Infrastructure\Models\BusinessCapabilityAttribute;
use App\MatchingContext\Business\Infrastructure\Models\BusinessTrustMetrics;
use App\MatchingContext\Business\Infrastructure\Models\BusinessVerification;
use App\MatchingContext\Matching\Application\MatchingService;
use App\MatchingContext\Rfs\Infrastructure\Models\Rfs;
use App\MatchingContext\Rfs\Infrastructure\Models\RfsConstraint;
use App\MatchingContext\SharedKernel\Domain\ValueObjects\Uuid;
use App\MatchingContext\Taxonomy\Infrastructure\Models\ServiceAttribute;
use App\MatchingContext\Taxonomy\Infrastructure\Models\ServiceCategory;
use App\MatchingContext\Taxonomy\Infrastructure\Models\ServiceType;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\TestCase;

class MatchingServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_latest_shortlist_returns_null_when_missing(): void
    {
        $service = app(MatchingService::class);

        $result = $service->latestShortlist(Uuid::random()->value());
        $this->assertNull($result);
    }

    public function test_generate_shortlist_requires_rfs(): void
    {
        $service = app(MatchingService::class);

        $this->expectException(\RuntimeException::class);
        $service->generateShortlist(Uuid::random()->value());
    }

    public function test_generate_shortlist_happy_path(): void
    {
        [$serviceType, $attribute] = $this->seedTaxonomy();
        $buyer = $this->createBusiness('Buyer Co');
        $seller = $this->createBusiness('Seller Co');

        $capability = BusinessCapability::create([
            'business_id' => $seller->id,
            'service_type_id' => $serviceType->id,
        ]);

        BusinessCapabilityAttribute::create([
            'capability_id' => $capability->id,
            'attribute_id' => $attribute->id,
            'value' => 'Trucks',
        ]);

        $rfs = Rfs::create([
            'buyer_id' => $buyer->id,
            'title' => 'Need maintenance',
            'description' => 'Fleet support',
            'service_type_id' => $serviceType->id,
            'project_size' => 'SMALL',
            'expertise_level' => 'BASIC',
            'status' => 'OPEN',
            'created_at' => Carbon::now(),
        ]);

        RfsConstraint::create([
            'rfs_id' => $rfs->id,
            'min_budget' => 1000,
            'max_budget' => 5000,
            'start_date' => Carbon::now()->toDateString(),
            'deadline' => Carbon::now()->addDays(10)->toDateString(),
            'region' => 'Dar',
            'district' => 'Ilala',
        ]);

        // RfsAttribute removed as it no longer exists

        $service = app(MatchingService::class);
        $shortlist = $service->generateShortlist($rfs->id);

        $this->assertSame($rfs->id, $shortlist['rfs_id']);
        $this->assertNotEmpty($shortlist['candidates']);

        $latest = $service->latestShortlist($rfs->id);
        $this->assertNotNull($latest);

        $rfs->refresh();
        $this->assertSame('MATCHED', $rfs->status);
    }

    private function seedTaxonomy(): array
    {
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

        $attribute = ServiceAttribute::create([
            'service_type_id' => $serviceType->id,
            'name' => 'Vehicle Type',
        ]);

        return [$serviceType, $attribute];
    }

    private function createBusiness(string $name): Business
    {
        $business = Business::create([
            'name' => $name,
            'contact_person' => 'Owner',
            'phone' => '+255700000000',
            'email' => strtolower(str_replace(' ', '.', $name)).'@example.com',
        ]);

        BusinessVerification::create([
            'business_id' => $business->id,
            'tin_number' => 'TIN-'.$business->id,
            'brela_number' => 'BRELA-'.$business->id,
            'business_size' => 'SMALL',
            'is_owner' => true,
            'owner_gender' => 'OTHER',
            'employee_count' => 5,
            'revenue_range' => 'BELOW_50M',
            'region' => 'Dar',
            'district' => 'Ilala',
            'address' => 'Street',
            'verification_status' => 'VERIFIED',
        ]);

        BusinessTrustMetrics::create([
            'business_id' => $business->id,
            'reliability_score' => 0.5,
            'success_rate' => 0.0,
            'response_rate' => 0.0,
            'dispute_rate' => 0.0,
            'avg_response_time' => null,
            'session_completion_rate' => null,
        ]);

        return $business;
    }
}
