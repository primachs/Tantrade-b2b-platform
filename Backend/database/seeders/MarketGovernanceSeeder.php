<?php

namespace Database\Seeders;

use App\AuthenticationContext\Auth\Infrastructure\Models\AuthUser;
use App\MarketGovernanceContext\Broker\Infrastructure\Models\BrokerRegistration;
use App\MarketGovernanceContext\Governance\Infrastructure\Models\MarketOffice;
use App\MarketGovernanceContext\Governance\Infrastructure\Models\OfficeTerm;
use App\MarketGovernanceContext\Market\Infrastructure\Models\Market;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

class MarketGovernanceSeeder extends Seeder
{
    public function run(): void
    {
        $markets = [
            [
                'market_name' => 'Kariakoo Market',
                'region' => 'Dar es Salaam',
                'district' => 'Ilala',
                'ward' => 'Kariakoo',
                'address' => 'Msimbazi Street, Dar es Salaam',
                'status' => 'ACTIVE',
            ],
            [
                'market_name' => 'Kilimanjaro Produce Hub',
                'region' => 'Arusha',
                'district' => 'Arumeru',
                'ward' => 'Njiro',
                'address' => 'Njiro Road, Arusha',
                'status' => 'ACTIVE',
            ],
        ];

        $marketModels = [];
        foreach ($markets as $data) {
            $market = Market::firstOrCreate(
                ['market_name' => $data['market_name']],
                [
                    'id' => (string) Str::uuid(),
                    'region' => $data['region'],
                    'district' => $data['district'],
                    'ward' => $data['ward'],
                    'address' => $data['address'],
                    'status' => $data['status'],
                ]
            );

            $market->update([
                'region' => $data['region'],
                'district' => $data['district'],
                'ward' => $data['ward'],
                'address' => $data['address'],
                'status' => $data['status'],
            ]);

            $marketModels[$data['market_name']] = $market;
        }

        // Seed profile details directly on the AuthUser records.
        $persons = [
            [
                'email' => 'governance@tantrade.go.tz',
                'nida_number' => 'NIDA-900001',
                'first_name' => 'Mariam',
                'middle_name' => null,
                'surname' => 'Mwinyi',
                'gender' => 'FEMALE',
                'mobile' => '+255718000445',
                'address' => 'Kijitonyama, Dar es Salaam',
            ],
            [
                'email' => 'admin@tantrade.go.tz',
                'nida_number' => 'NIDA-900002',
                'first_name' => 'TanTrade',
                'middle_name' => null,
                'surname' => 'Administrator',
                'gender' => 'OTHER',
                'mobile' => '+255719000556',
                'address' => 'Upanga, Dar es Salaam',
            ],
        ];

        $userModels = [];
        foreach ($persons as $data) {
            $user = AuthUser::where('email', $data['email'])->first();
            if (! $user) {
                continue;
            }

            // Update profile directly on the AuthUser record.
            $user->update([
                'nida_number' => $data['nida_number'],
                'first_name' => $data['first_name'],
                'middle_name' => $data['middle_name'],
                'surname' => $data['surname'],
                'gender' => $data['gender'],
                'mobile' => $data['mobile'],
                'address' => $data['address'],
            ]);

            $userModels[$data['email']] = $user;
        }

        $officeAssignments = [
            [
                'market' => 'Kariakoo Market',
                'user_email' => 'governance@tantrade.go.tz',
            ],
            [
                'market' => 'Kilimanjaro Produce Hub',
                'user_email' => 'admin@tantrade.go.tz',
            ],
        ];

        foreach ($officeAssignments as $assignment) {
            $market = $marketModels[$assignment['market']] ?? null;
            $user = $userModels[$assignment['user_email']] ?? null;

            if (! $market || ! $user) {
                continue;
            }

            $office = MarketOffice::firstOrCreate(
                ['market_id' => $market->id, 'office_type' => 'CHAIRPERSON'],
                ['id' => (string) Str::uuid()]
            );

            $term = OfficeTerm::firstOrCreate(
                ['office_id' => $office->id, 'status' => 'ACTIVE'],
                [
                    'id' => (string) Str::uuid(),
                    'user_id' => $user->id,
                    'start_date' => Carbon::now()->subMonths(3)->toDateString(),
                    'end_date' => Carbon::now()->addMonths(9)->toDateString(),
                ]
            );

            $term->update([
                'user_id' => $user->id,
                'start_date' => Carbon::now()->subMonths(3)->toDateString(),
                'end_date' => Carbon::now()->addMonths(9)->toDateString(),
                'status' => 'ACTIVE',
            ]);

            BrokerRegistration::firstOrCreate(
                [
                    'first_name' => $user->first_name ?? 'Test',
                    'surname' => $user->surname ?? 'Broker',
                    'market_id' => $market->id,
                    'broker_type' => 'COMMISSION_AGENT',
                ],
                [
                    'id' => (string) Str::uuid(),
                    'middle_name' => null,
                    'nida_number' => null,
                    'mobile' => $user->mobile ?? '+255000000000',
                    'address' => $user->address ?? 'Test Address',
                    'status' => 'ACTIVE',
                ]
            );
        }
    }
}
