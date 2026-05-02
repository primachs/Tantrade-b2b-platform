<?php

namespace App\MatchingContext\Taxonomy\Application;

use App\MatchingContext\Taxonomy\Domain\Factories\TaxonomyFactory;
use App\MatchingContext\Taxonomy\Domain\Repositories\TaxonomyRepository;

class TaxonomyService
{
    public function __construct(
        private readonly TaxonomyRepository $repository,
        private readonly TaxonomyFactory $factory
    ) {
    }

    public function createCategory(array $payload): array
    {
        $category = $this->factory->createCategory($payload);
        $this->repository->createCategory($category);

        return $category->toArray();
    }

    public function createServiceType(array $payload): array
    {
        $type = $this->factory->createServiceType($payload);
        $this->repository->createServiceType($type);

        return $type->toArray();
    }

    public function createAttribute(array $payload): array
    {
        $attribute = $this->factory->createAttribute($payload);
        $this->repository->createAttribute($attribute);

        return $attribute->toArray();
    }

    public function createAttributeValue(array $payload): array
    {
        $value = $this->factory->createAttributeValue($payload);
        $this->repository->createAttributeValue($value);

        return $value->toArray();
    }

    public function list(): array
    {
        return [
            'categories' => array_map(static fn ($category) => $category->toArray(), $this->repository->listCategories()),
            'service_types' => array_map(static fn ($type) => $type->toArray(), $this->repository->listServiceTypes()),
            'attributes' => array_map(static fn ($attribute) => $attribute->toArray(), $this->repository->listAttributes()),
        ];
    }
}
