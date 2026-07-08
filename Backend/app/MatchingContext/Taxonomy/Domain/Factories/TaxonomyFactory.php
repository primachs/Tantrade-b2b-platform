<?php

namespace App\MatchingContext\Taxonomy\Domain\Factories;

use App\MatchingContext\SharedKernel\Domain\ValueObjects\Uuid;
use App\MatchingContext\Taxonomy\Domain\Entities\AttributeValue;
use App\MatchingContext\Taxonomy\Domain\Entities\ServiceAttribute;
use App\MatchingContext\Taxonomy\Domain\Entities\ServiceCategory;
use App\MatchingContext\Taxonomy\Domain\Entities\ServiceType;

class TaxonomyFactory
{
    public function createCategory(array $payload): ServiceCategory
    {
        return new ServiceCategory(
            Uuid::random(),
            $payload['name'],
            isset($payload['parent_id']) ? Uuid::fromString($payload['parent_id']) : null,
            (int) $payload['level'],
            (bool) $payload['is_active']
        );
    }

    public function createServiceType(array $payload): ServiceType
    {
        return new ServiceType(
            Uuid::random(),
            $payload['name'],
            Uuid::fromString($payload['category_id']),
            (bool) $payload['is_active']
        );
    }

    public function createAttribute(array $payload): ServiceAttribute
    {
        return new ServiceAttribute(
            Uuid::random(),
            Uuid::fromString($payload['service_type_id']),
            $payload['name']
        );
    }

    public function createAttributeValue(array $payload): AttributeValue
    {
        return new AttributeValue(
            Uuid::random(),
            Uuid::fromString($payload['attribute_id']),
            $payload['value']
        );
    }

    public function categoryFromState(array $state): ServiceCategory
    {
        return new ServiceCategory(
            Uuid::fromString($state['id']),
            $state['name'],
            isset($state['parent_id']) ? Uuid::fromString($state['parent_id']) : null,
            (int) $state['level'],
            (bool) $state['is_active']
        );
    }

    public function serviceTypeFromState(array $state): ServiceType
    {
        return new ServiceType(
            Uuid::fromString($state['id']),
            $state['name'],
            Uuid::fromString($state['category_id']),
            (bool) $state['is_active']
        );
    }

    public function attributeFromState(array $state): ServiceAttribute
    {
        return new ServiceAttribute(
            Uuid::fromString($state['id']),
            Uuid::fromString($state['service_type_id']),
            $state['name']
        );
    }

    public function attributeValueFromState(array $state): AttributeValue
    {
        return new AttributeValue(
            Uuid::fromString($state['id']),
            Uuid::fromString($state['attribute_id']),
            $state['value']
        );
    }
}
