<?php

namespace App\MarketGovernanceContext\Broker\Domain\Entities;

use App\MarketGovernanceContext\SharedKernel\Domain\ValueObjects\Uuid;

final class BrokerRegistration
{
    public function __construct(
        private readonly Uuid $id,
        private readonly ?Uuid $userId,
        private readonly Uuid $marketId,
        private readonly string $brokerType,
        private readonly string $firstName,
        private readonly ?string $middleName,
        private readonly string $surname,
        private readonly ?string $nidaNumber,
        private readonly ?string $mobile,
        private readonly ?string $address,
        private readonly string $status,
        private readonly ?\DateTimeImmutable $createdAt,
        private readonly ?\DateTimeImmutable $updatedAt
    ) {}

    public function id(): Uuid
    {
        return $this->id;
    }

    public function withStatus(string $status): self
    {
        return new self(
            $this->id,
            $this->userId,
            $this->marketId,
            $this->brokerType,
            $this->firstName,
            $this->middleName,
            $this->surname,
            $this->nidaNumber,
            $this->mobile,
            $this->address,
            $status,
            $this->createdAt,
            $this->updatedAt
        );
    }

    public function toArray(): array
    {
        return [
            'id'          => $this->id->value(),
            'user_id'     => $this->userId?->value(),
            'market_id'   => $this->marketId->value(),
            'broker_type' => $this->brokerType,
            'first_name'  => $this->firstName,
            'middle_name' => $this->middleName,
            'surname'     => $this->surname,
            'nida_number' => $this->nidaNumber,
            'mobile'      => $this->mobile,
            'address'     => $this->address,
            'status'      => $this->status,
            'created_at'  => $this->createdAt?->format('c'),
            'updated_at'  => $this->updatedAt?->format('c'),
        ];
    }
}
