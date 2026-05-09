<?php

namespace App\MarketGovernanceContext\Person\Tests\Unit;

use App\MarketGovernanceContext\Person\Application\PersonService;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PersonServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_person_service_flow(): void
    {
        $user = User::create([
            'name' => 'Person',
            'email' => 'person.service@example.com',
            'password' => 'secret',
        ]);

        $service = app(PersonService::class);

        $created = $service->create([
            'user_id' => $user->id,
            'nida_number' => 'NIDA-001',
            'first_name' => 'Sara',
            'middle_name' => null,
            'surname' => 'Kato',
            'gender' => 'FEMALE',
            'mobile' => '+255700000444',
            'email' => 'sara.kato@example.com',
            'address' => 'Ward 2',
        ]);

        $this->assertSame($user->id, $created['user_id']);

        $found = $service->show($created['id']);
        $this->assertSame($created['id'], $found['id']);

        $updated = $service->update($created['id'], [
            'surname' => 'Mashauri',
            'address' => 'Ward 4',
        ]);

        $this->assertSame('Mashauri', $updated['surname']);
        $this->assertSame('Ward 4', $updated['address']);
    }

    public function test_person_service_rejects_missing_person(): void
    {
        $service = app(PersonService::class);

        $this->expectException(\RuntimeException::class);

        $service->show('11111111-1111-1111-1111-111111111111');
    }
}
