<?php

namespace App\MatchingContext\Rfs\Tests\Unit;

use App\MatchingContext\Rfs\Domain\Factories\RfsFactory;
use App\MatchingContext\SharedKernel\Domain\ValueObjects\Uuid;
use PHPUnit\Framework\TestCase;

class RfsFactoryTest extends TestCase
{
    public function test_factory_from_state_and_payload(): void
    {
        $factory = new RfsFactory;
        $buyerId = Uuid::random()->value();
        $serviceTypeId = Uuid::random()->value();

        $payload = [
            'buyer_id' => $buyerId,
            'title' => 'Need service',
            'description' => 'Looking for support',
            'service_type_id' => $serviceTypeId,
            'project_size' => 'SMALL',
            'expertise_level' => 'BASIC',
            'constraints' => [
                'min_budget' => 1000,
                'max_budget' => 2000,
                'region' => 'Dar',
            ],
            'preferences' => [
                'cost_weight' => 0.4,
                'quality_weight' => 0.6,
            ],
            'attributes' => [
                [
                    'attribute_id' => Uuid::random()->value(),
                    'value' => 'Trucks',
                ],
            ],
        ];

        $rfs = $factory->create($payload);
        $state = $rfs->toArray();

        $state['id'] = Uuid::random()->value();
        $state['buyer_id'] = $buyerId;
        $state['service_type_id'] = $serviceTypeId;
        $state['constraint']['id'] = Uuid::random()->value();
        $state['constraint']['rfs_id'] = $state['id'];
        $state['preference']['rfs_id'] = $state['id'];
        $state['attributes'][0]['id'] = Uuid::random()->value();
        $state['attributes'][0]['rfs_id'] = $state['id'];

        $rehydrated = $factory->fromState($state);
        $this->assertSame($state['id'], $rehydrated->toArray()['id']);
    }
}
