<?php

namespace App\MarketGovernanceContext\Broker\Tests\Unit;

use App\MarketGovernanceContext\Broker\Application\BrokerService;
use App\MarketGovernanceContext\Market\Infrastructure\Models\Market;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class BrokerServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_deactivate_updates_status(): void
    {
        $market = $this->createMarket();

        $service = app(BrokerService::class);

        $registration = $service->register([
            'market_id' => $market->id,
            'broker_type' => 'PRODUCE_BROKER',
            'first_name' => 'Juma',
            'surname' => 'Mwana',
        ]);

        $updated = $service->deactivate($registration['id']);

        $this->assertSame('INACTIVE', $updated['status']);
    }

    private function createMarket(): Market
    {
        return Market::create([
            'id' => Str::uuid()->toString(),
            'market_name' => 'Kariakoo',
            'region' => 'Dar',
            'district' => 'Ilala',
            'ward' => 'Kariakoo',
            'address' => 'Street 8',
            'status' => 'ACTIVE',
        ]);
    }
}
