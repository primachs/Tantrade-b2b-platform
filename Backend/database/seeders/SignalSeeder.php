<?php

namespace Database\Seeders;

use App\MatchingContext\Engagement\Infrastructure\Models\EngagementSession;
use App\MatchingContext\Signal\Infrastructure\Models\OutcomeSignal;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

class SignalSeeder extends Seeder
{
    public function run(): void
    {
        $closedSessions = EngagementSession::whereNotNull('outcome')->get();

        foreach ($closedSessions as $session) {
            $signal = OutcomeSignal::where('session_id', $session->id)
                ->where('seller_id', $session->seller_id)
                ->first();

            $data = [
                'session_id' => $session->id,
                'seller_id' => $session->seller_id,
                'outcome' => $session->outcome,
                'confidence_score' => $session->confidence_score ?? 0.75,
                'created_at' => Carbon::now()->subDays(1),
            ];

            if ($signal) {
                $signal->update($data);
            } else {
                OutcomeSignal::create(array_merge(['id' => (string) Str::uuid()], $data));
            }
        }
    }
}
