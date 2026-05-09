<?php

namespace App\MarketGovernanceContext\Person\Presentation\Http;

use App\MarketGovernanceContext\Person\Application\PersonService;
use App\MarketGovernanceContext\SharedKernel\Domain\Enums\Gender;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class PersonController
{
    public function store(Request $request, PersonService $service): JsonResponse
    {
        $payload = $request->validate([
            'user_id' => ['required', 'integer', 'exists:users,id'],
            'nida_number' => ['required', 'string'],
            'first_name' => ['required', 'string'],
            'middle_name' => ['nullable', 'string'],
            'surname' => ['required', 'string'],
            'gender' => ['required', Rule::in(Gender::values())],
            'mobile' => ['required', 'string'],
            'email' => ['required', 'email'],
            'address' => ['required', 'string'],
        ]);

        $person = $service->create($payload);

        return response()->json($person, 201);
    }

    public function show(string $personId, PersonService $service): JsonResponse
    {
        return response()->json($service->show($personId));
    }

    public function update(Request $request, string $personId, PersonService $service): JsonResponse
    {
        $payload = $request->validate([
            'user_id' => ['sometimes', 'integer', 'exists:users,id'],
            'nida_number' => ['sometimes', 'string'],
            'first_name' => ['sometimes', 'string'],
            'middle_name' => ['nullable', 'string'],
            'surname' => ['sometimes', 'string'],
            'gender' => ['sometimes', Rule::in(Gender::values())],
            'mobile' => ['sometimes', 'string'],
            'email' => ['sometimes', 'email'],
            'address' => ['sometimes', 'string'],
        ]);

        $updated = $service->update($personId, $payload);

        return response()->json($updated);
    }
}
