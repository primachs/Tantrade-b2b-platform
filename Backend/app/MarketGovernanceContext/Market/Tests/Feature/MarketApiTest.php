<?php

namespace App\MarketGovernanceContext\Market\Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MarketApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_market_endpoints(): void
    {
        $payload = [
            'market_name' => 'Kariakoo Market',
            'region' => 'Dar',
            'district' => 'Ilala',
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
