<?php

namespace App\MarketGovernanceContext\Person\Domain\Factories;

use App\MarketGovernanceContext\Person\Domain\Entities\Person;
use App\MarketGovernanceContext\SharedKernel\Domain\ValueObjects\EmailAddress;
use App\MarketGovernanceContext\SharedKernel\Domain\ValueObjects\Uuid;

class PersonFactory
{
    public function create(array $payload): Person
    {
        return new Person(
            Uuid::random(),
            (int) $payload['user_id'],
            $payload['nida_number'],
            $payload['first_name'],
            $payload['middle_name'] ?? null,
            $payload['surname'],
            $payload['gender'],
            $payload['mobile'],
            EmailAddress::fromString($payload['email']),
            $payload['address'],
            null,
            null
        );
    }

    public function fromState(array $state): Person
    {
        return new Person(
            Uuid::fromString($state['id']),
            (int) $state['user_id'],
            $state['nida_number'],
            $state['first_name'],
            $state['middle_name'] ?? null,
            $state['surname'],
            $state['gender'],
            $state['mobile'],
            EmailAddress::fromString($state['email']),
            $state['address'],
            isset($state['created_at']) ? new \DateTimeImmutable($state['created_at']) : null,
            isset($state['updated_at']) ? new \DateTimeImmutable($state['updated_at']) : null
        );
    }
}
