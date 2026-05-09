<?php

namespace App\MarketGovernanceContext\Broker\Application;

use App\MarketGovernanceContext\Broker\Domain\Factories\BrokerFactory;
use App\MarketGovernanceContext\Broker\Domain\Repositories\BrokerRepository;
use App\MarketGovernanceContext\Governance\Domain\Repositories\GovernanceRepository;
use App\MarketGovernanceContext\SharedKernel\Domain\Enums\BrokerStatus;
use App\MarketGovernanceContext\SharedKernel\Domain\ValueObjects\Uuid;

class BrokerService
{
    public function __construct(
        private readonly BrokerRepository $repository,
        private readonly BrokerFactory $factory,
        private readonly GovernanceRepository $governanceRepository
    ) {}

    public function register(array $payload): array
    {
        $personUuid = Uuid::fromString($payload['person_id']);
        if ($this->governanceRepository->hasActiveOfficeTermForPerson($personUuid)) {
            throw new \RuntimeException('Person already has an active office term.');
        }

        $registration = $this->factory->create($payload);
        $saved = $this->repository->create($registration);

        return $saved->toArray();
    }

    public function deactivate(string $brokerId): array
    {
        $registration = $this->requireRegistration($brokerId);
        $updated = $registration->withStatus(BrokerStatus::INACTIVE->value);

        return $this->repository->update($updated)->toArray();
    }

    public function show(string $brokerId): array
    {
        return $this->requireRegistration($brokerId)->toArray();
    }

    private function requireRegistration(string $brokerId)
    {
        $registration = $this->repository->findById(Uuid::fromString($brokerId));
        if (! $registration) {
            throw new \RuntimeException('Broker registration not found.');
        }

        return $registration;
    }
}
