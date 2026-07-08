<?php

namespace App\MatchingContext\Signal\Infrastructure\Repositories;

use App\MatchingContext\Signal\Domain\Entities\OutcomeSignal;
use App\MatchingContext\Signal\Domain\Repositories\OutcomeSignalRepository;
use App\MatchingContext\Signal\Infrastructure\Models\OutcomeSignal as OutcomeSignalModel;

class EloquentOutcomeSignalRepository implements OutcomeSignalRepository
{
    public function create(OutcomeSignal $signal): OutcomeSignal
    {
        OutcomeSignalModel::create($signal->toArray());

        return $signal;
    }
}
