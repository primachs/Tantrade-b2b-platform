<?php

namespace App\MarketGovernanceContext\Governance\Tests\Unit;

use App\MarketGovernanceContext\Broker\Infrastructure\Models\BrokerRegistration;
use App\MarketGovernanceContext\Governance\Application\GovernanceService;
use App\MarketGovernanceContext\Market\Infrastructure\Models\Market;
use App\AuthenticationContext\Auth\Infrastructure\Models\AuthUser as User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class GovernanceServiceTest extends TestCase
{
    use RefreshDatabase;



    public function test_assign_chairperson_rejects_existing_active_term(): void
    {
        $user = $this->createUser();
        $market = $this->createMarket();
        $service = app(GovernanceService::class);
        $office = $service->createOffice($market->id, []);

        $service->assignChairperson($office['id'], [
            'user_id' => $user->id,
            'start_date' => '2026-01-01',
        ]);

        $this->expectException(\RuntimeException::class);

        $service->assignChairperson($office['id'], [
            'user_id' => $user->id,
            'start_date' => '2026-02-01',
        ]);
    }

    public function test_assign_chairperson_rejects_term_longer_than_five_years(): void
    {
        $user = $this->createUser();
        $market = $this->createMarket();
        $service = app(GovernanceService::class);
        $office = $service->createOffice($market->id, []);

        $this->expectException(\RuntimeException::class);

        $service->assignChairperson($office['id'], [
            'user_id' => $user->id,
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
        $user = $this->createUser();
        $market = $this->createMarket();
        $service = app(GovernanceService::class);
        $office = $service->createOffice($market->id, []);

        $term = $service->assignChairperson($office['id'], [
            'user_id' => $user->id,
            'start_date' => '2026-01-01',
        ]);

        $this->assertSame('ACTIVE', $term['status']);
        $this->assertSame('2031-01-01', $term['end_date']);
    }

    public function test_end_term_updates_status(): void
    {
        $user = $this->createUser();
        $market = $this->createMarket();
        $service = app(GovernanceService::class);
        $office = $service->createOffice($market->id, []);

        $term = $service->assignChairperson($office['id'], [
            'user_id' => $user->id,
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
        $user = $this->createUser();
        $market = $this->createMarket();
        $service = app(GovernanceService::class);
        $office = $service->createOffice($market->id, []);

        $term = $service->assignChairperson($office['id'], [
            'user_id' => $user->id,
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

    private function createUser(): User
    {
        return User::create([
            'id' => Str::uuid()->toString(),
            'name' => 'Person',
            'email' => 'person'.uniqid().'@example.com',
            'password' => 'secret',
            'status' => 'ACTIVE',
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
