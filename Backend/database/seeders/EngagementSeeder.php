<?php

namespace Database\Seeders;

use App\MatchingContext\Business\Infrastructure\Models\Business as BusinessModel;
use App\MatchingContext\Engagement\Infrastructure\Models\EngagementSession;
use App\MatchingContext\Engagement\Infrastructure\Models\SessionReport;
use App\MatchingContext\Rfs\Infrastructure\Models\Rfs;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

class EngagementSeeder extends Seeder
{
    public function run(): void
    {
        $rfsColdChain = Rfs::where('title', 'Cold Chain Delivery for Fresh Produce')->first();
        $rfsExportDocs = Rfs::where('title', 'Export Documentation for Horticulture')->first();

        $buyerMasoko = BusinessModel::where('name', 'Masoko Supermarkets')->first();
        $sellerKariakoo = BusinessModel::where('name', 'Kariakoo Logistics')->first();
        $sellerZanzibar = BusinessModel::where('name', 'Zanzibar Exporters Co-op')->first();

        $sessions = [
            [
                'rfs' => $rfsColdChain,
                'buyer' => $buyerMasoko,
                'seller' => $sellerKariakoo,
                'status' => 'ACTIVE',
                'outcome' => null,
                'confidence_score' => 0.62,
                'closed_at' => null,
            ],
            [
                'rfs' => $rfsExportDocs,
                'buyer' => $buyerMasoko,
                'seller' => $sellerZanzibar,
                'status' => 'CLOSED',
                'outcome' => 'DEAL_CONFIRMED',
                'confidence_score' => 0.82,
                'closed_at' => Carbon::now()->subDays(3),
            ],
        ];

        foreach ($sessions as $sessionData) {
            $rfs = $sessionData['rfs'];
            $buyer = $sessionData['buyer'];
            $seller = $sessionData['seller'];

            if (! $rfs || ! $buyer || ! $seller) {
                continue;
            }

            $session = EngagementSession::firstOrCreate(
                [
                    'rfs_id' => $rfs->id,
                    'buyer_id' => $buyer->id,
                    'seller_id' => $seller->id,
                ],
                [
                    'id' => (string) Str::uuid(),
                    'status' => $sessionData['status'],
                    'outcome' => $sessionData['outcome'],
                    'confidence_score' => $sessionData['confidence_score'],
                    'created_at' => Carbon::now()->subDays(10),
                    'closed_at' => $sessionData['closed_at'],
                ]
            );

            $session->update([
                'status' => $sessionData['status'],
                'outcome' => $sessionData['outcome'],
                'confidence_score' => $sessionData['confidence_score'],
                'closed_at' => $sessionData['closed_at'],
            ]);

            SessionReport::where('session_id', $session->id)->delete();

            if ($sessionData['outcome']) {
                SessionReport::create([
                    'id' => (string) Str::uuid(),
                    'session_id' => $session->id,
                    'reported_by' => 'BUYER',
                    'outcome' => $sessionData['outcome'],
                    'created_at' => Carbon::now()->subDays(2),
                ]);

                SessionReport::create([
                    'id' => (string) Str::uuid(),
                    'session_id' => $session->id,
                    'reported_by' => 'SELLER',
                    'outcome' => $sessionData['outcome'],
                    'created_at' => Carbon::now()->subDays(2),
                ]);
            }
        }
    }
}
