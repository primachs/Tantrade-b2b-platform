<?php

namespace App\MarketGovernanceContext\Market\Tests\Feature;

use App\AuthenticationContext\Auth\Infrastructure\Models\AuthUser;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Tests\Support\TanzaniaTestData;
use Tests\TestCase;

class MarketApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_market_endpoints(): void
    {
        $user = AuthUser::create([
            'id' => Str::uuid(),
            'name' => 'Test User',
            'email' => 'test@test.com',
            'password' => bcrypt('password'),
            'first_name' => 'Test',
            'surname' => 'User',
            'status' => 'ACTIVE',
        ]);
        Sanctum::actingAs($user, ['*']);

        $payload = [
            'market_name' => 'Kariakoo Market',
            'region' => TanzaniaTestData::REGION,
            'district' => TanzaniaTestData::DISTRICT,
            'ward' => 'Kariakoo',
            'address' => 'Street 3',
            'status' => 'ACTIVE',
        ];

        $response = $this->postJson('/api/market-governance/markets', $payload);
        $response->assertStatus(201);

        $marketId = $response->json('id');
        $this->assertNotEmpty($marketId);

        $this->patchJson("/api/market-governance/markets/{$marketId}", [
            'status' => 'INACTIVE',
            'address' => 'Street 4',
        ])->assertStatus(200);

        $this->getJson("/api/market-governance/markets/{$marketId}")
            ->assertStatus(200)
            ->assertJson(['id' => $marketId]);
    }
}
