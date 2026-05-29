<?php

namespace App\MarketGovernanceContext\Person\Application;

use App\MarketGovernanceContext\Person\Domain\Factories\PersonFactory;
use App\MarketGovernanceContext\Person\Domain\Repositories\PersonRepository;
use App\MarketGovernanceContext\SharedKernel\Domain\ValueObjects\Uuid;

class PersonService
{
    public function __construct(
        private readonly PersonRepository $repository,
        private readonly PersonFactory $factory
    ) {}

    public function create(array $payload): array
    {
        $person = $this->factory->create($payload);
        $saved = $this->repository->create($person);

        return $saved->toArray();
    }

    public function update(string $personId, array $payload): array
    {
        $person = $this->requirePerson($personId);
        $updated = $person->withUpdates($payload);

        return $this->repository->update($updated)->toArray();
    }

    public function show(string $personId): array
    {
        return $this->requirePerson($personId)->toArray();
    }

    public function list(): array
    {
        return array_map(static fn ($person) => $person->toArray(), $this->repository->list());
    }

    private function requirePerson(string $personId)
    {
        $person = $this->repository->findById(Uuid::fromString($personId));
        if (! $person) {
            throw new \RuntimeException('Person not found.');
        }

        return $person;
    }
}
