<?php

namespace App\MatchingContext\Business\Domain\Entities;

use App\MatchingContext\SharedKernel\Domain\ValueObjects\Uuid;

final class BusinessCapability
{
    /** @var BusinessCapabilityAttribute[] */
    private array $attributes;

    public function __construct(
        private readonly ?Uuid $id,
        private readonly Uuid $businessId,
        private readonly Uuid $serviceTypeId,
        array $attributes
    ) {
        $this->attributes = $attributes;
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id?->value(),
            'business_id' => $this->businessId->value(),
            'service_type_id' => $this->serviceTypeId->value(),
            'attributes' => array_map(static fn (BusinessCapabilityAttribute $attribute) => $attribute->toArray(), $this->attributes),
        ];
    }
}
