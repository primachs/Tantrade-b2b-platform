<?php

namespace App\MarketGovernanceContext\Market\Presentation\Http;

use App\MarketGovernanceContext\Market\Application\MarketService;
use App\MarketGovernanceContext\SharedKernel\Domain\Enums\MarketStatus;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class MarketController
{
    public function index(MarketService $service): JsonResponse
    {
        return response()->json($service->list());
    }

    public function store(Request $request, MarketService $service): JsonResponse
    {
        $payload = $request->validate([
            'market_name' => ['required', 'string'],
            'region' => ['required', 'string'],
            'district' => ['required', 'string'],
            'ward' => ['nullable', 'string'],
            'address' => ['required', 'string'],
            'status' => ['nullable', Rule::in(MarketStatus::values())],
        ]);

        $market = $service->create($payload);

        return response()->json($market, 201);
    }

    public function show(string $marketId, MarketService $service): JsonResponse
    {
        return response()->json($service->show($marketId));
    }

    public function update(Request $request, string $marketId, MarketService $service): JsonResponse
    {
        $payload = $request->validate([
            'market_name' => ['sometimes', 'string'],
            'region' => ['sometimes', 'string'],
            'district' => ['sometimes', 'string'],
            'ward' => ['nullable', 'string'],
            'address' => ['sometimes', 'string'],
            'status' => ['sometimes', Rule::in(MarketStatus::values())],
        ]);

        $updated = $service->update($marketId, $payload);

        return response()->json($updated);
    }
}
