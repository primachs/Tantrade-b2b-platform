<?php

namespace App\MarketGovernanceContext\Market\Application;

use App\MarketGovernanceContext\Market\Domain\Factories\MarketFactory;
use App\MarketGovernanceContext\Market\Domain\Repositories\MarketRepository;
use App\MarketGovernanceContext\SharedKernel\Domain\ValueObjects\Uuid;

class MarketService
{
    public function __construct(
        private readonly MarketRepository $repository,
        private readonly MarketFactory $factory
    ) {}

    public function create(array $payload): array
    {
        $market = $this->factory->create($payload);
        $saved = $this->repository->create($market);

        return $saved->toArray();
    }

    public function update(string $marketId, array $payload): array
    {
        $market = $this->requireMarket($marketId);
        $updated = $market->withUpdates($payload);

        return $this->repository->update($updated)->toArray();
    }

    public function show(string $marketId): array
    {
        return $this->requireMarket($marketId)->toArray();
    }

    private function requireMarket(string $marketId)
    {
        $market = $this->repository->findById(Uuid::fromString($marketId));
        if (! $market) {
            throw new \RuntimeException('Market not found.');
        }

        return $market;
    }
}
