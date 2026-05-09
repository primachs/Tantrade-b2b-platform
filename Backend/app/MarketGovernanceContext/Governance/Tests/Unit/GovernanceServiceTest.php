<?php

namespace App\MarketGovernanceContext\Governance\Tests\Unit;

use App\MarketGovernanceContext\Broker\Infrastructure\Models\BrokerRegistration;
use App\MarketGovernanceContext\Governance\Application\GovernanceService;
use App\MarketGovernanceContext\Market\Infrastructure\Models\Market;
use App\MarketGovernanceContext\Person\Infrastructure\Models\Person;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class GovernanceServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_assign_chairperson_rejects_active_broker(): void
    {
        $person = $this->createPerson();
        $market = $this->createMarket();
        $service = app(GovernanceService::class);
        $office = $service->createOffice($market->id, []);

        BrokerRegistration::create([
            'id' => Str::uuid()->toString(),
            'person_id' => $person->id,
            'market_id' => $market->id,
            'broker_type' => 'PRODUCE_BROKER',
            'status' => 'ACTIVE',
        ]);

        $this->expectException(\RuntimeException::class);

        $service->assignChairperson($office['id'], [
            'person_id' => $person->id,
            'start_date' => '2026-01-01',
        ]);
    }

    public function test_assign_chairperson_rejects_existing_active_term(): void
    {
        $person = $this->createPerson();
        $market = $this->createMarket();
        $service = app(GovernanceService::class);
        $office = $service->createOffice($market->id, []);

        $service->assignChairperson($office['id'], [
            'person_id' => $person->id,
            'start_date' => '2026-01-01',
        ]);

        $this->expectException(\RuntimeException::class);

        $service->assignChairperson($office['id'], [
            'person_id' => $person->id,
            'start_date' => '2026-02-01',
        ]);
    }

    public function test_assign_chairperson_rejects_term_longer_than_five_years(): void
    {
        $person = $this->createPerson();
        $market = $this->createMarket();
        $service = app(GovernanceService::class);
        $office = $service->createOffice($market->id, []);

        $this->expectException(\RuntimeException::class);

        $service->assignChairperson($office['id'], [
            'person_id' => $person->id,
            'start_date' => '2026-01-01',
            'end_date' => '2032-01-02',
        ]);
    }

    public function test_create_office_returns_existing(): void
    {
        $market = $this->createMarket();
        $service = app(GovernanceService::class);

        $first = $service->createOffice($market->id, ['office_type' => 'CHAIRPERSON']);
        $second = $service->createOffice($market->id, ['office_type' => 'CHAIRPERSON']);

        $this->assertSame($first['id'], $second['id']);
        $this->assertSame($first['office_type'], $second['office_type']);
    }

    public function test_assign_chairperson_defaults_end_date(): void
    {
        $person = $this->createPerson();
        $market = $this->createMarket();
        $service = app(GovernanceService::class);
        $office = $service->createOffice($market->id, []);

        $term = $service->assignChairperson($office['id'], [
            'person_id' => $person->id,
            'start_date' => '2026-01-01',
        ]);

        $this->assertSame('ACTIVE', $term['status']);
        $this->assertSame('2031-01-01', $term['end_date']);
    }

    public function test_end_term_updates_status(): void
    {
        $person = $this->createPerson();
        $market = $this->createMarket();
        $service = app(GovernanceService::class);
        $office = $service->createOffice($market->id, []);

        $term = $service->assignChairperson($office['id'], [
            'person_id' => $person->id,
            'start_date' => '2026-01-01',
        ]);

        $ended = $service->endTerm($term['id'], [
            'end_date' => '2026-12-31',
        ]);

        $this->assertSame('ENDED', $ended['status']);
        $this->assertSame('2026-12-31', $ended['end_date']);
    }

    public function test_end_term_rejects_end_before_start(): void
    {
        $person = $this->createPerson();
        $market = $this->createMarket();
        $service = app(GovernanceService::class);
        $office = $service->createOffice($market->id, []);

        $term = $service->assignChairperson($office['id'], [
            'person_id' => $person->id,
            'start_date' => '2026-01-01',
        ]);

        $this->expectException(\RuntimeException::class);

        $service->endTerm($term['id'], [
            'end_date' => '2025-12-31',
        ]);
    }

    public function test_end_term_rejects_missing_term(): void
    {
        $service = app(GovernanceService::class);

        $this->expectException(\RuntimeException::class);

        $service->endTerm(Str::uuid()->toString(), [
            'end_date' => '2026-12-31',
        ]);
    }

    private function createPerson(): Person
    {
        $user = User::create([
            'name' => 'Person',
            'email' => 'person'.uniqid().'@example.com',
            'password' => 'secret',
        ]);

        return Person::create([
            'id' => Str::uuid()->toString(),
            'user_id' => $user->id,
            'nida_number' => 'NIDA-'.uniqid(),
            'first_name' => 'Sara',
            'middle_name' => null,
            'surname' => 'Kato',
            'gender' => 'FEMALE',
            'mobile' => '+255700000333',
            'email' => 'sara'.uniqid().'@example.com',
            'address' => 'Ward 2',
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
            'address' => 'Street 6',
            'status' => 'ACTIVE',
        ]);
    }
}
