<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            AuthContextSeeder::class,
            TaxonomySeeder::class,
            BusinessSeeder::class,
            RfsSeeder::class,
            MatchingSeeder::class,
            EngagementSeeder::class,
            SignalSeeder::class,
            MarketGovernanceSeeder::class,
        ]);
    }
}
