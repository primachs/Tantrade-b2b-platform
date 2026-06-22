<?php

namespace App\MarketGovernanceContext\Broker\Tests\Feature;

use App\AuthenticationContext\Auth\Infrastructure\Models\AuthUser;
use App\MarketGovernanceContext\Market\Infrastructure\Models\Market;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class BrokerApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_broker_endpoints(): void
    {
        $user = AuthUser::create([
            'id' => Str::uuid(),
            'name' => 'Broker Test',
            'email' => 'broker.'.Str::uuid().'@example.com',
            'password' => bcrypt('password'),
            'status' => 'ACTIVE',
        ]);

        Sanctum::actingAs($user, ['*']);

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
