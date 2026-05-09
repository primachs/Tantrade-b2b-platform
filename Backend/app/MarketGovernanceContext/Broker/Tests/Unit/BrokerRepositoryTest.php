<?php

namespace App\MarketGovernanceContext\Broker\Tests\Unit;

use App\MarketGovernanceContext\Broker\Domain\Factories\BrokerFactory;
use App\MarketGovernanceContext\Broker\Domain\Repositories\BrokerRepository;
use App\MarketGovernanceContext\Market\Infrastructure\Models\Market;
use App\MarketGovernanceContext\Person\Infrastructure\Models\Person;
use App\MarketGovernanceContext\SharedKernel\Domain\ValueObjects\Uuid;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class BrokerRepositoryTest extends TestCase
{
    use RefreshDatabase;

    public function test_broker_repository_crud(): void
    {
        $user = User::create([
            'name' => 'Broker User',
            'email' => 'broker.repo@example.com',
            'password' => 'secret',
        ]);

        $person = Person::create([
            'id' => Str::uuid()->toString(),
            'user_id' => $user->id,
            'nida_number' => 'NIDA-300',
            'first_name' => 'Juma',
            'middle_name' => null,
            'surname' => 'Mwana',
            'gender' => 'MALE',
            'mobile' => '+255700000000',
            'email' => 'juma.repo@example.com',
            'address' => 'Ward 3',
        ]);

        $market = Market::create([
            'id' => Str::uuid()->toString(),
            'market_name' => 'Kariakoo',
            'region' => 'Dar',
            'district' => 'Ilala',
            'ward' => 'Kariakoo',
            'address' => 'Street 3',
            'status' => 'ACTIVE',
        ]);

        $repository = app(BrokerRepository::class);
        $factory = new BrokerFactory;

        $registration = $factory->create([
            'person_id' => $person->id,
            'market_id' => $market->id,
            'broker_type' => 'PRODUCE_BROKER',
        ]);

        $saved = $repository->create($registration);
        $this->assertTrue($repository->hasActiveRegistrationForPerson(Uuid::fromString($person->id)));

        $updated = $saved->withStatus('INACTIVE');
        $repository->update($updated);

        $found = $repository->findById($saved->id());
        $this->assertSame('INACTIVE', $found->toArray()['status']);
    }
}
