<?php

namespace App\MarketGovernanceContext\Market\Tests\Unit;

use App\MarketGovernanceContext\Market\Domain\Factories\MarketFactory;
use App\MarketGovernanceContext\Market\Domain\Repositories\MarketRepository;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MarketRepositoryTest extends TestCase
{
    use RefreshDatabase;

    public function test_market_repository_crud(): void
    {
        $repository = app(MarketRepository::class);
        $factory = new MarketFactory;

        $market = $factory->create([
            'market_name' => 'Kariakoo',
            'region' => 'Dar',
            'district' => 'Ilala',
            'ward' => 'Kariakoo',
            'address' => 'Street 1',
            'status' => 'ACTIVE',
        ]);

        $saved = $repository->create($market);
        $found = $repository->findById($saved->id());

        $this->assertNotNull($found);
        $this->assertSame('Kariakoo', $found->toArray()['market_name']);

        $updated = $saved->withUpdates(['market_name' => 'Kariakoo Updated']);
        $repository->update($updated);

        $reloaded = $repository->findById($saved->id());
        $this->assertSame('Kariakoo Updated', $reloaded->toArray()['market_name']);
    }
}
