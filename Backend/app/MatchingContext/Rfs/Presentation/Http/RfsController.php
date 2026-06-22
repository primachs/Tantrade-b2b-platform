<?php

namespace App\MatchingContext\Rfs\Presentation\Http;

use App\MatchingContext\Rfs\Application\RfsService;
use App\MatchingContext\SharedKernel\Domain\Enums\ExpertiseLevel;
use App\MatchingContext\SharedKernel\Domain\Enums\ProjectSize;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Validation\Rule;

class RfsController
{
    public function index(Request $request, RfsService $service, \App\MatchingContext\Business\Application\BusinessService $businessService): JsonResponse
    {
        $userId = $request->user()?->id;
        $businessId = null;

        if ($userId) {
            $business = $businessService->findByUserId($userId);
            if ($business) {
                $businessId = $business['id'] ?? null;
            }
        }

        if (!$businessId) {
            return response()->json([]);
        }

        return response()->json($service->list($businessId));
    }

    public function store(Request $request, RfsService $service): JsonResponse
    {
        $payload = $request->validate([
            'buyer_id' => ['required', 'uuid'],
            'title' => ['required', 'string'],
            'description' => ['required', 'string'],
            'service_type_id' => ['required', 'uuid'],
            'project_size' => ['required', Rule::in(ProjectSize::values())],
            'expertise_level' => ['required', Rule::in(ExpertiseLevel::values())],
            'constraints' => ['nullable', 'array'],
            'constraints.min_budget' => ['nullable', 'numeric', 'min:0'],
            'constraints.max_budget' => ['nullable', 'numeric', 'min:0', 'gte:constraints.min_budget'],
            'constraints.start_date' => ['nullable', 'date'],
            'constraints.deadline' => [
                'nullable',
                'date',
                function ($attribute, $value, $fail) use ($request) {
                    $start = data_get($request->all(), 'constraints.start_date');
                    if ($start && $value) {
                        try {
                            $startDate = Carbon::parse($start);
                            $deadline = Carbon::parse($value);
                            if ($deadline->lt($startDate)) {
                                $fail(sprintf('The %s must be a date after or equal to constraints.start_date.', $attribute));
                            }
                        } catch (\Throwable $e) {
                            $fail(sprintf('The %s must be a valid date.', $attribute));
                        }
                    }
                },
            ],
            'constraints.region' => ['nullable', 'string'],
            'constraints.district' => ['nullable', 'string'],
            'preferences' => ['nullable', 'array'],
            'preferences.cost_weight' => ['nullable', 'numeric', 'min:0'],
            'preferences.quality_weight' => ['nullable', 'numeric', 'min:0'],
            'preferences.speed_weight' => ['nullable', 'numeric', 'min:0'],
            'preferences.experience_weight' => ['nullable', 'numeric', 'min:0'],
            'preferences.location_weight' => ['nullable', 'numeric', 'min:0'],
        ]);

        $rfs = $service->create($payload);

        return response()->json($rfs, 201);
    }

    public function show(string $rfsId, RfsService $service): JsonResponse
    {
        return response()->json($service->show($rfsId));
    }

    public function update(Request $request, string $rfsId, RfsService $service): JsonResponse
    {
        $payload = $request->validate([
            'title' => ['sometimes', 'string'],
            'description' => ['sometimes', 'string'],
            'project_size' => ['sometimes', Rule::in(ProjectSize::values())],
            'expertise_level' => ['sometimes', Rule::in(ExpertiseLevel::values())],
            'constraints' => ['nullable', 'array'],
            'constraints.min_budget' => ['nullable', 'numeric', 'min:0'],
            'constraints.max_budget' => ['nullable', 'numeric', 'min:0', 'gte:constraints.min_budget'],
            'constraints.start_date' => ['nullable', 'date'],
            'constraints.deadline' => [
                'nullable',
                'date',
                function ($attribute, $value, $fail) use ($request) {
                    $start = data_get($request->all(), 'constraints.start_date');
                    if ($start && $value) {
                        try {
                            $startDate = Carbon::parse($start);
                            $deadline = Carbon::parse($value);
                            if ($deadline->lt($startDate)) {
                                $fail(sprintf('The %s must be a date after or equal to constraints.start_date.', $attribute));
                            }
                        } catch (\Throwable $e) {
                            $fail(sprintf('The %s must be a valid date.', $attribute));
                        }
                    }
                },
            ],
            'constraints.region' => ['nullable', 'string'],
            'constraints.district' => ['nullable', 'string'],
            'preferences' => ['nullable', 'array'],
            'preferences.cost_weight' => ['nullable', 'numeric', 'min:0'],
            'preferences.quality_weight' => ['nullable', 'numeric', 'min:0'],
            'preferences.speed_weight' => ['nullable', 'numeric', 'min:0'],
            'preferences.experience_weight' => ['nullable', 'numeric', 'min:0'],
            'preferences.location_weight' => ['nullable', 'numeric', 'min:0'],
        ]);

        $updated = $service->update($rfsId, $payload);

        return response()->json($updated);
    }

    public function open(string $rfsId, RfsService $service): JsonResponse
    {
        $opened = $service->open($rfsId);

        return response()->json($opened);
    }
}
