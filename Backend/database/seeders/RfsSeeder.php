<?php

namespace Database\Seeders;

use App\MatchingContext\Business\Infrastructure\Models\Business as BusinessModel;
use App\MatchingContext\Rfs\Infrastructure\Models\Rfs;
use App\MatchingContext\Rfs\Infrastructure\Models\RfsConstraint;
use App\MatchingContext\Rfs\Infrastructure\Models\RfsPreference;
use App\MatchingContext\Taxonomy\Infrastructure\Models\ServiceAttribute;
use App\MatchingContext\Taxonomy\Infrastructure\Models\ServiceType;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

class RfsSeeder extends Seeder
{
    public function run(): void
    {
        $buyer = BusinessModel::where('name', 'Masoko Supermarkets')->first();
        $fallbackBuyer = BusinessModel::first();

        if (! $buyer && ! $fallbackBuyer) {
            return;
        }

        $buyers = [
            'cold_chain' => $buyer ?? $fallbackBuyer,
            'export_docs' => BusinessModel::where('name', 'Kilimanjaro Agro Processors')->first() ?? $buyer ?? $fallbackBuyer,
        ];

        $rfsItems = [
            [
                'key' => 'cold_chain',
                'title' => 'Cold Chain Delivery for Fresh Produce',
                'description' => 'Need temperature-controlled delivery for leafy greens to Dar es Salaam outlets.',
                'service_type' => 'Cold Chain Logistics',
                'project_size' => 'MEDIUM',
                'expertise_level' => 'INTERMEDIATE',
                'status' => 'OPEN',
                'constraints' => [
                    'min_budget' => 25000000,
                    'max_budget' => 60000000,
                    'start_date' => Carbon::now()->addDays(7)->toDateString(),
                    'deadline' => Carbon::now()->addDays(45)->toDateString(),
                    'region' => 'Dar es Salaam',
                    'district' => 'Ilala',
                ],
                'preferences' => [
                    'cost_weight' => 0.3,
                    'quality_weight' => 0.25,
                    'speed_weight' => 0.2,
                    'experience_weight' => 0.15,
                    'location_weight' => 0.1,
                ],
                'attributes' => [
                    ['name' => 'Temperature Range', 'value' => '-18C to 5C'],
                    ['name' => 'Fleet Size', 'value' => '10+ Trucks'],
                ],
            ],
            [
                'key' => 'export_docs',
                'title' => 'Export Documentation for Horticulture',
                'description' => 'Prepare export documentation for avocado shipments to EU buyers.',
                'service_type' => 'Export Documentation',
                'project_size' => 'SMALL',
                'expertise_level' => 'BASIC',
                'status' => 'DRAFT',
                'constraints' => [
                    'min_budget' => 5000000,
                    'max_budget' => 15000000,
                    'start_date' => Carbon::now()->addDays(14)->toDateString(),
                    'deadline' => Carbon::now()->addDays(60)->toDateString(),
                    'region' => 'Arusha',
                    'district' => 'Arumeru',
                ],
                'preferences' => [
                    'cost_weight' => 0.4,
                    'quality_weight' => 0.3,
                    'speed_weight' => 0.15,
                    'experience_weight' => 0.1,
                    'location_weight' => 0.05,
                ],
                'attributes' => [
                    ['name' => 'Supported Markets', 'value' => 'EU, GCC'],
                    ['name' => 'Digital Filing', 'value' => 'Single Window Ready'],
                ],
            ],
        ];

        foreach ($rfsItems as $item) {
            $buyerModel = $buyers[$item['key']] ?? $fallbackBuyer;
            if (! $buyerModel) {
                continue;
            }

            $serviceType = ServiceType::where('name', $item['service_type'])->first();
            if (! $serviceType) {
                continue;
            }

            $rfs = Rfs::firstOrCreate(
                ['buyer_id' => $buyerModel->id, 'title' => $item['title']],
                [
                    'id' => (string) Str::uuid(),
                    'description' => $item['description'],
                    'service_type_id' => $serviceType->id,
                    'project_size' => $item['project_size'],
                    'expertise_level' => $item['expertise_level'],
                    'status' => $item['status'],
                    'created_at' => Carbon::now(),
                ]
            );

            $rfs->update([
                'description' => $item['description'],
                'service_type_id' => $serviceType->id,
                'project_size' => $item['project_size'],
                'expertise_level' => $item['expertise_level'],
                'status' => $item['status'],
            ]);

            $constraint = RfsConstraint::where('rfs_id', $rfs->id)->first();
            if ($constraint) {
                $constraint->update($item['constraints']);
            } else {
                RfsConstraint::create(array_merge(
                    ['id' => (string) Str::uuid(), 'rfs_id' => $rfs->id],
                    $item['constraints']
                ));
            }

            RfsPreference::updateOrCreate(
                ['rfs_id' => $rfs->id],
                $item['preferences']
            );

            // Attributes removed from RFS; skip attribute seeding.
        }
    }
}
