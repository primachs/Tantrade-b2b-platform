<?php

namespace App\MatchingContext\Rfs\Domain\Entities;

use App\MatchingContext\SharedKernel\Domain\ValueObjects\Uuid;

final class Rfs
{
    /** @var RfsAttribute[] */
    private array $attributes;

    public function __construct(
        private readonly Uuid $id,
        private readonly Uuid $buyerId,
        private readonly string $title,
        private readonly string $description,
        private readonly Uuid $serviceTypeId,
        private readonly string $projectSize,
        private readonly string $expertiseLevel,
        private readonly string $status,
        private readonly ?\DateTimeImmutable $createdAt,
        private readonly ?RfsConstraint $constraint,
        private readonly ?RfsPreference $preference,
        array $attributes
    ) {
        $this->attributes = $attributes;
    }

    public function id(): Uuid
    {
        return $this->id;
    }

    public function status(): string
    {
        return $this->status;
    }

    public function serviceTypeId(): Uuid
    {
        return $this->serviceTypeId;
    }

    public function constraint(): ?RfsConstraint
    {
        return $this->constraint;
    }

    public function preference(): ?RfsPreference
    {
        return $this->preference;
    }

    /** @return RfsAttribute[] */
    public function attributes(): array
    {
        return $this->attributes;
    }

    public function withStatus(string $status): self
    {
        return new self(
            $this->id,
            $this->buyerId,
            $this->title,
            $this->description,
            $this->serviceTypeId,
            $this->projectSize,
            $this->expertiseLevel,
            $status,
            $this->createdAt,
            $this->constraint,
            $this->preference,
            $this->attributes
        );
    }

    public function withUpdates(array $payload): self
    {
        return new self(
            $this->id,
            $this->buyerId,
            $payload['title'] ?? $this->title,
            $payload['description'] ?? $this->description,
            $this->serviceTypeId,
            $payload['project_size'] ?? $this->projectSize,
            $payload['expertise_level'] ?? $this->expertiseLevel,
            $this->status,
            $this->createdAt,
            $this->constraint,
            $this->preference,
            $this->attributes
        );
    }

    public function withConstraint(?RfsConstraint $constraint): self
    {
        return new self(
            $this->id,
            $this->buyerId,
            $this->title,
            $this->description,
            $this->serviceTypeId,
            $this->projectSize,
            $this->expertiseLevel,
            $this->status,
            $this->createdAt,
            $constraint,
            $this->preference,
            $this->attributes
        );
    }

    public function withPreference(?RfsPreference $preference): self
    {
        return new self(
            $this->id,
            $this->buyerId,
            $this->title,
            $this->description,
            $this->serviceTypeId,
            $this->projectSize,
            $this->expertiseLevel,
            $this->status,
            $this->createdAt,
            $this->constraint,
            $preference,
            $this->attributes
        );
    }

    /** @param RfsAttribute[] $attributes */
    public function withAttributes(array $attributes): self
    {
        return new self(
            $this->id,
            $this->buyerId,
            $this->title,
            $this->description,
            $this->serviceTypeId,
            $this->projectSize,
            $this->expertiseLevel,
            $this->status,
            $this->createdAt,
            $this->constraint,
            $this->preference,
            $attributes
        );
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id->value(),
            'buyer_id' => $this->buyerId->value(),
            'title' => $this->title,
            'description' => $this->description,
            'service_type_id' => $this->serviceTypeId->value(),
            'project_size' => $this->projectSize,
            'expertise_level' => $this->expertiseLevel,
            'status' => $this->status,
            'created_at' => $this->createdAt?->format('c'),
            'constraint' => $this->constraint?->toArray(),
            'preference' => $this->preference?->toArray(),
            'attributes' => array_map(static fn (RfsAttribute $attribute) => $attribute->toArray(), $this->attributes),
        ];
    }
}
