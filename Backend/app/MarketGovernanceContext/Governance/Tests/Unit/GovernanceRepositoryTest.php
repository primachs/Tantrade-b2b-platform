<?php

namespace App\MarketGovernanceContext\Governance\Tests\Unit;

use App\MarketGovernanceContext\Governance\Domain\Factories\GovernanceFactory;
use App\MarketGovernanceContext\Governance\Domain\Repositories\GovernanceRepository;
use App\MarketGovernanceContext\Market\Infrastructure\Models\Market;
use App\MarketGovernanceContext\Person\Infrastructure\Models\Person;
use App\MarketGovernanceContext\SharedKernel\Domain\ValueObjects\Uuid;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class GovernanceRepositoryTest extends TestCase
{
    use RefreshDatabase;

    public function test_governance_repository_methods(): void
    {
        $user = User::create([
            'name' => 'Chairperson',
            'email' => 'chair.repo@example.com',
            'password' => 'secret',
        ]);

        $person = Person::create([
            'id' => Str::uuid()->toString(),
            'user_id' => $user->id,
            'nida_number' => 'NIDA-400',
            'first_name' => 'Amina',
            'middle_name' => null,
            'surname' => 'Kama',
            'gender' => 'FEMALE',
            'mobile' => '+255700000000',
            'email' => 'amina.repo@example.com',
            'address' => 'Ward 1',
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
        $factory = new GovernanceFactory();

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
            'person_id' => $person->id,
            'start_date' => '2026-01-01',
            'end_date' => '2026-12-31',
            'status' => 'ACTIVE',
        ]);

        $savedTerm = $repository->createOfficeTerm($term);
        $this->assertNotNull($repository->findOfficeTermById(Uuid::fromString($savedTerm->toArray()['id'])));

        $this->assertTrue($repository->hasActiveOfficeTermForPerson(Uuid::fromString($person->id)));
        $this->assertTrue($repository->hasActiveOfficeTermForOffice(Uuid::fromString($savedOffice->toArray()['id'])));

        $active = $repository->findActiveOfficeTermForOffice(Uuid::fromString($savedOffice->toArray()['id']));
        $this->assertNotNull($active);

        $ended = $savedTerm->withStatus('ENDED');
        $repository->updateOfficeTerm($ended);

        $this->assertFalse($repository->hasActiveOfficeTermForPerson(Uuid::fromString($person->id)));
    }
}
