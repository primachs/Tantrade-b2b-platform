<?php

namespace App\MarketGovernanceContext\Broker\Tests\Feature;

use App\MarketGovernanceContext\Market\Infrastructure\Models\Market;
use App\AuthenticationContext\Auth\Infrastructure\Models\AuthUser as User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class BrokerApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_broker_endpoints(): void
    {
        $user = \App\AuthenticationContext\Auth\Infrastructure\Models\AuthUser::create([
            'id' => \Illuminate\Support\Str::uuid(),
            'name' => 'Broker Test',
            'email' => 'broker.' . \Illuminate\Support\Str::uuid() . '@example.com',
            'password' => bcrypt('password'),
            'status' => 'ACTIVE',
        ]);

        $market = Market::create([
            'id' => Str::uuid()->toString(),
            'market_name' => 'Kariakoo',
            'region' => 'Dar',
            'district' => 'Ilala',
            'ward' => 'Kariakoo',
            'address' => 'Street 7',
            'status' => 'ACTIVE',
        ]);

        $response = $this->postJson('/api/market-governance/brokers', [
            'first_name' => 'Juma',
            'middle_name' => null,
            'surname' => 'Mwana',
            'nida_number' => '12345678901234567890',
            'mobile' => '+255700000444',
            'address' => 'Ward 3',
            'market_id' => $market->id,
            'broker_type' => 'PRODUCE_BROKER',
        ]);
        $response->assertStatus(201);

        $brokerId = $response->json('id');
        $this->assertNotEmpty($brokerId);

        $this->getJson("/api/market-governance/brokers/{$brokerId}")
            ->assertStatus(200)
            ->assertJson(['id' => $brokerId]);

        $this->patchJson("/api/market-governance/brokers/{$brokerId}/deactivate")
            ->assertStatus(200)
            ->assertJson(['status' => 'INACTIVE']);
    }
}
