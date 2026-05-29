<?php

namespace App\MarketGovernanceContext\Person\Presentation\Http;

use App\Models\User;
use Illuminate\Http\JsonResponse;

class UserController
{
    public function index(): JsonResponse
    {
        $users = User::query()
            ->select(['id', 'name', 'email'])
            ->orderBy('name')
            ->get();

        return response()->json($users);
    }
}
