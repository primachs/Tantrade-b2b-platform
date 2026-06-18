<?php

namespace App\MarketGovernanceContext\Market\Presentation\Http;

use App\MarketGovernanceContext\Market\Application\MarketService;
use App\MarketGovernanceContext\SharedKernel\Domain\Enums\MarketStatus;
use App\Support\Geography\TanzaniaRegions;
use App\Support\Validation\TanzaniaRules;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class MarketController
{
    private function validateDistrictForRegion(Validator $validator): void
    {
        $validator->after(function (Validator $v) {
            $region = $v->getData()['region'] ?? null;
            $district = $v->getData()['district'] ?? null;
            if ($region && $district && ! TanzaniaRegions::isValidDistrict($region, $district)) {
                $v->errors()->add('district', 'The selected district is not valid for the chosen region.');
            }
        });
    }

    private function marketRules(bool $partial = false): array
    {
        $required = $partial ? 'sometimes' : 'required';

        return [
            'market_name' => [$required, 'string', 'max:255'],
            'region' => array_merge([$required], array_slice(TanzaniaRules::region(), 1)),
            'district' => array_merge([$required], array_slice(TanzaniaRules::district(), 1)),
            'ward' => ['nullable', 'string', 'max:100'],
            'address' => [$required, 'string', 'max:500'],
            'status' => ['nullable', Rule::in(MarketStatus::values())],
        ];
    }
    public function index(MarketService $service): JsonResponse
    {
        return response()->json($service->list());
    }

    public function store(Request $request, MarketService $service): JsonResponse
    {
        $validator = validator($request->all(), $this->marketRules());
        $this->validateDistrictForRegion($validator);
        $payload = $validator->validate();

        $market = $service->create($payload);

        return response()->json($market, 201);
    }

    public function show(string $marketId, MarketService $service): JsonResponse
    {
        return response()->json($service->show($marketId));
    }

    public function update(Request $request, string $marketId, MarketService $service): JsonResponse
    {
        $validator = validator($request->all(), $this->marketRules(true));
        $this->validateDistrictForRegion($validator);
        $payload = $validator->validate();

        $updated = $service->update($marketId, $payload);

        return response()->json($updated);
    }
}
