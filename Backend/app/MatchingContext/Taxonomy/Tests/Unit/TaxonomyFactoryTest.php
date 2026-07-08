<?php

namespace App\MatchingContext\Taxonomy\Tests\Unit;

use App\MatchingContext\SharedKernel\Domain\ValueObjects\Uuid;
use App\MatchingContext\Taxonomy\Domain\Factories\TaxonomyFactory;
use PHPUnit\Framework\TestCase;

class TaxonomyFactoryTest extends TestCase
{
    public function test_factory_creates_and_rehydrates(): void
    {
        $factory = new TaxonomyFactory;

        $category = $factory->createCategory([
            'name' => 'Logistics',
            'parent_id' => null,
            'level' => 1,
            'is_active' => true,
        ]);

        $serviceType = $factory->createServiceType([
            'name' => 'Vehicle Maintenance',
            'category_id' => $category->toArray()['id'],
            'is_active' => true,
        ]);

        $attribute = $factory->createAttribute([
            'service_type_id' => $serviceType->toArray()['id'],
            'name' => 'Vehicle Type',
        ]);

        $value = $factory->createAttributeValue([
            'attribute_id' => $attribute->toArray()['id'],
            'value' => 'Trucks',
        ]);

        $rehydratedCategory = $factory->categoryFromState($category->toArray());
        $this->assertSame($category->toArray()['id'], $rehydratedCategory->toArray()['id']);

        $rehydratedServiceType = $factory->serviceTypeFromState($serviceType->toArray());
        $this->assertSame($serviceType->toArray()['id'], $rehydratedServiceType->toArray()['id']);

        $rehydratedAttribute = $factory->attributeFromState($attribute->toArray());
        $this->assertSame($attribute->toArray()['id'], $rehydratedAttribute->toArray()['id']);

        $rehydratedValue = $factory->attributeValueFromState($value->toArray());
        $this->assertSame($value->toArray()['id'], $rehydratedValue->toArray()['id']);

        $categoryFromState = $factory->categoryFromState([
            'id' => Uuid::random()->value(),
            'name' => 'Farm Inputs',
            'parent_id' => null,
            'level' => 1,
            'is_active' => false,
        ]);

        $this->assertSame('Farm Inputs', $categoryFromState->toArray()['name']);
    }
}
