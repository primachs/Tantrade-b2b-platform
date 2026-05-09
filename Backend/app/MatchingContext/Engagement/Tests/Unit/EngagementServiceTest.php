<?php

namespace App\MatchingContext\Engagement\Tests\Unit;

use App\MatchingContext\Business\Infrastructure\Models\Business;
use App\MatchingContext\Business\Infrastructure\Models\BusinessTrustMetrics;
use App\MatchingContext\Business\Infrastructure\Models\BusinessVerification;
use App\MatchingContext\Engagement\Application\EngagementService;
use App\MatchingContext\Rfs\Infrastructure\Models\Rfs;
use App\MatchingContext\Taxonomy\Infrastructure\Models\ServiceCategory;
use App\MatchingContext\Taxonomy\Infrastructure\Models\ServiceType;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\TestCase;

class EngagementServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_engagement_service_flow(): void
    {
        $serviceType = $this->seedTaxonomy();
        $buyer = $this->createBusiness('Buyer Co');
        $seller = $this->createBusiness('Seller Co');

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

        $service = app(EngagementService::class);

        $session = $service->createSession([
            'rfs_id' => $rfs->id,
            'buyer_id' => $buyer->id,
            'seller_id' => $seller->id,
        ]);

        $sessionId = $session['id'];
        $this->assertSame('INITIATED', $session['status']);

        $service->show($sessionId);

        $accepted = $service->accept($sessionId);
        $this->assertSame('ACCEPTED', $accepted['status']);

        $active = $service->activate($sessionId);
        $this->assertSame('ACTIVE', $active['status']);

        $stalled = $service->stall($sessionId);
        $this->assertSame('STALLED', $stalled['status']);

        $service->activate($sessionId);

        $service->reportOutcome($sessionId, [
            'reported_by' => 'BUYER',
            'outcome' => 'DEAL_CONFIRMED',
        ]);

        $service->reportOutcome($sessionId, [
            'reported_by' => 'SELLER',
            'outcome' => 'DEAL_CONFIRMED',
        ]);

        $closed = $service->close($sessionId);
        $this->assertSame('CLOSED', $closed['status']);
        $this->assertSame('DEAL_CONFIRMED', $closed['outcome']);
    }

    public function test_engagement_service_rejects_missing_session(): void
    {
        $service = app(EngagementService::class);

        $this->expectException(\RuntimeException::class);

        $service->show('11111111-1111-1111-1111-111111111111');
    }

    private function seedTaxonomy(): ServiceType
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

        return ServiceType::create([
            'name' => 'Vehicle Maintenance',
            'category_id' => $subcategory->id,
            'is_active' => true,
        ]);
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
