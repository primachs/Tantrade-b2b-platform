<?php

namespace App\MarketGovernanceContext\Broker\Presentation\Http;

use App\MarketGovernanceContext\Broker\Application\BrokerService;
use App\MarketGovernanceContext\SharedKernel\Domain\Enums\BrokerType;
use App\Support\Validation\TanzaniaRules;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class BrokerController
{
    public function index(Request $request, BrokerService $service): JsonResponse
    {
        $user = $request->user();
        $user?->loadMissing('roles');
        $isAdmin = $user && $user->roles->pluck('name')->contains('ADMIN');

        return response()->json($service->list($isAdmin ? null : (string) $user?->id));
    }

    public function store(Request $request, BrokerService $service): JsonResponse
    {
        $payload = $request->validate([
            'market_id' => ['required', 'uuid'],
            'broker_type' => ['required', Rule::in(BrokerType::values())],
            'first_name' => ['required', 'string', 'max:100'],
            'middle_name' => ['nullable', 'string', 'max:100'],
            'surname' => ['required', 'string', 'max:100'],
            'nida_number' => TanzaniaRules::nida(true),
            'mobile' => TanzaniaRules::mobile(true),
            'address' => ['nullable', 'string', 'max:500'],
        ]);

        $payload['user_id'] = (string) $request->user()?->id;

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
