<?php

namespace App\MarketGovernanceContext\Governance\Presentation\Http;

use App\MarketGovernanceContext\Governance\Application\GovernanceService;
use App\MarketGovernanceContext\SharedKernel\Domain\Enums\OfficeType;
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
            'person_id' => ['required', 'uuid'],
            'start_date' => ['required', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
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
