<?php

namespace App\MarketGovernanceContext\Governance\Tests\Unit;

use App\AuthenticationContext\Auth\Infrastructure\Models\AuthUser as User;
use App\MarketGovernanceContext\Governance\Domain\Factories\GovernanceFactory;
use App\MarketGovernanceContext\Governance\Domain\Repositories\GovernanceRepository;
use App\MarketGovernanceContext\Market\Infrastructure\Models\Market;
use App\MarketGovernanceContext\SharedKernel\Domain\ValueObjects\Uuid;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class GovernanceRepositoryTest extends TestCase
{
    use RefreshDatabase;

    public function test_governance_repository_methods(): void
    {
        $user = User::create([
            'id' => Str::uuid()->toString(),
            'name' => 'Chairperson',
            'email' => 'chair.repo@example.com',
            'password' => 'secret',
            'status' => 'ACTIVE',
        ]);

        $market = Market::create([
            'id' => Str::uuid()->toString(),
            'market_name' => 'Kariakoo',
            'region' => 'Dar',
            'district' => 'Ilala',
            'ward' => 'Kariakoo',
            'address' => 'Street 5',
            'status' => 'ACTIVE',
        ]);

        $repository = app(GovernanceRepository::class);
        $factory = new GovernanceFactory;

        $office = $factory->createOffice([
            'market_id' => $market->id,
            'office_type' => 'CHAIRPERSON',
        ]);

        $savedOffice = $repository->createOffice($office);
        $this->assertNotNull($repository->findOfficeById($savedOffice->id()));

        $foundOffice = $repository->findOfficeByMarketAndType(Uuid::fromString($market->id), 'CHAIRPERSON');
        $this->assertNotNull($foundOffice);

        $term = $factory->createOfficeTerm([
            'office_id' => $savedOffice->toArray()['id'],
            'user_id' => $user->id,
            'start_date' => '2026-01-01',
            'end_date' => '2026-12-31',
            'status' => 'ACTIVE',
        ]);

        $savedTerm = $repository->createOfficeTerm($term);
        $this->assertNotNull($repository->findOfficeTermById(Uuid::fromString($savedTerm->toArray()['id'])));

        $this->assertTrue($repository->hasActiveOfficeTermForUser(Uuid::fromString($user->id)));
        $this->assertTrue($repository->hasActiveOfficeTermForOffice(Uuid::fromString($savedOffice->toArray()['id'])));

        $active = $repository->findActiveOfficeTermForOffice(Uuid::fromString($savedOffice->toArray()['id']));
        $this->assertNotNull($active);

        $ended = $savedTerm->withStatus('ENDED');
        $repository->updateOfficeTerm($ended);

        $this->assertFalse($repository->hasActiveOfficeTermForUser(Uuid::fromString($user->id)));
    }
}
