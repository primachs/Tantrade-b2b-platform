<?php

namespace App\MarketGovernanceContext\Broker\Tests\Unit;

use App\MarketGovernanceContext\Broker\Application\BrokerService;
use App\MarketGovernanceContext\Governance\Application\GovernanceService;
use App\MarketGovernanceContext\Market\Infrastructure\Models\Market;
use App\MarketGovernanceContext\Person\Infrastructure\Models\Person;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class BrokerServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_register_rejects_active_office_term(): void
    {
        $person = $this->createPerson();
        $market = $this->createMarket();

        $governance = app(GovernanceService::class);
        $office = $governance->createOffice($market->id, []);
        $governance->assignChairperson($office['id'], [
            'person_id' => $person->id,
            'start_date' => '2026-01-01',
        ]);

        $service = app(BrokerService::class);

        $this->expectException(\RuntimeException::class);

        $service->register([
            'person_id' => $person->id,
            'market_id' => $market->id,
            'broker_type' => 'PRODUCE_BROKER',
        ]);
    }

    public function test_deactivate_updates_status(): void
    {
        $person = $this->createPerson();
        $market = $this->createMarket();

        $service = app(BrokerService::class);

        $registration = $service->register([
            'person_id' => $person->id,
            'market_id' => $market->id,
            'broker_type' => 'PRODUCE_BROKER',
        ]);

        $updated = $service->deactivate($registration['id']);

        $this->assertSame('INACTIVE', $updated['status']);
    }

    private function createPerson(): Person
    {
        $user = User::create([
            'name' => 'Broker User',
            'email' => 'broker'.uniqid().'@example.com',
            'password' => 'secret',
        ]);

        return Person::create([
            'id' => Str::uuid()->toString(),
            'user_id' => $user->id,
            'nida_number' => 'NIDA-'.uniqid(),
            'first_name' => 'Juma',
            'middle_name' => null,
            'surname' => 'Mwana',
            'gender' => 'MALE',
            'mobile' => '+255700000555',
            'email' => 'juma'.uniqid().'@example.com',
            'address' => 'Ward 3',
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
            'address' => 'Street 8',
            'status' => 'ACTIVE',
        ]);
    }
}
