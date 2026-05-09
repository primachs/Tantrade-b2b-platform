<?php

namespace App\MatchingContext\Business\Tests\Unit;

use App\MatchingContext\Business\Application\BusinessService;
use App\MatchingContext\Taxonomy\Infrastructure\Models\ServiceAttribute;
use App\MatchingContext\Taxonomy\Infrastructure\Models\ServiceCategory;
use App\MatchingContext\Taxonomy\Infrastructure\Models\ServiceType;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BusinessServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_business_service_flow(): void
    {
        $serviceType = $this->seedTaxonomy();
        $attribute = ServiceAttribute::create([
            'service_type_id' => $serviceType->id,
            'name' => 'Vehicle Type',
        ]);

        $service = app(BusinessService::class);

        $payload = [
            'name' => 'Buyer Co',
            'contact_person' => 'Jane Doe',
            'phone' => '+255700000000',
            'email' => 'buyer.service@example.com',
            'tin_number' => 'TIN-001',
            'brela_number' => 'BRELA-001',
            'business_size' => 'SMALL',
            'is_owner' => true,
            'owner_gender' => 'FEMALE',
            'employee_count' => 10,
            'revenue_range' => 'BELOW_50M',
            'region' => 'Dar',
            'district' => 'Ilala',
            'address' => 'Street 1',
            'verification_status' => 'UNVERIFIED',
            'capabilities' => [
                [
                    'service_type_id' => $serviceType->id,
                    'attributes' => [
                        [
                            'attribute_id' => $attribute->id,
                            'value' => 'Trucks',
                        ],
                    ],
                ],
            ],
        ];

        $created = $service->create($payload);
        $businessId = $created['id'];

        $service->show($businessId);

        $service->update($businessId, ['name' => 'Buyer Co Updated']);

        $service->upsertVerification($businessId, [
            'tin_number' => 'TIN-002',
            'brela_number' => 'BRELA-002',
            'business_size' => 'MEDIUM',
            'is_owner' => true,
            'owner_gender' => 'FEMALE',
            'employee_count' => 12,
            'revenue_range' => 'BETWEEN_50M_500M',
            'region' => 'Dar',
            'district' => 'Ilala',
            'address' => 'Street 2',
            'verification_status' => 'PARTIALLY_VERIFIED',
        ]);

        $service->syncCapabilities($businessId, [
            [
                'service_type_id' => $serviceType->id,
                'attributes' => [
                    [
                        'attribute_id' => $attribute->id,
                        'value' => 'Cars',
                    ],
                ],
            ],
        ]);

        $metrics = $service->trustMetrics($businessId);
        $this->assertNotEmpty($metrics);

        $service->touchActivity($businessId);
    }

    public function test_business_service_rejects_missing_business(): void
    {
        $service = app(BusinessService::class);

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

        return ServiceType::create([
            'name' => 'Vehicle Maintenance',
            'category_id' => $category->id,
            'is_active' => true,
        ]);
    }
}
