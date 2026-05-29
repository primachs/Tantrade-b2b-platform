<?php

namespace App\AuthenticationContext\Auth\Presentation\Http;

use App\AuthenticationContext\Auth\Application\AuthService;
use App\AuthenticationContext\Auth\Infrastructure\Models\AuthUser;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rules\Password;

class AuthController
{
    public function register(Request $request, AuthService $service): JsonResponse
    {
        $payload = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:auth_users,email'],
            'password' => ['required', 'confirmed', Password::min(12)->mixedCase()->numbers()->symbols()],
        ]);

        $user = $service->register($payload);

        return response()->json($user, 201);
    }

    public function login(Request $request, AuthService $service): JsonResponse
    {
        $payload = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
            'device_name' => ['nullable', 'string', 'max:255'],
        ]);

        $payload['ip'] = $request->ip();
        $payload['user_agent'] = (string) $request->userAgent();

        $result = $service->login($payload);

        return response()->json($result);
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user();
        if (! $user) {
            return response()->json(null, 401);
        }

        $user->load('roles');
        $payload = $user->toArray();
        $payload['roles'] = $user->roles->pluck('name')->values()->all();

        return response()->json($payload);
    }

    public function users(): JsonResponse
    {
        $users = AuthUser::query()
            ->with('roles:id,name')
            ->orderBy('name')
            ->get()
            ->map(function (AuthUser $user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'roles' => $user->roles->pluck('name')->values()->all(),
                ];
            });

        return response()->json($users);
    }

    public function logout(Request $request, AuthService $service): JsonResponse
    {
        $user = $request->user();
        $tokenId = $user?->currentAccessToken()?->id;
        $service->logout((string) $user->id, $tokenId ? (string) $tokenId : null);

        return response()->json(['message' => 'Logged out.']);
    }

    public function changePassword(Request $request, AuthService $service): JsonResponse
    {
        $payload = $request->validate([
            'current_password' => ['required', 'string'],
            'new_password' => ['required', 'confirmed', Password::min(12)->mixedCase()->numbers()->symbols()],
        ]);

        $user = $request->user();
        $service->changePassword((string) $user->id, [
            'current_password' => $payload['current_password'],
            'new_password' => $payload['new_password'],
        ]);

        return response()->json(['message' => 'Password updated.']);
    }
}
