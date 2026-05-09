<?php

namespace App\MarketGovernanceContext\Broker\Tests\Feature;

use App\MarketGovernanceContext\Market\Infrastructure\Models\Market;
use App\MarketGovernanceContext\Person\Infrastructure\Models\Person;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class BrokerApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_broker_endpoints(): void
    {
        $user = User::create([
            'name' => 'Broker User',
            'email' => 'broker@example.com',
            'password' => 'secret',
        ]);

        $person = Person::create([
            'id' => Str::uuid()->toString(),
            'user_id' => $user->id,
            'nida_number' => 'NIDA-200',
            'first_name' => 'Juma',
            'middle_name' => null,
            'surname' => 'Mwana',
            'gender' => 'MALE',
            'mobile' => '+255700000444',
            'email' => 'juma@example.com',
            'address' => 'Ward 3',
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
            'person_id' => $person->id,
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
