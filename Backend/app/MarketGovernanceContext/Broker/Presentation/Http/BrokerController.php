<?php

namespace App\MarketGovernanceContext\Broker\Presentation\Http;

use App\MarketGovernanceContext\Broker\Application\BrokerService;
use App\MarketGovernanceContext\SharedKernel\Domain\Enums\BrokerType;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class BrokerController
{
    public function store(Request $request, BrokerService $service): JsonResponse
    {
        $payload = $request->validate([
            'person_id' => ['required', 'uuid'],
            'market_id' => ['required', 'uuid'],
            'broker_type' => ['required', Rule::in(BrokerType::values())],
        ]);

        $registration = $service->register($payload);

        return response()->json($registration, 201);
    }

    public function show(string $brokerId, BrokerService $service): JsonResponse
    {
        return response()->json($service->show($brokerId));
    }

    public function deactivate(string $brokerId, BrokerService $service): JsonResponse
    {
        $registration = $service->deactivate($brokerId);

        return response()->json($registration);
    }
}
