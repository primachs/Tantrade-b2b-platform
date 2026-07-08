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
    public function index(Request $request, EngagementService $service): JsonResponse
    {
        $payload = $request->validate([
            'seller_id' => ['nullable', 'uuid'],
            'buyer_id' => ['nullable', 'uuid'],
        ]);

        if (! empty($payload['buyer_id'])) {
            return response()->json($service->listByBuyer($payload['buyer_id']));
        }

        if (! empty($payload['seller_id'])) {
            return response()->json($service->listBySeller($payload['seller_id']));
        }

        return response()->json([]);
    }

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

    public function reject(string $sessionId, EngagementService $service): JsonResponse
    {
        $updated = $service->reject($sessionId);

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
            'reason' => ['nullable', 'string', 'max:255'],
            'notes' => ['nullable', 'string', 'max:1000'],
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
