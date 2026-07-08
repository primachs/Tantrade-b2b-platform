<?php

namespace App\MarketGovernanceContext\Governance\Domain\Factories;

use App\MarketGovernanceContext\Governance\Domain\Entities\MarketOffice;
use App\MarketGovernanceContext\Governance\Domain\Entities\OfficeTerm;
use App\MarketGovernanceContext\SharedKernel\Domain\Enums\OfficeTermStatus;
use App\MarketGovernanceContext\SharedKernel\Domain\ValueObjects\Uuid;

class GovernanceFactory
{
    public function createOffice(array $payload): MarketOffice
    {
        return new MarketOffice(
            Uuid::random(),
            Uuid::fromString($payload['market_id']),
            $payload['office_type'],
            null,
            null
        );
    }

    public function createOfficeTerm(array $payload): OfficeTerm
    {
        return new OfficeTerm(
            Uuid::random(),
            Uuid::fromString($payload['office_id']),
            Uuid::fromString($payload['user_id']),
            new \DateTimeImmutable($payload['start_date']),
            new \DateTimeImmutable($payload['end_date']),
            $payload['status'] ?? OfficeTermStatus::ACTIVE->value,
            null,
            null
        );
    }

    public function officeFromState(array $state): MarketOffice
    {
        return new MarketOffice(
            Uuid::fromString($state['id']),
            Uuid::fromString($state['market_id']),
            $state['office_type'],
            isset($state['created_at']) ? new \DateTimeImmutable($state['created_at']) : null,
            isset($state['updated_at']) ? new \DateTimeImmutable($state['updated_at']) : null
        );
    }

    public function termFromState(array $state): OfficeTerm
    {
        return new OfficeTerm(
            Uuid::fromString($state['id']),
            Uuid::fromString($state['office_id']),
            Uuid::fromString($state['user_id']),
            new \DateTimeImmutable($state['start_date']),
            new \DateTimeImmutable($state['end_date']),
            $state['status'],
            isset($state['created_at']) ? new \DateTimeImmutable($state['created_at']) : null,
            isset($state['updated_at']) ? new \DateTimeImmutable($state['updated_at']) : null
        );
    }
}
