<?php

namespace App\MarketGovernanceContext\Governance\Presentation\Http;

use App\MarketGovernanceContext\Governance\Application\GovernanceService;
use App\MarketGovernanceContext\SharedKernel\Domain\Enums\OfficeType;
use App\Support\Validation\TanzaniaRules;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class GovernanceController
{
    public function createOffice(Request $request, string $marketId, GovernanceService $service): JsonResponse
    {
        $payload = $request->validate([
            'office_type' => ['nullable', Rule::in(OfficeType::values())],
        ]);

        $office = $service->createOffice($marketId, $payload);

        return response()->json($office, 201);
    }

    public function assignChairperson(Request $request, string $officeId, GovernanceService $service): JsonResponse
    {
        $payload = $request->validate([
            'user_id'    => ['required', 'uuid', 'exists:auth_users,id'],
            'start_date' => ['required', 'date'],
            'end_date'   => ['nullable', 'date', 'after_or_equal:start_date'],
            // Optional profile fields — update AuthUser if provided
            'nida_number' => TanzaniaRules::nida(false),
            'first_name'  => ['nullable', 'string', 'max:100'],
            'middle_name' => ['nullable', 'string', 'max:100'],
            'surname'     => ['nullable', 'string', 'max:100'],
            'gender'      => ['nullable', Rule::in(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY'])],
            'mobile'      => TanzaniaRules::mobile(false),
            'address'     => ['nullable', 'string'],
        ]);

        $term = $service->assignChairperson($officeId, $payload);

        return response()->json($term, 201);
    }

    public function endTerm(Request $request, string $termId, GovernanceService $service): JsonResponse
    {
        $payload = $request->validate([
            'end_date' => ['nullable', 'date'],
        ]);

        $term = $service->endTerm($termId, $payload);

        return response()->json($term);
    }
}
