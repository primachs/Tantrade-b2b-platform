<?php

namespace App\MatchingContext\Rfs\Application;

use App\MatchingContext\Rfs\Domain\Factories\RfsFactory;
use App\MatchingContext\Rfs\Domain\Repositories\RfsRepository;
use App\MatchingContext\SharedKernel\Domain\ValueObjects\Uuid;
use App\MatchingContext\SharedKernel\Infrastructure\DomainEvents\DomainEventRecorder;

class RfsService
{
    public function __construct(
        private readonly RfsRepository $repository,
        private readonly RfsFactory $factory,
        private readonly DomainEventRecorder $events
    ) {}

    public function create(array $payload): array
    {
        $rfs = $this->factory->create($payload);
        $saved = $this->repository->create($rfs);

        $this->events->record('RFSCreated', $saved->id()->value(), [
            'buyer_id' => $payload['buyer_id'],
            'service_type_id' => $payload['service_type_id'],
        ]);

        return $saved->toArray();
    }

    public function update(string $rfsId, array $payload): array
    {
        $rfs = $this->requireRfs($rfsId);
        if ($rfs->status() === 'CLOSED') {
            throw new \RuntimeException('Closed RFS cannot be modified.');
        }

        $updated = $rfs->withUpdates($payload);
        $this->repository->update($updated);

        if (array_key_exists('constraints', $payload)) {
            $constraint = $this->factory->constraintFromPayload(Uuid::fromString($rfsId), $payload['constraints'] ?? []);
            if ($constraint) {
                $this->repository->upsertConstraint($constraint);
            }
        }

        if (array_key_exists('preferences', $payload)) {
            $preference = $this->factory->preferenceFromPayload(Uuid::fromString($rfsId), $payload['preferences'] ?? []);
            if ($preference) {
                $this->repository->upsertPreference($preference);
            }
        }

        if (array_key_exists('attributes', $payload)) {
            $attributes = $this->factory->attributesFromPayload(Uuid::fromString($rfsId), $payload['attributes'] ?? []);
            $this->repository->replaceAttributes(Uuid::fromString($rfsId), $attributes);
        }

        return $this->requireRfs($rfsId)->toArray();
    }

    public function show(string $rfsId): array
    {
        return $this->requireRfs($rfsId)->toArray();
    }

    public function open(string $rfsId): array
    {
        $rfs = $this->requireRfs($rfsId);
        if ($rfs->status() !== 'DRAFT') {
            throw new \RuntimeException('Only DRAFT RFS can be opened.');
        }

        $constraint = $rfs->constraint();
        if (! $constraint) {
            throw new \RuntimeException('RFS must include at least one constraint.');
        }

        $budget = $constraint->budget();
        $timeline = $constraint->timeline();
        $location = $constraint->location();
        $hasConstraint = $budget->min() !== null
            || $budget->max() !== null
            || $timeline->start() !== null
            || $timeline->end() !== null
            || $location->region() !== null
            || $location->district() !== null;

        if (! $hasConstraint) {
            throw new \RuntimeException('RFS must include at least one constraint.');
        }

        $this->repository->updateStatus(Uuid::fromString($rfsId), 'OPEN');

        $this->events->record('RFSOpened', $rfsId, [
            'buyer_id' => $rfs->toArray()['buyer_id'],
        ]);

        return $this->requireRfs($rfsId)->toArray();
    }

    private function requireRfs(string $rfsId)
    {
        $rfs = $this->repository->findById(Uuid::fromString($rfsId));
        if (! $rfs) {
            throw new \RuntimeException('RFS not found.');
        }

        return $rfs;
    }
}
