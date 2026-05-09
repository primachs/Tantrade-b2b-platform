<?php

namespace App\MarketGovernanceContext\Person\Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PersonApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_person_endpoints(): void
    {
        $user = User::create([
            'name' => 'Test User',
            'email' => 'person@example.com',
            'password' => 'secret',
        ]);

        $payload = [
            'user_id' => $user->id,
            'nida_number' => 'NIDA-001',
            'first_name' => 'Asha',
            'middle_name' => 'M',
            'surname' => 'Kato',
            'gender' => 'FEMALE',
            'mobile' => '+255700000000',
            'email' => 'asha@example.com',
            'address' => 'Street 1',
        ];

        $response = $this->postJson('/api/market-governance/persons', $payload);
        $response->assertStatus(201);

        $personId = $response->json('id');
        $this->assertNotEmpty($personId);

        $this->patchJson("/api/market-governance/persons/{$personId}", [
            'mobile' => '+255700000111',
            'address' => 'Street 2',
        ])->assertStatus(200);

        $this->getJson("/api/market-governance/persons/{$personId}")
            ->assertStatus(200)
            ->assertJson(['id' => $personId]);
    }
}
