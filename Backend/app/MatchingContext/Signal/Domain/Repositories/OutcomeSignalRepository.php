<?php

namespace App\MatchingContext\Signal\Domain\Repositories;

use App\MatchingContext\Signal\Domain\Entities\OutcomeSignal;

interface OutcomeSignalRepository
{
    public function create(OutcomeSignal $signal): OutcomeSignal;
}
