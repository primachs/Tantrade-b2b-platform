<?php

namespace App\Http\Controllers;

use App\Support\Geography\TanzaniaRegions;
use Illuminate\Http\JsonResponse;

class GeographyController
{
    public function regions(): JsonResponse
    {
        return response()->json([
            'regions' => TanzaniaRegions::all(),
        ]);
    }
}
