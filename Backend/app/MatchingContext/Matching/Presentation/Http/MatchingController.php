<?php

namespace App\MatchingContext\Matching\Presentation\Http;

use App\MatchingContext\Matching\Application\MatchingService;
use Illuminate\Http\JsonResponse;

class MatchingController
{
    public function match(string $rfsId, MatchingService $service): JsonResponse
    {
        $shortlist = $service->generateShortlist($rfsId);

        return response()->json($shortlist);
    }

    public function shortlist(string $rfsId, MatchingService $service): JsonResponse
    {
        $shortlist = $service->latestShortlist($rfsId);

        return response()->json($shortlist);
    }
}
