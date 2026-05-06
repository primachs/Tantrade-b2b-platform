<?php

namespace App\MatchingContext\Taxonomy\Infrastructure\Repositories;

use App\MatchingContext\SharedKernel\Domain\ValueObjects\Uuid;
use App\MatchingContext\Taxonomy\Domain\Entities\AttributeValue;
use App\MatchingContext\Taxonomy\Domain\Entities\ServiceAttribute;
use App\MatchingContext\Taxonomy\Domain\Entities\ServiceCategory;
use App\MatchingContext\Taxonomy\Domain\Entities\ServiceType;
use App\MatchingContext\Taxonomy\Domain\Factories\TaxonomyFactory;
use App\MatchingContext\Taxonomy\Domain\Repositories\TaxonomyRepository;
use App\MatchingContext\Taxonomy\Infrastructure\Models\AttributeValue as AttributeValueModel;
use App\MatchingContext\Taxonomy\Infrastructure\Models\ServiceAttribute as ServiceAttributeModel;
use App\MatchingContext\Taxonomy\Infrastructure\Models\ServiceCategory as ServiceCategoryModel;
use App\MatchingContext\Taxonomy\Infrastructure\Models\ServiceType as ServiceTypeModel;

class EloquentTaxonomyRepository implements TaxonomyRepository
{
    public function __construct(private readonly TaxonomyFactory $factory) {}

    public function createCategory(ServiceCategory $category): ServiceCategory
    {
        $data = $category->toArray();
        ServiceCategoryModel::create($data);

        return $category;
    }

    public function createServiceType(ServiceType $type): ServiceType
    {
        $data = $type->toArray();
        ServiceTypeModel::create($data);

        return $type;
    }

    public function createAttribute(ServiceAttribute $attribute): ServiceAttribute
    {
        $data = $attribute->toArray();
        ServiceAttributeModel::create($data);

        return $attribute;
    }

    public function createAttributeValue(AttributeValue $value): AttributeValue
    {
        $data = $value->toArray();
        AttributeValueModel::create($data);

        return $value;
    }

    public function listCategories(): array
    {
        return ServiceCategoryModel::all()->map(function ($model) {
            return $this->factory->categoryFromState($model->toArray());
        })->all();
    }

    public function listCategoriesByParent(Uuid $parentId): array
    {
        return ServiceCategoryModel::where('parent_id', $parentId->value())->get()->map(function ($model) {
            return $this->factory->categoryFromState($model->toArray());
        })->all();
    }

    public function listServiceTypes(): array
    {
        return ServiceTypeModel::all()->map(function ($model) {
            return $this->factory->serviceTypeFromState($model->toArray());
        })->all();
    }

    public function listServiceTypesByCategoryIds(array $categoryIds): array
    {
        return ServiceTypeModel::whereIn('category_id', $categoryIds)->get()->map(function ($model) {
            return $this->factory->serviceTypeFromState($model->toArray());
        })->all();
    }

    public function listAttributes(): array
    {
        return ServiceAttributeModel::all()->map(function ($model) {
            return $this->factory->attributeFromState($model->toArray());
        })->all();
    }

    public function findCategoryById(Uuid $id): ?ServiceCategory
    {
        $model = ServiceCategoryModel::find($id->value());
        if (! $model) {
            return null;
        }

        return $this->factory->categoryFromState($model->toArray());
    }

    public function findServiceTypeById(Uuid $id): ?ServiceType
    {
        $model = ServiceTypeModel::find($id->value());
        if (! $model) {
            return null;
        }

        return $this->factory->serviceTypeFromState($model->toArray());
    }
}
