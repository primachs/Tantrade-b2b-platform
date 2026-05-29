<?php

namespace Database\Seeders;

use App\AuthenticationContext\Auth\Infrastructure\Models\AuthUser;
use App\MarketGovernanceContext\Broker\Infrastructure\Models\BrokerRegistration;
use App\MarketGovernanceContext\Governance\Infrastructure\Models\MarketOffice;
use App\MarketGovernanceContext\Governance\Infrastructure\Models\OfficeTerm;
use App\MarketGovernanceContext\Market\Infrastructure\Models\Market;
use App\MarketGovernanceContext\Person\Infrastructure\Models\Person;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
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

        $personModels = [];
        foreach ($persons as $data) {
            $user = AuthUser::where('email', $data['email'])->first();
            if (! $user) {
                continue;
            }

            $coreUser = User::firstOrCreate(
                ['email' => $user->email],
                [
                    'name' => $user->name,
                    'password' => Hash::make('Password@2026!'),
                ]
            );

            $person = Person::firstOrCreate(
                ['user_id' => $coreUser->id],
                [
                    'id' => (string) Str::uuid(),
                    'nida_number' => $data['nida_number'],
                    'first_name' => $data['first_name'],
                    'middle_name' => $data['middle_name'],
                    'surname' => $data['surname'],
                    'gender' => $data['gender'],
                    'mobile' => $data['mobile'],
                    'email' => $user->email,
                    'address' => $data['address'],
                ]
            );

            $person->update([
                'nida_number' => $data['nida_number'],
                'first_name' => $data['first_name'],
                'middle_name' => $data['middle_name'],
                'surname' => $data['surname'],
                'gender' => $data['gender'],
                'mobile' => $data['mobile'],
                'email' => $user->email,
                'address' => $data['address'],
            ]);

            $personModels[$data['email']] = $person;
        }

        $officeAssignments = [
            [
                'market' => 'Kariakoo Market',
                'person_email' => 'governance@tantrade.go.tz',
            ],
            [
                'market' => 'Kilimanjaro Produce Hub',
                'person_email' => 'admin@tantrade.go.tz',
            ],
        ];

        foreach ($officeAssignments as $assignment) {
            $market = $marketModels[$assignment['market']] ?? null;
            $person = $personModels[$assignment['person_email']] ?? null;

            if (! $market || ! $person) {
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
                    'person_id' => $person->id,
                    'start_date' => Carbon::now()->subMonths(3)->toDateString(),
                    'end_date' => Carbon::now()->addMonths(9)->toDateString(),
                ]
            );

            $term->update([
                'person_id' => $person->id,
                'start_date' => Carbon::now()->subMonths(3)->toDateString(),
                'end_date' => Carbon::now()->addMonths(9)->toDateString(),
                'status' => 'ACTIVE',
            ]);

            BrokerRegistration::firstOrCreate(
                [
                    'person_id' => $person->id,
                    'market_id' => $market->id,
                    'broker_type' => 'COMMISSION_AGENT',
                ],
                [
                    'id' => (string) Str::uuid(),
                    'status' => 'ACTIVE',
                ]
            );
        }
    }
}
