<?php

namespace App\MatchingContext\Rfs\Domain\Factories;

use App\MatchingContext\Rfs\Domain\Entities\Rfs;
use App\MatchingContext\Rfs\Domain\Entities\RfsConstraint;
use App\MatchingContext\Rfs\Domain\Entities\RfsPreference;
use App\MatchingContext\SharedKernel\Domain\ValueObjects\DateRange;
use App\MatchingContext\SharedKernel\Domain\ValueObjects\Location;
use App\MatchingContext\SharedKernel\Domain\ValueObjects\MoneyRange;
use App\MatchingContext\SharedKernel\Domain\ValueObjects\PreferenceWeights;
use App\MatchingContext\SharedKernel\Domain\ValueObjects\Uuid;

class RfsFactory
{
    public function create(array $payload): Rfs
    {
        $rfsId = Uuid::random();
        $shortId = 'RFS-'.strtoupper(substr(bin2hex(random_bytes(3)), 0, 6));

        return new Rfs(
            $rfsId,
            Uuid::fromString($payload['buyer_id']),
            $payload['title'],
            $payload['description'],
            Uuid::fromString($payload['service_type_id']),
            $payload['project_size'],
            $payload['expertise_level'],
            'DRAFT',
            new \DateTimeImmutable,
            $this->constraintFromPayload($rfsId, $payload['constraints'] ?? []),
            $this->preferenceFromPayload($rfsId, $payload['preferences'] ?? []),
            $shortId,
            null
        );
    }

    public function fromState(array $state): Rfs
    {
        $rfsId = Uuid::fromString($state['id']);

        return new Rfs(
            $rfsId,
            Uuid::fromString($state['buyer_id']),
            $state['title'],
            $state['description'],
            Uuid::fromString($state['service_type_id']),
            $state['project_size'],
            $state['expertise_level'],
            $state['status'],
            isset($state['created_at']) ? new \DateTimeImmutable($state['created_at']) : null,
            isset($state['constraint']) ? $this->constraintFromState($state['constraint']) : null,
            isset($state['preference']) ? $this->preferenceFromState($state['preference']) : null,
            $state['short_id'] ?? null,
            $state['buyer_name'] ?? null
        );
    }

    public function constraintFromPayload(Uuid $rfsId, array $payload): ?RfsConstraint
    {
        if ($payload === []) {
            return null;
        }

        $budget = MoneyRange::fromNullable(
            isset($payload['min_budget']) ? (float) $payload['min_budget'] : null,
            isset($payload['max_budget']) ? (float) $payload['max_budget'] : null
        );

        $timeline = DateRange::fromNullable(
            isset($payload['start_date']) ? new \DateTimeImmutable($payload['start_date']) : null,
            isset($payload['deadline']) ? new \DateTimeImmutable($payload['deadline']) : null
        );

        $location = Location::fromNullable(
            $payload['region'] ?? null,
            $payload['district'] ?? null
        );

        return new RfsConstraint(null, $rfsId, $budget, $timeline, $location);
    }

    public function constraintFromState(array $state): RfsConstraint
    {
        $budget = MoneyRange::fromNullable(
            isset($state['min_budget']) ? (float) $state['min_budget'] : null,
            isset($state['max_budget']) ? (float) $state['max_budget'] : null
        );

        $timeline = DateRange::fromNullable(
            isset($state['start_date']) ? new \DateTimeImmutable($state['start_date']) : null,
            isset($state['deadline']) ? new \DateTimeImmutable($state['deadline']) : null
        );

        $location = Location::fromNullable(
            $state['region'] ?? null,
            $state['district'] ?? null
        );

        return new RfsConstraint(
            isset($state['id']) ? Uuid::fromString($state['id']) : null,
            Uuid::fromString($state['rfs_id']),
            $budget,
            $timeline,
            $location
        );
    }

    public function preferenceFromPayload(Uuid $rfsId, array $payload): ?RfsPreference
    {
        if ($payload === []) {
            return null;
        }

        return new RfsPreference($rfsId, PreferenceWeights::fromArray($payload));
    }

    public function preferenceFromState(array $state): RfsPreference
    {
        return new RfsPreference(
            Uuid::fromString($state['rfs_id']),
            PreferenceWeights::fromArray($state)
        );
    }
}
