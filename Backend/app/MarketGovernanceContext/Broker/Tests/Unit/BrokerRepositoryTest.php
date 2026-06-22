<?php

namespace App\MarketGovernanceContext\Broker\Tests\Unit;

use App\MarketGovernanceContext\Broker\Domain\Factories\BrokerFactory;
use App\MarketGovernanceContext\Broker\Domain\Repositories\BrokerRepository;
use App\MarketGovernanceContext\Market\Infrastructure\Models\Market;
use App\MarketGovernanceContext\SharedKernel\Domain\ValueObjects\Uuid;
use App\AuthenticationContext\Auth\Infrastructure\Models\AuthUser as User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class BrokerRepositoryTest extends TestCase
{
    use RefreshDatabase;

    public function test_broker_repository_crud(): void
    {
        $user = User::create([
            'id' => Str::uuid()->toString(),
            'name' => 'Broker User',
            'email' => 'broker.repo@example.com',
            'password' => 'secret',
            'status' => 'ACTIVE',
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
            'market_id' => $market->id,
            'broker_type' => 'PRODUCE_BROKER',
            'first_name' => 'Juma',
            'surname' => 'Mwana',
        ]);

        $saved = $repository->create($registration);

        $updated = $saved->withStatus('INACTIVE');
        $repository->update($updated);

        $found = $repository->findById($saved->id());
        $this->assertSame('INACTIVE', $found->toArray()['status']);
    }
}
