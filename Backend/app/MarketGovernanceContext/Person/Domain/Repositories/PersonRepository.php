<?php

namespace App\MarketGovernanceContext\Person\Domain\Repositories;

use App\MarketGovernanceContext\Person\Domain\Entities\Person;
use App\MarketGovernanceContext\SharedKernel\Domain\ValueObjects\Uuid;

interface PersonRepository
{
    public function create(Person $person): Person;

    public function update(Person $person): Person;

    public function findById(Uuid $personId): ?Person;
}
