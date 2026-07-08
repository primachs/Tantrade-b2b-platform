<?php

namespace App\MatchingContext\Taxonomy\Presentation\Http;

use App\MatchingContext\Taxonomy\Application\TaxonomyService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TaxonomyController
{
    public function storeCategory(Request $request, TaxonomyService $service): JsonResponse
    {
        $payload = $request->validate([
            'name' => ['required', 'string'],
            'parent_id' => ['nullable', 'uuid'],
            'level' => ['required', 'integer', 'min:1', 'max:3'],
            'is_active' => ['required', 'boolean'],
        ]);

        $category = $service->createCategory($payload);

        return response()->json($category, 201);
    }

    public function storeServiceType(Request $request, TaxonomyService $service): JsonResponse
    {
        $payload = $request->validate([
            'name' => ['required', 'string'],
            'category_id' => ['required', 'uuid'],
            'is_active' => ['required', 'boolean'],
        ]);

        $type = $service->createServiceType($payload);

        return response()->json($type, 201);
    }

    public function storeAttribute(Request $request, TaxonomyService $service): JsonResponse
    {
        $payload = $request->validate([
            'service_type_id' => ['required', 'uuid'],
            'name' => ['required', 'string'],
        ]);

        $attribute = $service->createAttribute($payload);

        return response()->json($attribute, 201);
    }

    public function storeAttributeValue(Request $request, TaxonomyService $service): JsonResponse
    {
        $payload = $request->validate([
            'attribute_id' => ['required', 'uuid'],
            'value' => ['required', 'string'],
        ]);

        $value = $service->createAttributeValue($payload);

        return response()->json($value, 201);
    }

    public function index(TaxonomyService $service): JsonResponse
    {
        return response()->json($service->list());
    }
}
