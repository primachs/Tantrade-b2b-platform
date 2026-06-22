<?php

namespace App\MatchingContext\Matching\Tests\Feature;

use App\MatchingContext\Business\Infrastructure\Models\Business;
use App\MatchingContext\Business\Infrastructure\Models\BusinessCapability;
use App\MatchingContext\Business\Infrastructure\Models\BusinessCapabilityAttribute;
use App\MatchingContext\Business\Infrastructure\Models\BusinessTrustMetrics;
use App\MatchingContext\Business\Infrastructure\Models\BusinessVerification;
use App\MatchingContext\Rfs\Infrastructure\Models\Rfs;
use App\MatchingContext\Taxonomy\Infrastructure\Models\ServiceAttribute;
use App\MatchingContext\Taxonomy\Infrastructure\Models\ServiceCategory;
use App\MatchingContext\Taxonomy\Infrastructure\Models\ServiceType;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\TestCase;

class RfsMatchingApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_rfs_matching_flow(): void
    {
        [$serviceType, $attribute] = $this->seedTaxonomy();
        $user = \App\AuthenticationContext\Auth\Infrastructure\Models\AuthUser::create(['id' => (string) \Illuminate\Support\Str::uuid(), 'name' => 'Test', 'email' => 'test@' . \Illuminate\Support\Str::uuid() . '.com', 'password' => bcrypt('password'), 'status' => 'ACTIVE']);
        $buyer = $this->createBusiness('Buyer Co', clone $user);
        $seller = $this->createBusiness('Seller Co');
        
        \Laravel\Sanctum\Sanctum::actingAs($user);

        $capability = BusinessCapability::create([
            'business_id' => $seller->id,
            'service_type_id' => $serviceType->id,
        ]);

        BusinessCapabilityAttribute::create([
            'capability_id' => $capability->id,
            'attribute_id' => $attribute->id,
            'value' => 'Trucks',
        ]);

        $response = $this->postJson('/api/rfs', [
            'buyer_id' => $buyer->id,
            'title' => 'Need maintenance',
            'description' => 'Fleet support',
            'service_type_id' => $serviceType->id,
            'project_size' => 'SMALL',
            'expertise_level' => 'BASIC',
            'constraints' => [
                'min_budget' => 1000,
                'max_budget' => 5000,
                'start_date' => Carbon::now()->toDateString(),
                'deadline' => Carbon::now()->addDays(10)->toDateString(),
                'region' => 'Dar',
                'district' => 'Ilala',
            ],
            'preferences' => [
                'cost_weight' => 2,
                'quality_weight' => 3,
                'speed_weight' => 1,
                'experience_weight' => 1,
                'location_weight' => 1,
            ],
            'attributes' => [
                [
                    'attribute_id' => $attribute->id,
                    'value' => 'Trucks',
                ],
            ],
        ])->assertStatus(201);

        $rfsId = $response->json('id');

        $this->getJson("/api/rfs/{$rfsId}")->assertStatus(200);

        $this->patchJson("/api/rfs/{$rfsId}", [
            'title' => 'Updated title',
            'constraints' => [
                'min_budget' => 1500,
                'max_budget' => 6000,
                'region' => 'Dar',
                'district' => 'Ilala',
            ],
            'preferences' => [
                'cost_weight' => 1,
                'quality_weight' => 1,
                'speed_weight' => 1,
                'experience_weight' => 1,
                'location_weight' => 1,
            ],
            'attributes' => [
                [
                    'attribute_id' => $attribute->id,
                    'value' => 'Trucks',
                ],
            ],
        ])->assertStatus(200);

        $this->postJson("/api/rfs/{$rfsId}/open")->assertStatus(200);
        $this->postJson("/api/rfs/{$rfsId}/match")->assertStatus(200);
        $this->getJson("/api/rfs/{$rfsId}/shortlist")->assertStatus(200);

        $rfs = Rfs::findOrFail($rfsId);
        $this->assertSame('MATCHED', $rfs->status);
    }

    public function test_matching_requires_open_rfs(): void
    {
        [$serviceType, $attribute] = $this->seedTaxonomy();
        $user = \App\AuthenticationContext\Auth\Infrastructure\Models\AuthUser::create(['id' => (string) \Illuminate\Support\Str::uuid(), 'name' => 'Test', 'email' => 'test@' . \Illuminate\Support\Str::uuid() . '.com', 'password' => bcrypt('password'), 'status' => 'ACTIVE']);
        $buyer = $this->createBusiness('Buyer Co', $user);
        \Laravel\Sanctum\Sanctum::actingAs($user);

        $rfs = Rfs::create([
            'buyer_id' => $buyer->id,
            'title' => 'Need maintenance',
            'description' => 'Fleet support',
            'service_type_id' => $serviceType->id,
            'project_size' => 'SMALL',
            'expertise_level' => 'BASIC',
            'status' => 'DRAFT',
            'created_at' => Carbon::now(),
        ]);

        $response = $this->postJson("/api/rfs/{$rfs->id}/match");
        $this->assertContains($response->status(), [400, 422, 500]);
    }

    public function test_matching_handles_missing_attributes(): void
    {
        $category = ServiceCategory::create([
            'name' => 'General Services',
            'parent_id' => null,
            'level' => 1,
            'is_active' => true,
        ]);

        $serviceType = ServiceType::create([
            'name' => 'General Consulting',
            'category_id' => $category->id,
            'is_active' => true,
        ]);

        $user = \App\AuthenticationContext\Auth\Infrastructure\Models\AuthUser::create(['id' => (string) \Illuminate\Support\Str::uuid(), 'name' => 'Test', 'email' => 'test@' . \Illuminate\Support\Str::uuid() . '.com', 'password' => bcrypt('password'), 'status' => 'ACTIVE']);
        $buyer = $this->createBusiness('Buyer Co', $user);
        $seller = $this->createBusiness('Seller Co');
        \Laravel\Sanctum\Sanctum::actingAs($user);

        BusinessCapability::create([
            'business_id' => $seller->id,
            'service_type_id' => $serviceType->id,
        ]);

        $rfs = Rfs::create([
            'buyer_id' => $buyer->id,
            'title' => 'Need consulting',
            'description' => 'General support',
            'service_type_id' => $serviceType->id,
            'project_size' => 'SMALL',
            'expertise_level' => 'BASIC',
            'status' => 'OPEN',
            'created_at' => Carbon::now(),
        ]);

        $this->postJson("/api/rfs/{$rfs->id}/match")->assertStatus(200);
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

    private function createBusiness(string $name, $user = null): Business
    {
        $business = Business::create([
            'id' => (string)\Illuminate\Support\Str::uuid(),
            'name' => $name,
            'contact_person' => 'Owner',
            'phone' => '+255700000000',
            'email' => strtolower(str_replace(' ', '.', $name)).'@example.com',
            'user_id' => $user ? $user->id : null,
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
