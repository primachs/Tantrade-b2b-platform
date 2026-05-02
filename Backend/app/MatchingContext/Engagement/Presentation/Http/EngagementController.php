<?php

namespace App\MatchingContext\Engagement\Presentation\Http;

use App\MatchingContext\Engagement\Application\EngagementService;
use App\MatchingContext\SharedKernel\Domain\Enums\EngagementOutcome;
use App\MatchingContext\SharedKernel\Domain\Enums\ReportedBy;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class EngagementController
{
    public function store(Request $request, EngagementService $service): JsonResponse
    {
        $payload = $request->validate([
            'rfs_id' => ['required', 'uuid'],
            'buyer_id' => ['required', 'uuid'],
            'seller_id' => ['required', 'uuid'],
        ]);

        $session = $service->createSession($payload);

        return response()->json($session, 201);
    }

    public function show(string $sessionId, EngagementService $service): JsonResponse
    {
        return response()->json($service->show($sessionId));
    }

    public function accept(string $sessionId, EngagementService $service): JsonResponse
    {
        $updated = $service->accept($sessionId);

        return response()->json($updated);
    }

    public function activate(string $sessionId, EngagementService $service): JsonResponse
    {
        $updated = $service->activate($sessionId);

        return response()->json($updated);
    }

    public function stall(string $sessionId, EngagementService $service): JsonResponse
    {
        $updated = $service->stall($sessionId);

        return response()->json($updated);
    }

    public function reportOutcome(Request $request, string $sessionId, EngagementService $service): JsonResponse
    {
        $payload = $request->validate([
            'reported_by' => ['required', Rule::in(ReportedBy::values())],
            'outcome' => ['required', Rule::in(EngagementOutcome::values())],
        ]);

        $report = $service->reportOutcome($sessionId, $payload);

        return response()->json($report, 201);
    }

    public function close(string $sessionId, EngagementService $service): JsonResponse
    {
        $closed = $service->close($sessionId);

        return response()->json($closed);
    }
}
