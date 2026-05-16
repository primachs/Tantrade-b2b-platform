<?php

namespace App\AuthenticationContext\Auth\Presentation\Http;

use App\AuthenticationContext\Auth\Application\RoleService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RoleController
{
    public function index(Request $request, RoleService $service): JsonResponse
    {
        $payload = $request->validate([
            'user_id' => ['nullable', 'uuid'],
        ]);

        $userId = $payload['user_id'] ?? (string) $request->user()->id;

        return response()->json($service->listRoles($userId));
    }

    public function assign(string $roleId, Request $request, RoleService $service): JsonResponse
    {
        $payload = $request->validate([
            'user_id' => ['nullable', 'uuid'],
        ]);

        $userId = $payload['user_id'] ?? (string) $request->user()->id;

        $service->assignRole($userId, $roleId);

        return response()->json(['message' => 'Role assigned.']);
    }

    public function revoke(string $roleId, Request $request, RoleService $service): JsonResponse
    {
        $payload = $request->validate([
            'user_id' => ['nullable', 'uuid'],
        ]);

        $userId = $payload['user_id'] ?? (string) $request->user()->id;

        $service->revokeRole($userId, $roleId);

        return response()->json(['message' => 'Role revoked.']);
    }
}
