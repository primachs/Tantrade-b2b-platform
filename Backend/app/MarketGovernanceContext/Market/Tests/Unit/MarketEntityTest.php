<?php

namespace App\MarketGovernanceContext\Market\Tests\Unit;

use App\MarketGovernanceContext\Market\Domain\Entities\Market;
use App\MarketGovernanceContext\SharedKernel\Domain\ValueObjects\Uuid;
use PHPUnit\Framework\TestCase;

class MarketEntityTest extends TestCase
{
    public function test_market_updates_and_status(): void
    {
        $id = Uuid::random();
        $market = new Market(
            $id,
            Uuid::random(),
            'Kariakoo',
            'Dar',
            'Ilala',
            null,
            'Street 1',
            'ACTIVE',
            null,
            null
        );

        $this->assertSame($id->value(), $market->id()->value());

        $updated = $market->withUpdates([
            'market_name' => 'Kariakoo Updated',
            'ward' => 'Kariakoo',
            'status' => 'INACTIVE',
        ]);

        $updatedData = $updated->toArray();
        $this->assertSame('Kariakoo Updated', $updatedData['market_name']);
        $this->assertSame('Kariakoo', $updatedData['ward']);
        $this->assertSame('INACTIVE', $updatedData['status']);

        $statusOnly = $market->withStatus('INACTIVE');
        $this->assertSame('INACTIVE', $statusOnly->toArray()['status']);
    }
}
