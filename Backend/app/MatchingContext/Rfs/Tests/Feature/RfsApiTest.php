<?php

namespace App\MatchingContext\Rfs\Tests\Feature;

use App\AuthenticationContext\Auth\Infrastructure\Models\AuthUser;
use App\MatchingContext\Business\Infrastructure\Models\Business;
use App\MatchingContext\Taxonomy\Infrastructure\Models\ServiceAttribute;
use App\MatchingContext\Taxonomy\Infrastructure\Models\ServiceCategory;
use App\MatchingContext\Taxonomy\Infrastructure\Models\ServiceType;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class RfsApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_rfs_endpoints(): void
    {
        $user = AuthUser::create(['id' => (string) Str::uuid(), 'name' => 'Test', 'email' => 'test@'.Str::uuid().'.com', 'password' => bcrypt('password'), 'status' => 'ACTIVE']);

        $business = Business::create([
            'id' => Str::uuid(),
            'name' => 'Buyer',
            'contact_person' => 'Owner',
            'phone' => '+255700000000',
            'email' => 'buyer.rfs@example.com',
            'user_id' => $user->id,
        ]);

        Sanctum::actingAs($user);

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
            'buyer_id' => $business->id,
            'title' => 'Need service',
            'description' => 'Looking for logistics support',
            'service_type_id' => $serviceType->id,
            'project_size' => 'SMALL',
            'expertise_level' => 'BASIC',
            'constraints' => [
                'min_budget' => 1000,
                'region' => 'Dar',
            ],
        ];

        $response = $this->postJson('/api/rfs', $payload);
        $response->assertStatus(201);

        $rfsId = $response->json('id');
        $this->assertNotEmpty($rfsId);

        $this->patchJson("/api/rfs/{$rfsId}", [
            'title' => 'Need service updated',
            'constraints' => [
                'min_budget' => 1000,
                'max_budget' => 2000,
                'district' => 'Ilala',
            ],
            'preferences' => [
                'cost_weight' => 0.4,
                'quality_weight' => 0.6,
            ],
            'attributes' => [
                [
                    'attribute_id' => $attribute->id,
                    'value' => 'Trucks',
                ],
            ],
        ])->assertStatus(200);

        $this->postJson("/api/rfs/{$rfsId}/open")
            ->assertStatus(200)
            ->assertJson(['status' => 'OPEN']);

        $this->getJson("/api/rfs/{$rfsId}")
            ->assertStatus(200)
            ->assertJson(['id' => $rfsId]);
    }
}
