<?php

namespace App\MarketGovernanceContext\Market\Domain\Repositories;

use App\MarketGovernanceContext\Market\Domain\Entities\Market;
use App\MarketGovernanceContext\SharedKernel\Domain\ValueObjects\Uuid;

interface MarketRepository
{
    public function create(Market $market): Market;

    public function update(Market $market): Market;

    public function findById(Uuid $marketId): ?Market;

    /** @return Market[] */
    public function list(): array;
}
