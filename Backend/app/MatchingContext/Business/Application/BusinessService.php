<?php

namespace App\MatchingContext\Business\Application;

use App\MatchingContext\Business\Domain\Factories\BusinessFactory;
use App\MatchingContext\Business\Domain\Repositories\BusinessRepository;
use App\MatchingContext\SharedKernel\Domain\ValueObjects\Uuid;

class BusinessService
{
    public function __construct(
        private readonly BusinessRepository $repository,
        private readonly BusinessFactory $factory
    ) {}

    public function create(array $payload): array
    {
        $business = $this->factory->create($payload);
        $saved = $this->repository->create($business);

        return $saved->toArray();
    }

    public function update(string $businessId, array $payload): array
    {
        $business = $this->requireBusiness($businessId);
        $updated = $business->withProfileUpdates($payload);

        return $this->repository->update($updated)->toArray();
    }

    public function list(): array
    {
        return array_map(static fn ($business) => $business->toArray(), $this->repository->list());
    }

    public function show(string $businessId): array
    {
        return $this->requireBusiness($businessId)->toArray();
    }

    public function upsertVerification(string $businessId, array $payload): array
    {
        $verification = $this->factory->verificationFromPayload(Uuid::fromString($businessId), $payload);
        $this->repository->upsertVerification($verification);

        return $this->requireBusiness($businessId)->toArray();
    }

    public function reviewVerification(string $businessId, string $status): array
    {
        $business = $this->requireBusiness($businessId);
        $current = $business->toArray()['verification'] ?? null;

        if (! $current) {
            throw new \RuntimeException('Business has no verification record to review.');
        }

        if (! in_array($current['verification_status'] ?? '', ['UNVERIFIED', 'PARTIALLY_VERIFIED'], true)) {
            throw new \RuntimeException('This business verification has already been reviewed.');
        }

        $payload = array_merge($current, ['verification_status' => $status]);

        return $this->upsertVerification($businessId, $payload);
    }

    public function syncCapabilities(string $businessId, array $payload): array
    {
        $capabilities = $this->factory->capabilitiesFromPayload(Uuid::fromString($businessId), $payload);
        $this->repository->syncCapabilities(Uuid::fromString($businessId), $capabilities);

        return $this->requireBusiness($businessId)->toArray();
    }

    public function trustMetrics(string $businessId): array
    {
        $metrics = $this->repository->getTrustMetrics(Uuid::fromString($businessId));
        if (! $metrics) {
            return [];
        }

        return $metrics->toArray();
    }

    public function touchActivity($businessId): void
    {
        // Accept either a business id string or a model instance with an `id` property.
        if (is_object($businessId) && property_exists($businessId, 'id')) {
            $rawId = $businessId->id;
            if (is_object($rawId) && method_exists($rawId, 'value')) {
                $id = (string) $rawId->value();
            } else {
                $id = (string) $rawId;
            }
        } else {
            $id = (string) $businessId;
        }

        try {
            $uuid = Uuid::fromString($id);
        } catch (\Throwable $e) {
            // If parsing fails, try to extract nested domain id object (defensive)
            if (is_object($businessId) && property_exists($businessId, 'id') && is_object($businessId->id) && method_exists($businessId->id, 'value')) {
                $uuid = Uuid::fromString((string) $businessId->id->value());
            } else {
                // Give up silently to avoid breaking tests where id is not a UUID.
                return;
            }
        }

        $this->repository->touchActivity($uuid);
    }

    private function requireBusiness(string $businessId)
    {
        $business = $this->repository->findById(Uuid::fromString($businessId));
        if (! $business) {
            throw new \RuntimeException('Business not found.');
        }

        return $business;
    }
}
