<?php

namespace Database\Seeders;

use App\MatchingContext\Business\Infrastructure\Models\Business as BusinessModel;
use App\MatchingContext\Matching\Infrastructure\Models\MatchCandidate;
use App\MatchingContext\Matching\Infrastructure\Models\MatchShortlist;
use App\MatchingContext\Rfs\Infrastructure\Models\Rfs;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

class MatchingSeeder extends Seeder
{
    public function run(): void
    {
        $rfsColdChain = Rfs::where('title', 'Cold Chain Delivery for Fresh Produce')->first();
        $rfsExportDocs = Rfs::where('title', 'Export Documentation for Horticulture')->first();

        $kariakoo = BusinessModel::where('name', 'Kariakoo Logistics')->first();
        $zanzibar = BusinessModel::where('name', 'Zanzibar Exporters Co-op')->first();
        $kilimanjaro = BusinessModel::where('name', 'Kilimanjaro Agro Processors')->first();

        $shortlists = [
            [
                'rfs' => $rfsColdChain,
                'candidates' => [
                    ['seller' => $kariakoo, 'score' => 0.92, 'rank' => 1],
                    ['seller' => $zanzibar, 'score' => 0.83, 'rank' => 2],
                ],
            ],
            [
                'rfs' => $rfsExportDocs,
                'candidates' => [
                    ['seller' => $zanzibar, 'score' => 0.9, 'rank' => 1],
                    ['seller' => $kilimanjaro, 'score' => 0.81, 'rank' => 2],
                ],
            ],
        ];

        foreach ($shortlists as $entry) {
            $rfs = $entry['rfs'];
            if (! $rfs) {
                continue;
            }

            $shortlist = MatchShortlist::firstOrCreate(
                ['rfs_id' => $rfs->id],
                ['id' => (string) Str::uuid(), 'created_at' => Carbon::now()]
            );

            if (! $shortlist->created_at) {
                $shortlist->update(['created_at' => Carbon::now()]);
            }

            MatchCandidate::where('shortlist_id', $shortlist->id)->delete();

            foreach ($entry['candidates'] as $candidate) {
                if (! $candidate['seller']) {
                    continue;
                }

                MatchCandidate::create([
                    'id' => (string) Str::uuid(),
                    'shortlist_id' => $shortlist->id,
                    'seller_id' => $candidate['seller']->id,
                    'score' => $candidate['score'],
                    'rank' => $candidate['rank'],
                ]);
            }
        }
    }
}
