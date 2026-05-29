<?php

namespace App\MarketGovernanceContext\Market\Infrastructure\Repositories;

use App\MarketGovernanceContext\Market\Domain\Entities\Market;
use App\MarketGovernanceContext\Market\Domain\Factories\MarketFactory;
use App\MarketGovernanceContext\Market\Domain\Repositories\MarketRepository;
use App\MarketGovernanceContext\Market\Infrastructure\Models\Market as MarketModel;
use App\MarketGovernanceContext\SharedKernel\Domain\ValueObjects\Uuid;
use Illuminate\Support\Carbon;

class EloquentMarketRepository implements MarketRepository
{
    public function __construct(private readonly MarketFactory $factory) {}

    public function create(Market $market): Market
    {
        $data = $market->toArray();

        MarketModel::create([
            'id' => $data['id'],
            'market_name' => $data['market_name'],
            'region' => $data['region'],
            'district' => $data['district'],
            'ward' => $data['ward'],
            'address' => $data['address'],
            'status' => $data['status'],
        ]);

        return $this->findById(Uuid::fromString($data['id'])) ?? $market;
    }

    public function update(Market $market): Market
    {
        $data = $market->toArray();

        MarketModel::query()
            ->where('id', $data['id'])
            ->update([
                'market_name' => $data['market_name'],
                'region' => $data['region'],
                'district' => $data['district'],
                'ward' => $data['ward'],
                'address' => $data['address'],
                'status' => $data['status'],
                'updated_at' => Carbon::now(),
            ]);

        return $this->findById(Uuid::fromString($data['id'])) ?? $market;
    }

    public function findById(Uuid $marketId): ?Market
    {
        $model = MarketModel::query()->find($marketId->value());
        if (! $model) {
            return null;
        }

        return $this->factory->fromState($model->toArray());
    }

    public function list(): array
    {
        $models = MarketModel::query()->orderByDesc('created_at')->get();

        return $models->map(function (MarketModel $model) {
            return $this->factory->fromState($model->toArray());
        })->all();
    }
}
