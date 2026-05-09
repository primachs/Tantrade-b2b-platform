<?php

namespace App\MarketGovernanceContext\Person\Domain\Entities;

use App\MarketGovernanceContext\SharedKernel\Domain\ValueObjects\EmailAddress;
use App\MarketGovernanceContext\SharedKernel\Domain\ValueObjects\Uuid;

final class Person
{
    public function __construct(
        private readonly Uuid $id,
        private readonly int $userId,
        private readonly string $nidaNumber,
        private readonly string $firstName,
        private readonly ?string $middleName,
        private readonly string $surname,
        private readonly string $gender,
        private readonly string $mobile,
        private readonly EmailAddress $email,
        private readonly string $address,
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
            $payload['user_id'] ?? $this->userId,
            $payload['nida_number'] ?? $this->nidaNumber,
            $payload['first_name'] ?? $this->firstName,
            array_key_exists('middle_name', $payload) ? $payload['middle_name'] : $this->middleName,
            $payload['surname'] ?? $this->surname,
            $payload['gender'] ?? $this->gender,
            $payload['mobile'] ?? $this->mobile,
            isset($payload['email']) ? EmailAddress::fromString($payload['email']) : $this->email,
            $payload['address'] ?? $this->address,
            $this->createdAt,
            $this->updatedAt
        );
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id->value(),
            'user_id' => $this->userId,
            'nida_number' => $this->nidaNumber,
            'first_name' => $this->firstName,
            'middle_name' => $this->middleName,
            'surname' => $this->surname,
            'gender' => $this->gender,
            'mobile' => $this->mobile,
            'email' => $this->email->value(),
            'address' => $this->address,
            'created_at' => $this->createdAt?->format('c'),
            'updated_at' => $this->updatedAt?->format('c'),
        ];
    }
}
