<?php

namespace App\MatchingContext\Business\Tests\Unit;

use App\MatchingContext\Business\Domain\Factories\BusinessFactory;
use App\MatchingContext\SharedKernel\Domain\ValueObjects\Uuid;
use PHPUnit\Framework\TestCase;

class BusinessFactoryTest extends TestCase
{
    public function test_factory_from_state_and_payload(): void
    {
        $factory = new BusinessFactory;

        $payload = [
            'name' => 'Buyer Co',
            'contact_person' => 'Jane Doe',
            'phone' => '+255700000000',
            'email' => 'buyer.factory@example.com',
            'tin_number' => 'TIN-001',
            'brela_number' => 'BRELA-001',
            'business_size' => 'SMALL',
            'is_owner' => true,
            'owner_gender' => 'FEMALE',
            'employee_count' => 10,
            'revenue_range' => 'BELOW_50M',
            'region' => 'Dar',
            'district' => 'Ilala',
            'address' => 'Street 1',
            'verification_status' => 'UNVERIFIED',
        ];

        $business = $factory->create($payload);
        $state = $business->toArray();

        $state['verification']['id'] = Uuid::random()->value();
        $state['capabilities'] = [
            [
                'id' => Uuid::random()->value(),
                'business_id' => $state['id'],
                'service_type_id' => Uuid::random()->value(),
                'attributes' => [
                    [
                        'id' => Uuid::random()->value(),
                        'capability_id' => Uuid::random()->value(),
                        'attribute_id' => Uuid::random()->value(),
                        'value' => 'Trucks',
                    ],
                ],
            ],
        ];

        $state['trust_metrics'] = [
            'business_id' => $state['id'],
            'reliability_score' => 0.5,
            'success_rate' => 0.1,
            'response_rate' => 0.2,
            'dispute_rate' => 0.0,
            'avg_response_time' => null,
            'session_completion_rate' => null,
        ];

        $rehydrated = $factory->fromState($state);
        $this->assertSame($state['id'], $rehydrated->toArray()['id']);
    }
}
