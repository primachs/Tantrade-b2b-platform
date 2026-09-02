<?php

namespace App\MatchingContext\Engagement\Presentation\Http;

use App\MatchingContext\Engagement\Application\EngagementMessageService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EngagementMessageController
{
    public function index(Request $request, string $sessionId, EngagementMessageService $service): JsonResponse
    {
        $payload = $request->validate([
            'business_id' => ['required', 'uuid'],
        ]);

        try {
            return response()->json($service->list($sessionId, $payload['business_id']));
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 403);
        }
    }

    public function store(Request $request, string $sessionId, EngagementMessageService $service): JsonResponse
    {
        $payload = $request->validate([
            'sender_business_id' => ['required', 'uuid'],
            'body' => ['required', 'string', 'max:2000'],
        ]);

        try {
            return response()->json($service->send($sessionId, $payload), 201);
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 403);
        }
    }
}