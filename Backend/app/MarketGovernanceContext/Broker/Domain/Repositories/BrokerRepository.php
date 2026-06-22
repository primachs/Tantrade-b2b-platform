<?php

namespace App\MarketGovernanceContext\Broker\Domain\Repositories;

use App\MarketGovernanceContext\Broker\Domain\Entities\BrokerRegistration;
use App\MarketGovernanceContext\SharedKernel\Domain\ValueObjects\Uuid;

interface BrokerRepository
{
    public function create(BrokerRegistration $registration): BrokerRegistration;

    public function update(BrokerRegistration $registration): BrokerRegistration;

    public function findById(Uuid $registrationId): ?BrokerRegistration;

    /** @return BrokerRegistration[] */
    public function list(?string $userId = null): array;
}
