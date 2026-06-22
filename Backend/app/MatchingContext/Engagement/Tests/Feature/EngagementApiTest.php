<?php

namespace App\MatchingContext\Engagement\Tests\Feature;

use App\AuthenticationContext\Auth\Infrastructure\Models\AuthUser;
use App\MatchingContext\Business\Infrastructure\Models\Business;
use App\MatchingContext\Business\Infrastructure\Models\BusinessTrustMetrics;
use App\MatchingContext\Business\Infrastructure\Models\BusinessVerification;
use App\MatchingContext\Engagement\Infrastructure\Models\EngagementSession;
use App\MatchingContext\Rfs\Infrastructure\Models\Rfs;
use App\MatchingContext\Signal\Infrastructure\Models\OutcomeSignal;
use App\MatchingContext\Taxonomy\Infrastructure\Models\ServiceCategory;
use App\MatchingContext\Taxonomy\Infrastructure\Models\ServiceType;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class EngagementApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_engagement_lifecycle_and_signals(): void
    {
        $serviceType = $this->seedTaxonomy();
        $user = AuthUser::create(['id' => (string) Str::uuid(), 'name' => 'Test', 'email' => 'test@'.Str::uuid().'.com', 'password' => bcrypt('password'), 'status' => 'ACTIVE']);
        $buyer = $this->createBusiness('Buyer Co', clone $user);
        $seller = $this->createBusiness('Seller Co');
        Sanctum::actingAs($user);

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

        $sessionResponse = $this->postJson('/api/engagement-sessions', [
            'rfs_id' => $rfs->id,
            'buyer_id' => $buyer->id,
            'seller_id' => $seller->id,
        ])->assertStatus(201);

        $sessionId = $sessionResponse->json('id');

        $this->getJson("/api/engagement-sessions/{$sessionId}")->assertStatus(200);

        $this->postJson("/api/engagement-sessions/{$sessionId}/accept")->assertStatus(200);
        $this->postJson("/api/engagement-sessions/{$sessionId}/activate")->assertStatus(200);
        $this->postJson("/api/engagement-sessions/{$sessionId}/stall")->assertStatus(200);
        $this->postJson("/api/engagement-sessions/{$sessionId}/activate")->assertStatus(200);

        $this->postJson("/api/engagement-sessions/{$sessionId}/outcomes", [
            'reported_by' => 'BUYER',
            'outcome' => 'DEAL_CONFIRMED',
        ])->assertStatus(201);

        $this->postJson("/api/engagement-sessions/{$sessionId}/outcomes", [
            'reported_by' => 'SELLER',
            'outcome' => 'DEAL_CONFIRMED',
        ])->assertStatus(201);

        $this->postJson("/api/engagement-sessions/{$sessionId}/close")->assertStatus(200);

        $session = EngagementSession::findOrFail($sessionId);
        $this->assertSame('CLOSED', $session->status);
        $this->assertSame('DEAL_CONFIRMED', $session->outcome);

        $this->assertDatabaseHas('outcome_signals', [
            'session_id' => $sessionId,
            'seller_id' => $seller->id,
        ]);

        $this->assertNotNull(OutcomeSignal::where('session_id', $sessionId)->first());
    }

    public function test_deal_confirmed_requires_dual_confirmation(): void
    {
        $serviceType = $this->seedTaxonomy();
        $user = AuthUser::create(['id' => (string) Str::uuid(), 'name' => 'Test', 'email' => 'test@'.Str::uuid().'.com', 'password' => bcrypt('password'), 'status' => 'ACTIVE']);
        $buyer = $this->createBusiness('Buyer Co', clone $user);
        $seller = $this->createBusiness('Seller Co');
        Sanctum::actingAs($user);

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

        $session = EngagementSession::create([
            'rfs_id' => $rfs->id,
            'buyer_id' => $buyer->id,
            'seller_id' => $seller->id,
            'status' => 'ACTIVE',
            'created_at' => Carbon::now(),
        ]);

        $this->postJson("/api/engagement-sessions/{$session->id}/outcomes", [
            'reported_by' => 'BUYER',
            'outcome' => 'DEAL_CONFIRMED',
        ])->assertStatus(201);

        $this->postJson("/api/engagement-sessions/{$session->id}/close")->assertStatus(200);

        $session->refresh();
        $this->assertSame('DISPUTED', $session->outcome);
    }

    public function test_engagement_invalid_transitions_raise_errors(): void
    {
        $serviceType = $this->seedTaxonomy();
        $user = AuthUser::create(['id' => (string) Str::uuid(), 'name' => 'Test', 'email' => 'test@'.Str::uuid().'.com', 'password' => bcrypt('password'), 'status' => 'ACTIVE']);
        $buyer = $this->createBusiness('Buyer Co', clone $user);
        $seller = $this->createBusiness('Seller Co');
        Sanctum::actingAs($user);

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

        $session = EngagementSession::create([
            'rfs_id' => $rfs->id,
            'buyer_id' => $buyer->id,
            'seller_id' => $seller->id,
            'status' => 'INITIATED',
            'created_at' => Carbon::now(),
        ]);

        $this->postJson("/api/engagement-sessions/{$session->id}/stall")->assertStatus(422);
        $this->postJson("/api/engagement-sessions/{$session->id}/activate")->assertStatus(422);

        $this->postJson("/api/engagement-sessions/{$session->id}/accept")->assertStatus(200);
        $this->postJson("/api/engagement-sessions/{$session->id}/accept")->assertStatus(422);

        $this->postJson("/api/engagement-sessions/{$session->id}/close")->assertStatus(422);

        $this->postJson("/api/engagement-sessions/{$session->id}/outcomes", [
            'reported_by' => 'BUYER',
            'outcome' => 'NO_AGREEMENT',
        ])->assertStatus(201);

        $this->postJson("/api/engagement-sessions/{$session->id}/close")->assertStatus(200);

        $this->postJson("/api/engagement-sessions/{$session->id}/outcomes", [
            'reported_by' => 'SELLER',
            'outcome' => 'NO_AGREEMENT',
        ])->assertStatus(422);

        $this->postJson("/api/engagement-sessions/{$session->id}/close")->assertStatus(422);
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

    private function createBusiness(string $name, $user = null): Business
    {
        $business = Business::create([
            'id' => (string) Str::uuid(),
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
