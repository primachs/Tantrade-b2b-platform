<?php

namespace Database\Seeders;

use App\MatchingContext\Business\Infrastructure\Models\Business as BusinessModel;
use App\MatchingContext\Business\Infrastructure\Models\BusinessCapability;
use App\MatchingContext\Business\Infrastructure\Models\BusinessCapabilityAttribute;
use App\MatchingContext\Business\Infrastructure\Models\BusinessTrustMetrics;
use App\MatchingContext\Business\Infrastructure\Models\BusinessVerification;
use App\MatchingContext\Taxonomy\Infrastructure\Models\ServiceAttribute;
use App\MatchingContext\Taxonomy\Infrastructure\Models\ServiceType;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class BusinessSeeder extends Seeder
{
    public function run(): void
    {
        $businesses = [
            [
                'name' => 'Masoko Supermarkets',
                'contact_person' => 'Asha Mrema',
                'phone' => '+255712000001',
                'email' => 'masoko@tantrade.go.tz',
                'verification' => [
                    'tin_number' => 'TIN-10001',
                    'brela_number' => 'BRELA-20001',
                    'business_size' => 'LARGE',
                    'is_owner' => true,
                    'owner_gender' => 'FEMALE',
                    'employee_count' => 280,
                    'revenue_range' => 'ABOVE_5B',
                    'region' => 'Dar es Salaam',
                    'district' => 'Kinondoni',
                    'address' => 'Sam Nujoma Road, Dar es Salaam',
                    'verification_status' => 'VERIFIED',
                ],
                'trust_metrics' => [
                    'reliability_score' => 0.94,
                    'success_rate' => 0.91,
                    'response_rate' => 0.96,
                    'dispute_rate' => 0.03,
                    'avg_response_time' => 12.5,
                    'session_completion_rate' => 0.89,
                ],
                'capabilities' => [],
            ],
            [
                'name' => 'Kariakoo Logistics',
                'contact_person' => 'Joseph Mlay',
                'phone' => '+255713000112',
                'email' => 'logistics@tantrade.go.tz',
                'verification' => [
                    'tin_number' => 'TIN-11002',
                    'brela_number' => 'BRELA-21002',
                    'business_size' => 'MEDIUM',
                    'is_owner' => false,
                    'owner_gender' => 'MALE',
                    'employee_count' => 75,
                    'revenue_range' => 'BETWEEN_500M_5B',
                    'region' => 'Dar es Salaam',
                    'district' => 'Ilala',
                    'address' => 'Nyerere Road, Dar es Salaam',
                    'verification_status' => 'VERIFIED',
                ],
                'trust_metrics' => [
                    'reliability_score' => 0.88,
                    'success_rate' => 0.84,
                    'response_rate' => 0.9,
                    'dispute_rate' => 0.06,
                    'avg_response_time' => 18.2,
                    'session_completion_rate' => 0.82,
                ],
                'capabilities' => [
                    [
                        'service_type' => 'Cold Chain Logistics',
                        'attributes' => [
                            ['name' => 'Fleet Size', 'value' => '10+ Trucks'],
                            ['name' => 'Temperature Range', 'value' => '-18C to 5C'],
                        ],
                    ],
                    [
                        'service_type' => 'Freight Forwarding',
                        'attributes' => [
                            ['name' => 'Modes Supported', 'value' => 'Road, Sea, Air'],
                            ['name' => 'Customs Clearance', 'value' => 'In-house Licensed'],
                        ],
                    ],
                ],
            ],
            [
                'name' => 'Kilimanjaro Agro Processors',
                'contact_person' => 'Neema Kimaro',
                'phone' => '+255714000223',
                'email' => 'agro@tantrade.go.tz',
                'verification' => [
                    'tin_number' => 'TIN-12003',
                    'brela_number' => 'BRELA-22003',
                    'business_size' => 'MEDIUM',
                    'is_owner' => true,
                    'owner_gender' => 'FEMALE',
                    'employee_count' => 120,
                    'revenue_range' => 'BETWEEN_500M_5B',
                    'region' => 'Arusha',
                    'district' => 'Arumeru',
                    'address' => 'Sakina Industrial Area, Arusha',
                    'verification_status' => 'PARTIALLY_VERIFIED',
                ],
                'trust_metrics' => [
                    'reliability_score' => 0.86,
                    'success_rate' => 0.83,
                    'response_rate' => 0.88,
                    'dispute_rate' => 0.05,
                    'avg_response_time' => 20.1,
                    'session_completion_rate' => 0.79,
                ],
                'capabilities' => [
                    [
                        'service_type' => 'Packaging & Labeling',
                        'attributes' => [
                            ['name' => 'Packaging Types', 'value' => 'Vacuum and Pouches'],
                            ['name' => 'Daily Throughput', 'value' => '12,000 Units'],
                        ],
                    ],
                    [
                        'service_type' => 'Quality Assurance',
                        'attributes' => [
                            ['name' => 'Certifications', 'value' => 'ISO 22000'],
                            ['name' => 'Inspection Turnaround', 'value' => '48 Hours'],
                        ],
                    ],
                ],
            ],
            [
                'name' => 'Zanzibar Exporters Co-op',
                'contact_person' => 'Hassan Juma',
                'phone' => '+255715000334',
                'email' => 'exporters@tantrade.go.tz',
                'verification' => [
                    'tin_number' => 'TIN-13004',
                    'brela_number' => 'BRELA-23004',
                    'business_size' => 'SMALL',
                    'is_owner' => true,
                    'owner_gender' => 'MALE',
                    'employee_count' => 35,
                    'revenue_range' => 'BETWEEN_50M_500M',
                    'region' => 'Zanzibar',
                    'district' => 'Mjini',
                    'address' => 'Malindi Port, Zanzibar',
                    'verification_status' => 'VERIFIED',
                ],
                'trust_metrics' => [
                    'reliability_score' => 0.9,
                    'success_rate' => 0.87,
                    'response_rate' => 0.92,
                    'dispute_rate' => 0.04,
                    'avg_response_time' => 14.7,
                    'session_completion_rate' => 0.85,
                ],
                'capabilities' => [
                    [
                        'service_type' => 'Export Documentation',
                        'attributes' => [
                            ['name' => 'Supported Markets', 'value' => 'EU, GCC'],
                            ['name' => 'Digital Filing', 'value' => 'Single Window Ready'],
                        ],
                    ],
                    [
                        'service_type' => 'Crop Aggregation',
                        'attributes' => [
                            ['name' => 'Storage Capacity', 'value' => '300+ Tons'],
                            ['name' => 'Regions Served', 'value' => 'Coastal Zone'],
                        ],
                    ],
                ],
            ],
        ];

        foreach ($businesses as $data) {
            $business = BusinessModel::firstOrCreate(
                ['email' => $data['email']],
                [
                    'id' => (string) Str::uuid(),
                    'name' => $data['name'],
                    'contact_person' => $data['contact_person'],
                    'phone' => $data['phone'],
                ]
            );

            $business->update([
                'name' => $data['name'],
                'contact_person' => $data['contact_person'],
                'phone' => $data['phone'],
            ]);

            $verification = BusinessVerification::where('business_id', $business->id)->first();
            if ($verification) {
                $verification->update($data['verification']);
            } else {
                BusinessVerification::create(array_merge(
                    ['id' => (string) Str::uuid(), 'business_id' => $business->id],
                    $data['verification']
                ));
            }

            BusinessTrustMetrics::updateOrCreate(
                ['business_id' => $business->id],
                $data['trust_metrics']
            );

            BusinessCapability::where('business_id', $business->id)->delete();

            foreach ($data['capabilities'] as $capability) {
                $serviceType = ServiceType::where('name', $capability['service_type'])->first();
                if (! $serviceType) {
                    continue;
                }

                $capabilityModel = BusinessCapability::create([
                    'id' => (string) Str::uuid(),
                    'business_id' => $business->id,
                    'service_type_id' => $serviceType->id,
                ]);

                foreach ($capability['attributes'] as $attribute) {
                    $attributeModel = ServiceAttribute::where('service_type_id', $serviceType->id)
                        ->where('name', $attribute['name'])
                        ->first();

                    if (! $attributeModel) {
                        continue;
                    }

                    BusinessCapabilityAttribute::create([
                        'id' => (string) Str::uuid(),
                        'capability_id' => $capabilityModel->id,
                        'attribute_id' => $attributeModel->id,
                        'value' => $attribute['value'],
                    ]);
                }
            }
        }
    }
}
