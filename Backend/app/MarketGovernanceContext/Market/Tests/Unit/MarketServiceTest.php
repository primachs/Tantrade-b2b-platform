<?php

namespace App\MarketGovernanceContext\Market\Tests\Unit;

use App\MarketGovernanceContext\Market\Application\MarketService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MarketServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_market_service_flow(): void
    {
        $service = app(MarketService::class);

        $created = $service->create([
            'market_name' => 'Kariakoo Market',
            'region' => 'Dar',
            'district' => 'Ilala',
            'ward' => 'Kariakoo',
            'address' => 'Street 3',
            'status' => 'ACTIVE',
        ]);

        $this->assertSame('ACTIVE', $created['status']);

        $found = $service->show($created['id']);
        $this->assertSame($created['id'], $found['id']);

        $updated = $service->update($created['id'], [
            'status' => 'INACTIVE',
            'address' => 'Street 4',
        ]);

        $this->assertSame('INACTIVE', $updated['status']);
        $this->assertSame('Street 4', $updated['address']);
    }

    public function test_market_service_rejects_missing_market(): void
    {
        $service = app(MarketService::class);

        $this->expectException(\RuntimeException::class);

        $service->show('11111111-1111-1111-1111-111111111111');
    }
}
