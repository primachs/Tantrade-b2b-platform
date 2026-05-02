<?php

namespace App\MatchingContext\Rfs\Domain\Repositories;

use App\MatchingContext\Rfs\Domain\Entities\Rfs;
use App\MatchingContext\Rfs\Domain\Entities\RfsAttribute;
use App\MatchingContext\Rfs\Domain\Entities\RfsConstraint;
use App\MatchingContext\Rfs\Domain\Entities\RfsPreference;
use App\MatchingContext\SharedKernel\Domain\ValueObjects\Uuid;

interface RfsRepository
{
    public function create(Rfs $rfs): Rfs;

    public function update(Rfs $rfs): Rfs;

    public function findById(Uuid $rfsId): ?Rfs;

    public function updateStatus(Uuid $rfsId, string $status): void;

    public function upsertConstraint(RfsConstraint $constraint): void;

    public function upsertPreference(RfsPreference $preference): void;

    /** @param RfsAttribute[] $attributes */
    public function replaceAttributes(Uuid $rfsId, array $attributes): void;
}
