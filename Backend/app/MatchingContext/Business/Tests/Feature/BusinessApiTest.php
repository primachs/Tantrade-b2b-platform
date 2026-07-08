<?php

namespace App\MatchingContext\Business\Tests\Feature;

use App\AuthenticationContext\Auth\Application\AuthService;
use App\AuthenticationContext\Auth\Application\RoleService;
use App\AuthenticationContext\Auth\Infrastructure\Models\AuthUser;
use App\AuthenticationContext\Auth\Infrastructure\Models\AuthUser as AuthUserModel;
use App\MatchingContext\Business\Application\BusinessService;
use App\MatchingContext\Business\Infrastructure\Models\Business;
use App\MatchingContext\Taxonomy\Infrastructure\Models\ServiceAttribute;
use App\MatchingContext\Taxonomy\Infrastructure\Models\ServiceCategory;
use App\MatchingContext\Taxonomy\Infrastructure\Models\ServiceType;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Tests\Support\TanzaniaTestData;
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
            'phone' => TanzaniaTestData::MOBILE,
            'email' => 'buyer@example.com',
            'tin_number' => TanzaniaTestData::TIN,
            'brela_number' => TanzaniaTestData::BRELA,
            'business_size' => 'SMALL',
            'is_owner' => true,
            'owner_gender' => 'FEMALE',
            'employee_count' => 10,
            'revenue_range' => 'BELOW_50M',
            'region' => TanzaniaTestData::REGION,
            'district' => TanzaniaTestData::DISTRICT,
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

        $user = AuthUser::create([
            'id' => (string) Str::uuid(),
            'name' => 'Test User',
            'email' => 'test.buyer@'.Str::uuid().'.com',
            'password' => bcrypt('password'),
            'status' => 'ACTIVE',
        ]);
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/businesses', $payload);
        $response->assertStatus(201);

        $businessId = $response->json('id');
        $this->assertNotNull($businessId);

        $this->patchJson("/api/businesses/{$businessId}", [
            'name' => 'Buyer Co Updated',
        ])->assertStatus(200);

        $authService = app(AuthService::class);
        $roleService = app(RoleService::class);
        $authService->register([
            'name' => 'Admin User',
            'email' => 'admin.business.test@example.com',
            'password' => 'StrongPassw0rd!2026',
        ]);
        $adminRole = collect($roleService->listAllRoles())->firstWhere('name', 'ADMIN')
            ?? $roleService->create(['name' => 'ADMIN', 'description' => 'Platform administrator']);
        $adminUser = AuthUserModel::query()->where('email', 'admin.business.test@example.com')->first();
        $roleService->assignRole((string) $adminUser->id, $adminRole['id']);
        Sanctum::actingAs($adminUser);

        $this->putJson("/api/businesses/{$businessId}/verification", [
            'tin_number' => TanzaniaTestData::TIN_ALT,
            'brela_number' => TanzaniaTestData::BRELA_ALT,
            'business_size' => 'MEDIUM',
            'is_owner' => true,
            'owner_gender' => 'FEMALE',
            'employee_count' => 12,
            'revenue_range' => 'BETWEEN_50M_500M',
            'region' => TanzaniaTestData::REGION,
            'district' => TanzaniaTestData::DISTRICT,
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

        $this->getJson('/api/businesses/my-business')->assertStatus(200);
        $this->getJson('/api/businesses')->assertStatus(200);

        $this->patchJson("/api/businesses/{$businessId}/verification/review", [
            'verification_status' => 'VERIFIED',
            'notes' => 'Looking good',
        ])->assertStatus(200);
    }
}
