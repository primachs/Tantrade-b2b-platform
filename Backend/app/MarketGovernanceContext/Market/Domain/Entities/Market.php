<?php

namespace App\MarketGovernanceContext\Market\Domain\Entities;

use App\MarketGovernanceContext\SharedKernel\Domain\ValueObjects\Uuid;

final class Market
{
    public function __construct(
        private readonly Uuid $id,
        private readonly string $marketName,
        private readonly string $region,
        private readonly string $district,
        private readonly ?string $ward,
        private readonly string $address,
        private readonly string $status,
        private readonly ?\DateTimeImmutable $createdAt,
        private readonly ?\DateTimeImmutable $updatedAt
    ) {}

    public function id(): Uuid
    {
        return $this->id;
    }

    public function withUpdates(array $payload): self
    {
        return new self(
            $this->id,
            $payload['market_name'] ?? $this->marketName,
            $payload['region'] ?? $this->region,
            $payload['district'] ?? $this->district,
            array_key_exists('ward', $payload) ? $payload['ward'] : $this->ward,
            $payload['address'] ?? $this->address,
            $payload['status'] ?? $this->status,
            $this->createdAt,
            $this->updatedAt
        );
    }

    public function withStatus(string $status): self
    {
        return new self(
            $this->id,
            $this->marketName,
            $this->region,
            $this->district,
            $this->ward,
            $this->address,
            $status,
            $this->createdAt,
            $this->updatedAt
        );
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id->value(),
            'market_name' => $this->marketName,
            'region' => $this->region,
            'district' => $this->district,
            'ward' => $this->ward,
            'address' => $this->address,
            'status' => $this->status,
            'created_at' => $this->createdAt?->format('c'),
            'updated_at' => $this->updatedAt?->format('c'),
        ];
    }
}
