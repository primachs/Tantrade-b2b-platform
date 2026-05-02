<?php

namespace App\MatchingContext\Business\Tests\Feature;

use App\MatchingContext\Business\Application\BusinessService;
use App\MatchingContext\Business\Infrastructure\Models\Business;
use App\MatchingContext\Taxonomy\Infrastructure\Models\ServiceAttribute;
use App\MatchingContext\Taxonomy\Infrastructure\Models\ServiceCategory;
use App\MatchingContext\Taxonomy\Infrastructure\Models\ServiceType;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BusinessApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_business_profile_endpoints(): void
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

        $payload = [
            'name' => 'Buyer Co',
            'contact_person' => 'Jane Doe',
            'phone' => '+255700000000',
            'email' => 'buyer@example.com',
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

        $response = $this->postJson('/api/businesses', $payload);
        $response->assertStatus(201);

        $businessId = $response->json('id');
        $this->assertNotNull($businessId);

        $this->patchJson("/api/businesses/{$businessId}", [
            'name' => 'Buyer Co Updated',
        ])->assertStatus(200);

        $this->putJson("/api/businesses/{$businessId}/verification", [
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
        ])->assertStatus(200);

        $this->putJson("/api/businesses/{$businessId}/capabilities", [
            'capabilities' => [
                [
                    'service_type_id' => $serviceType->id,
                    'attributes' => [
                        [
                            'attribute_id' => $attribute->id,
                            'value' => 'Cars',
                        ],
                    ],
                ],
            ],
        ])->assertStatus(200);

        $this->getJson("/api/businesses/{$businessId}")->assertStatus(200);
        $this->getJson("/api/businesses/{$businessId}/trust-metrics")->assertStatus(200);

        $business = Business::findOrFail($businessId);
        app(BusinessService::class)->touchActivity($business);
    }
}
