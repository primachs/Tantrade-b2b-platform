<?php

namespace App\MatchingContext\Business\Presentation\Http;

use App\MatchingContext\Business\Application\BusinessService;
use App\MatchingContext\SharedKernel\Domain\Enums\BusinessSize;
use App\MatchingContext\SharedKernel\Domain\Enums\OwnerGender;
use App\MatchingContext\SharedKernel\Domain\Enums\RevenueRange;
use App\MatchingContext\SharedKernel\Domain\Enums\VerificationStatus;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class BusinessController
{
    public function store(Request $request, BusinessService $service): JsonResponse
    {
        $payload = $request->validate([
            'name' => ['required', 'string'],
            'contact_person' => ['required', 'string'],
            'phone' => ['required', 'string'],
            'email' => ['required', 'email'],
            'tin_number' => ['required', 'string'],
            'brela_number' => ['required', 'string'],
            'business_size' => ['required', Rule::in(BusinessSize::values())],
            'is_owner' => ['required', 'boolean'],
            'owner_gender' => ['required', Rule::in(OwnerGender::values())],
            'employee_count' => ['required', 'integer', 'min:0'],
            'revenue_range' => ['required', Rule::in(RevenueRange::values())],
            'region' => ['required', 'string'],
            'district' => ['required', 'string'],
            'address' => ['required', 'string'],
            'verification_status' => ['nullable', Rule::in(VerificationStatus::values())],
            'capabilities' => ['nullable', 'array'],
            'capabilities.*.service_type_id' => ['required_with:capabilities', 'uuid'],
            'capabilities.*.attributes' => ['nullable', 'array'],
            'capabilities.*.attributes.*.attribute_id' => ['required_with:capabilities.*.attributes', 'uuid'],
            'capabilities.*.attributes.*.value' => ['required_with:capabilities.*.attributes', 'string'],
        ]);

        $business = $service->create($payload);

        return response()->json($business, 201);
    }

    public function show(string $businessId, BusinessService $service): JsonResponse
    {
        return response()->json($service->show($businessId));
    }

    public function update(Request $request, string $businessId, BusinessService $service): JsonResponse
    {
        $payload = $request->validate([
            'name' => ['sometimes', 'string'],
            'contact_person' => ['sometimes', 'string'],
            'phone' => ['sometimes', 'string'],
            'email' => ['sometimes', 'email'],
        ]);

        $updated = $service->update($businessId, $payload);

        return response()->json($updated);
    }

    public function upsertVerification(Request $request, string $businessId, BusinessService $service): JsonResponse
    {
        $payload = $request->validate([
            'tin_number' => ['required', 'string'],
            'brela_number' => ['required', 'string'],
            'business_size' => ['required', Rule::in(BusinessSize::values())],
            'is_owner' => ['required', 'boolean'],
            'owner_gender' => ['required', Rule::in(OwnerGender::values())],
            'employee_count' => ['required', 'integer', 'min:0'],
            'revenue_range' => ['required', Rule::in(RevenueRange::values())],
            'region' => ['required', 'string'],
            'district' => ['required', 'string'],
            'address' => ['required', 'string'],
            'verification_status' => ['required', Rule::in(VerificationStatus::values())],
        ]);

        $updated = $service->upsertVerification($businessId, $payload);

        return response()->json($updated);
    }

    public function syncCapabilities(Request $request, string $businessId, BusinessService $service): JsonResponse
    {
        $payload = $request->validate([
            'capabilities' => ['required', 'array', 'min:1'],
            'capabilities.*.service_type_id' => ['required', 'uuid'],
            'capabilities.*.attributes' => ['nullable', 'array'],
            'capabilities.*.attributes.*.attribute_id' => ['required_with:capabilities.*.attributes', 'uuid'],
            'capabilities.*.attributes.*.value' => ['required_with:capabilities.*.attributes', 'string'],
        ]);

        $updated = $service->syncCapabilities($businessId, $payload['capabilities']);

        return response()->json($updated);
    }

    public function trustMetrics(string $businessId, BusinessService $service): JsonResponse
    {
        return response()->json($service->trustMetrics($businessId));
    }
}
