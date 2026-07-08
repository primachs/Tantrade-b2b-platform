<?php

namespace App\MarketGovernanceContext\Governance\Domain\Repositories;

use App\MarketGovernanceContext\Governance\Domain\Entities\MarketOffice;
use App\MarketGovernanceContext\Governance\Domain\Entities\OfficeTerm;
use App\MarketGovernanceContext\SharedKernel\Domain\ValueObjects\Uuid;

interface GovernanceRepository
{
    public function createOffice(MarketOffice $office): MarketOffice;

    public function findOfficeById(Uuid $officeId): ?MarketOffice;

    public function findOfficeByMarketAndType(Uuid $marketId, string $officeType): ?MarketOffice;

    public function createOfficeTerm(OfficeTerm $term): OfficeTerm;

    public function updateOfficeTerm(OfficeTerm $term): OfficeTerm;

    public function findOfficeTermById(Uuid $termId): ?OfficeTerm;

    public function hasActiveOfficeTermForUser(Uuid $userId): bool;

    public function hasActiveOfficeTermForOffice(Uuid $officeId): bool;

    public function findActiveOfficeTermForOffice(Uuid $officeId): ?OfficeTerm;
}
