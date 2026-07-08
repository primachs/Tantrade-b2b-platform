<?php

namespace App\MatchingContext\Taxonomy\Domain\Repositories;

use App\MatchingContext\SharedKernel\Domain\ValueObjects\Uuid;
use App\MatchingContext\Taxonomy\Domain\Entities\AttributeValue;
use App\MatchingContext\Taxonomy\Domain\Entities\ServiceAttribute;
use App\MatchingContext\Taxonomy\Domain\Entities\ServiceCategory;
use App\MatchingContext\Taxonomy\Domain\Entities\ServiceType;

interface TaxonomyRepository
{
    public function createCategory(ServiceCategory $category): ServiceCategory;

    public function createServiceType(ServiceType $type): ServiceType;

    public function createAttribute(ServiceAttribute $attribute): ServiceAttribute;

    public function createAttributeValue(AttributeValue $value): AttributeValue;

    /** @return ServiceCategory[] */
    public function listCategories(): array;

    /** @return ServiceCategory[] */
    public function listCategoriesByParent(Uuid $parentId): array;

    /** @return ServiceType[] */
    public function listServiceTypes(): array;

    /** @return ServiceType[] */
    public function listServiceTypesByCategoryIds(array $categoryIds): array;

    /** @return ServiceAttribute[] */
    public function listAttributes(): array;

    public function findCategoryById(Uuid $id): ?ServiceCategory;

    public function findServiceTypeById(Uuid $id): ?ServiceType;
}
