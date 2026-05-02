<?php

namespace App\MatchingContext\Business\Domain\Entities;

use App\MatchingContext\SharedKernel\Domain\ValueObjects\EmailAddress;
use App\MatchingContext\SharedKernel\Domain\ValueObjects\Uuid;

final class Business
{
    /** @var BusinessCapability[] */
    private array $capabilities;

    public function __construct(
        private readonly Uuid $id,
        private readonly string $name,
        private readonly string $contactPerson,
        private readonly string $phone,
        private readonly EmailAddress $email,
        private readonly ?BusinessVerification $verification,
        array $capabilities,
        private readonly ?BusinessTrustMetrics $trustMetrics,
        private readonly ?\DateTimeImmutable $createdAt,
        private readonly ?\DateTimeImmutable $updatedAt
    ) {
        $this->capabilities = $capabilities;
    }

    public function id(): Uuid
    {
        return $this->id;
    }

    public function withProfileUpdates(array $payload): self
    {
        return new self(
            $this->id,
            $payload['name'] ?? $this->name,
            $payload['contact_person'] ?? $this->contactPerson,
            $payload['phone'] ?? $this->phone,
            isset($payload['email']) ? EmailAddress::fromString($payload['email']) : $this->email,
            $this->verification,
            $this->capabilities,
            $this->trustMetrics,
            $this->createdAt,
            $this->updatedAt
        );
    }

    public function withVerification(?BusinessVerification $verification): self
    {
        return new self(
            $this->id,
            $this->name,
            $this->contactPerson,
            $this->phone,
            $this->email,
            $verification,
            $this->capabilities,
            $this->trustMetrics,
            $this->createdAt,
            $this->updatedAt
        );
    }

    /** @param BusinessCapability[] $capabilities */
    public function withCapabilities(array $capabilities): self
    {
        return new self(
            $this->id,
            $this->name,
            $this->contactPerson,
            $this->phone,
            $this->email,
            $this->verification,
            $capabilities,
            $this->trustMetrics,
            $this->createdAt,
            $this->updatedAt
        );
    }

    public function withTrustMetrics(?BusinessTrustMetrics $metrics): self
    {
        return new self(
            $this->id,
            $this->name,
            $this->contactPerson,
            $this->phone,
            $this->email,
            $this->verification,
            $this->capabilities,
            $metrics,
            $this->createdAt,
            $this->updatedAt
        );
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id->value(),
            'name' => $this->name,
            'contact_person' => $this->contactPerson,
            'phone' => $this->phone,
            'email' => $this->email->value(),
            'verification' => $this->verification?->toArray(),
            'capabilities' => array_map(static fn (BusinessCapability $capability) => $capability->toArray(), $this->capabilities),
            'trust_metrics' => $this->trustMetrics?->toArray(),
            'created_at' => $this->createdAt?->format('c'),
            'updated_at' => $this->updatedAt?->format('c'),
        ];
    }
}
