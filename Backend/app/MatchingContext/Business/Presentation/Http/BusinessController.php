<?php

namespace App\MatchingContext\Business\Presentation\Http;

use App\MatchingContext\Business\Application\BusinessService;
use App\MatchingContext\SharedKernel\Domain\Enums\BusinessSize;
use App\MatchingContext\SharedKernel\Domain\Enums\OwnerGender;
use App\MatchingContext\SharedKernel\Domain\Enums\RevenueRange;
use App\MatchingContext\SharedKernel\Domain\Enums\VerificationStatus;
use App\Support\Geography\TanzaniaRegions;
use App\Support\Validation\TanzaniaRules;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class BusinessController
{
    private function validateDistrictForRegion(Validator $validator, string $regionField = 'region', string $districtField = 'district'): void
    {
        $validator->after(function (Validator $v) use ($regionField, $districtField) {
            $region = $v->getData()[$regionField] ?? null;
            $district = $v->getData()[$districtField] ?? null;
            if ($region && $district && ! TanzaniaRegions::isValidDistrict($region, $district)) {
                $v->errors()->add($districtField, 'The selected district is not valid for the chosen region.');
            }
        });
    }

    private function verificationRules(bool $requireStatus = false): array
    {
        return [
            'tin_number' => TanzaniaRules::tin(false),
            'brela_number' => TanzaniaRules::brela(false),
            'business_size' => ['required', Rule::in(BusinessSize::values())],
            'is_owner' => ['required', 'boolean'],
            'owner_gender' => ['required', Rule::in(OwnerGender::values())],
            'employee_count' => ['required', 'integer', 'min:0'],
            'revenue_range' => ['required', Rule::in(RevenueRange::values())],
            'region' => TanzaniaRules::region(false),
            'district' => TanzaniaRules::district(false),
            'address' => ['nullable', 'string', 'max:500'],
            'verification_status' => $requireStatus
                ? ['nullable', Rule::in(VerificationStatus::values())] // allow missing from frontend, will default to UNVERIFIED
                : ['nullable', Rule::in(VerificationStatus::values())],
        ];
    }

    public function index(BusinessService $service): JsonResponse
    {
        return response()->json($service->list());
    }

    public function myBusiness(Request $request, BusinessService $service): JsonResponse
    {
        $userId = $request->user()?->id;
        if (! $userId) {
            return response()->json(null);
        }

        $business = $service->findByUserId($userId);

        return response()->json($business);
    }

    public function store(Request $request, BusinessService $service): JsonResponse
    {
        $validator = validator($request->all(), array_merge([
            'name' => ['required', 'string', 'max:255'],
            'contact_person' => ['required', 'string', 'max:255'],
            'phone' => TanzaniaRules::mobile(true),
            'email' => ['required', 'email'],
        ], $this->verificationRules(), [
            'capabilities' => ['nullable', 'array'],
            'capabilities.*.service_type_id' => ['required_with:capabilities', 'uuid'],
            'capabilities.*.attributes' => ['nullable', 'array'],
            'capabilities.*.attributes.*.attribute_id' => ['required_with:capabilities.*.attributes', 'uuid'],
            'capabilities.*.attributes.*.value' => ['required_with:capabilities.*.attributes', 'string'],
        ]));

        $this->validateDistrictForRegion($validator);
        $payload = $validator->validate();

        // Attach the authenticated user's ID
        $payload['user_id'] = $request->user()?->id;

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
        $validator = validator($request->all(), $this->verificationRules(true));
        $this->validateDistrictForRegion($validator);
        $payload = $validator->validate();

        $updated = $service->upsertVerification($businessId, $payload);

        return response()->json($updated);
    }

    public function reviewVerification(Request $request, string $businessId, BusinessService $service): JsonResponse
    {
        $payload = $request->validate([
            'verification_status' => ['required', Rule::in(['VERIFIED', 'REJECTED'])],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $updated = $service->reviewVerification($businessId, $payload['verification_status']);

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
