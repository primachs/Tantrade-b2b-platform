<?php

namespace App\MarketGovernanceContext\Person\Tests\Unit;

use App\MarketGovernanceContext\Person\Domain\Factories\PersonFactory;
use App\MarketGovernanceContext\Person\Domain\Repositories\PersonRepository;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PersonRepositoryTest extends TestCase
{
    use RefreshDatabase;

    public function test_person_repository_crud(): void
    {
        $user = User::create([
            'name' => 'Test User',
            'email' => 'person.repo@example.com',
            'password' => 'secret',
        ]);

        $repository = app(PersonRepository::class);
        $factory = new PersonFactory();

        $person = $factory->create([
            'user_id' => $user->id,
            'nida_number' => 'NIDA-REPO',
            'first_name' => 'Asha',
            'middle_name' => null,
            'surname' => 'Kato',
            'gender' => 'FEMALE',
            'mobile' => '+255700000000',
            'email' => 'asha.repo@example.com',
            'address' => 'Street 1',
        ]);

        $saved = $repository->create($person);
        $found = $repository->findById($saved->id());

        $this->assertNotNull($found);
        $this->assertSame('NIDA-REPO', $found->toArray()['nida_number']);

        $updated = $saved->withUpdates(['address' => 'Street 2']);
        $repository->update($updated);

        $reloaded = $repository->findById($saved->id());
        $this->assertSame('Street 2', $reloaded->toArray()['address']);
    }
}
