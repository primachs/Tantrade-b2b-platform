<?php

namespace App\MarketGovernanceContext\Governance\Tests\Feature;

use App\MarketGovernanceContext\Market\Infrastructure\Models\Market;
use App\AuthenticationContext\Auth\Infrastructure\Models\AuthUser as User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;
use Tests\TestCase;

class GovernanceApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_governance_endpoints(): void
    {
        $user = $this->createUser();
        $market = $this->createMarket();

        $officeResponse = $this->postJson("/api/market-governance/markets/{$market->id}/offices", []);
        $officeResponse->assertStatus(201);

        $officeId = $officeResponse->json('id');
        $this->assertNotEmpty($officeId);

        $startDate = '2026-05-01';
        $expectedEndDate = Carbon::parse($startDate)->addYears(5)->format('Y-m-d');

        $termResponse = $this->postJson("/api/market-governance/offices/{$officeId}/terms", [
            'user_id' => $user->id,
            'start_date' => $startDate,
        ]);
        $termResponse->assertStatus(201)
            ->assertJson([
                'status' => 'ACTIVE',
                'end_date' => $expectedEndDate,
            ]);

        $termId = $termResponse->json('id');
        $this->assertNotEmpty($termId);

        $this->patchJson("/api/market-governance/terms/{$termId}/end", [
            'end_date' => '2026-12-31',
        ])->assertStatus(200)
            ->assertJson([
                'status' => 'ENDED',
                'end_date' => '2026-12-31',
            ]);
    }

    private function createUser(): \App\AuthenticationContext\Auth\Infrastructure\Models\AuthUser
    {
        return \App\AuthenticationContext\Auth\Infrastructure\Models\AuthUser::create([
            'id' => Str::uuid()->toString(),
            'name' => 'Chairperson',
            'email' => 'chairperson@example.com',
            'password' => 'secret',
            'status' => 'ACTIVE',
        ]);
    }



    private function createMarket(): Market
    {
        return Market::create([
            'id' => Str::uuid()->toString(),
            'market_name' => 'Kariakoo',
            'region' => 'Dar',
            'district' => 'Ilala',
            'ward' => 'Kariakoo',
            'address' => 'Street 5',
            'status' => 'ACTIVE',
        ]);
    }
}
