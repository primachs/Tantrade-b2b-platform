<?php

namespace App\MarketGovernanceContext\Governance\Infrastructure\Repositories;

use App\MarketGovernanceContext\Governance\Domain\Entities\MarketOffice;
use App\MarketGovernanceContext\Governance\Domain\Entities\OfficeTerm;
use App\MarketGovernanceContext\Governance\Domain\Factories\GovernanceFactory;
use App\MarketGovernanceContext\Governance\Domain\Repositories\GovernanceRepository;
use App\MarketGovernanceContext\Governance\Infrastructure\Models\MarketOffice as MarketOfficeModel;
use App\MarketGovernanceContext\Governance\Infrastructure\Models\OfficeTerm as OfficeTermModel;
use App\MarketGovernanceContext\SharedKernel\Domain\ValueObjects\Uuid;
use Illuminate\Support\Carbon;

class EloquentGovernanceRepository implements GovernanceRepository
{
    public function __construct(private readonly GovernanceFactory $factory) {}

    public function createOffice(MarketOffice $office): MarketOffice
    {
        $data = $office->toArray();

        MarketOfficeModel::create([
            'id' => $data['id'],
            'market_id' => $data['market_id'],
            'office_type' => $data['office_type'],
        ]);

        return $this->findOfficeById(Uuid::fromString($data['id'])) ?? $office;
    }

    public function findOfficeById(Uuid $officeId): ?MarketOffice
    {
        $model = MarketOfficeModel::query()->find($officeId->value());
        if (! $model) {
            return null;
        }

        return $this->factory->officeFromState($model->toArray());
    }

    public function findOfficeByMarketAndType(Uuid $marketId, string $officeType): ?MarketOffice
    {
        $model = MarketOfficeModel::query()
            ->where('market_id', $marketId->value())
            ->where('office_type', $officeType)
            ->first();

        if (! $model) {
            return null;
        }

        return $this->factory->officeFromState($model->toArray());
    }

    public function createOfficeTerm(OfficeTerm $term): OfficeTerm
    {
        $data = $term->toArray();

        OfficeTermModel::create([
            'id' => $data['id'],
            'office_id' => $data['office_id'],
            'person_id' => $data['person_id'],
            'start_date' => $data['start_date'],
            'end_date' => $data['end_date'],
            'status' => $data['status'],
        ]);

        return $this->findOfficeTermById(Uuid::fromString($data['id'])) ?? $term;
    }

    public function updateOfficeTerm(OfficeTerm $term): OfficeTerm
    {
        $data = $term->toArray();

        OfficeTermModel::query()
            ->where('id', $data['id'])
            ->update([
                'start_date' => $data['start_date'],
                'end_date' => $data['end_date'],
                'status' => $data['status'],
                'updated_at' => Carbon::now(),
            ]);

        return $this->findOfficeTermById(Uuid::fromString($data['id'])) ?? $term;
    }

    public function findOfficeTermById(Uuid $termId): ?OfficeTerm
    {
        $model = OfficeTermModel::query()->find($termId->value());
        if (! $model) {
            return null;
        }

        return $this->factory->termFromState($model->toArray());
    }

    public function hasActiveOfficeTermForPerson(Uuid $personId): bool
    {
        return OfficeTermModel::query()
            ->where('person_id', $personId->value())
            ->where('status', 'ACTIVE')
            ->exists();
    }

    public function hasActiveOfficeTermForOffice(Uuid $officeId): bool
    {
        return OfficeTermModel::query()
            ->where('office_id', $officeId->value())
            ->where('status', 'ACTIVE')
            ->exists();
    }

    public function findActiveOfficeTermForOffice(Uuid $officeId): ?OfficeTerm
    {
        $model = OfficeTermModel::query()
            ->where('office_id', $officeId->value())
            ->where('status', 'ACTIVE')
            ->first();

        if (! $model) {
            return null;
        }

        return $this->factory->termFromState($model->toArray());
    }
}
