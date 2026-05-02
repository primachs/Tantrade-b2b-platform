<?php

namespace App\MatchingContext\Signal\Tests\Unit;

use App\MatchingContext\Business\Infrastructure\Models\Business;
use App\MatchingContext\Business\Infrastructure\Models\BusinessVerification;
use App\MatchingContext\Engagement\Infrastructure\Models\EngagementSession;
use App\MatchingContext\Engagement\Infrastructure\Models\SessionReport;
use App\MatchingContext\SharedKernel\Domain\ValueObjects\Uuid;
use App\MatchingContext\Signal\Domain\Services\ReliabilityCalculator;
use App\MatchingContext\Taxonomy\Infrastructure\Models\ServiceCategory;
use App\MatchingContext\Taxonomy\Infrastructure\Models\ServiceType;
use App\MatchingContext\Rfs\Infrastructure\Models\Rfs;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\TestCase;

class ReliabilityCalculatorTest extends TestCase
{
    use RefreshDatabase;

    public function test_reliability_calculator_with_no_sessions(): void
    {
        $seller = $this->createBusiness('Seller Co');

        $calculator = app(ReliabilityCalculator::class);
        $metrics = $calculator->recalculateForSeller(Uuid::fromString($seller->id));

        $data = $metrics->toArray();

        $this->assertSame(0.5, $data['reliability_score']);
        $this->assertSame(0.0, $data['success_rate']);
        $this->assertSame(0.0, $data['response_rate']);
        $this->assertSame(0.0, $data['dispute_rate']);
        $this->assertNull($data['avg_response_time']);
    }

    public function test_reliability_calculator_with_sessions_and_reports(): void
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

        $outcomes = [
            'DEAL_CONFIRMED',
            'DEAL_CONFIRMED',
            'NO_AGREEMENT',
            'DISPUTED',
            'NO_RESPONSE',
        ];

        foreach ($outcomes as $index => $outcome) {
            $session = EngagementSession::create([
                'rfs_id' => $rfs->id,
                'buyer_id' => $buyer->id,
                'seller_id' => $seller->id,
                'status' => 'CLOSED',
                'outcome' => $outcome,
                'confidence_score' => 1.0,
                'created_at' => Carbon::now()->subMinutes(10 + $index),
                'closed_at' => Carbon::now()->subMinutes(5 + $index),
            ]);

            if ($outcome !== 'NO_RESPONSE') {
                SessionReport::create([
                    'session_id' => $session->id,
                    'reported_by' => 'SELLER',
                    'outcome' => $outcome,
                    'created_at' => Carbon::now()->subMinutes(9 + $index),
                ]);
            }
        }

        $calculator = app(ReliabilityCalculator::class);
        $metrics = $calculator->recalculateForSeller(Uuid::fromString($seller->id));

        $data = $metrics->toArray();

        $this->assertGreaterThan(0.0, $data['reliability_score']);
        $this->assertNotNull($data['avg_response_time']);
        $this->assertSame(5, EngagementSession::where('seller_id', $seller->id)->count());
    }

    public function test_average_response_time_null_without_reports(): void
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

        EngagementSession::create([
            'rfs_id' => $rfs->id,
            'buyer_id' => $buyer->id,
            'seller_id' => $seller->id,
            'status' => 'CLOSED',
            'outcome' => 'NO_RESPONSE',
            'confidence_score' => 1.0,
            'created_at' => Carbon::now()->subMinutes(10),
            'closed_at' => Carbon::now()->subMinutes(5),
        ]);

        $calculator = app(ReliabilityCalculator::class);
        $metrics = $calculator->recalculateForSeller(Uuid::fromString($seller->id));

        $data = $metrics->toArray();

        $this->assertNull($data['avg_response_time']);
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
            'email' => strtolower(str_replace(' ', '.', $name)) . '@example.com',
        ]);

        BusinessVerification::create([
            'business_id' => $business->id,
            'tin_number' => 'TIN-' . $business->id,
            'brela_number' => 'BRELA-' . $business->id,
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

        return $business;
    }
}

