<?php

namespace App\MarketGovernanceContext\Person\Tests\Unit;

use App\MarketGovernanceContext\Person\Domain\Entities\Person;
use App\MarketGovernanceContext\SharedKernel\Domain\ValueObjects\EmailAddress;
use App\MarketGovernanceContext\SharedKernel\Domain\ValueObjects\Uuid;
use PHPUnit\Framework\TestCase;

class PersonEntityTest extends TestCase
{
    public function test_person_updates_and_serialization(): void
    {
        $id = Uuid::random();
        $person = new Person(
            $id,
            10,
            'NIDA-001',
            'Asha',
            null,
            'Kato',
            'FEMALE',
            '+255700000000',
            EmailAddress::fromString('asha@example.com'),
            'Street 1',
            null,
            null
        );

        $this->assertSame($id->value(), $person->id()->value());

        $updated = $person->withUpdates([
            'middle_name' => 'M',
            'email' => 'asha.updated@example.com',
            'address' => 'Street 2',
        ]);

        $data = $updated->toArray();
        $this->assertSame('M', $data['middle_name']);
        $this->assertSame('asha.updated@example.com', $data['email']);
        $this->assertSame('Street 2', $data['address']);
    }
}
