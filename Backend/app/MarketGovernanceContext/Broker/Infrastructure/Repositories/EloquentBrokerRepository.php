<?php

namespace App\MarketGovernanceContext\Broker\Infrastructure\Repositories;

use App\MarketGovernanceContext\Broker\Domain\Entities\BrokerRegistration;
use App\MarketGovernanceContext\Broker\Domain\Factories\BrokerFactory;
use App\MarketGovernanceContext\Broker\Domain\Repositories\BrokerRepository;
use App\MarketGovernanceContext\Broker\Infrastructure\Models\BrokerRegistration as BrokerRegistrationModel;
use App\MarketGovernanceContext\SharedKernel\Domain\ValueObjects\Uuid;
use Illuminate\Support\Carbon;

class EloquentBrokerRepository implements BrokerRepository
{
    public function __construct(private readonly BrokerFactory $factory) {}

    public function create(BrokerRegistration $registration): BrokerRegistration
    {
        $data = $registration->toArray();

        BrokerRegistrationModel::create([
            'id'          => $data['id'],
            'market_id'   => $data['market_id'],
            'broker_type' => $data['broker_type'],
            'first_name'  => $data['first_name'],
            'middle_name' => $data['middle_name'],
            'surname'     => $data['surname'],
            'nida_number' => $data['nida_number'],
            'mobile'      => $data['mobile'],
            'address'     => $data['address'],
            'status'      => $data['status'],
        ]);

        return $this->findById(Uuid::fromString($data['id'])) ?? $registration;
    }

    public function update(BrokerRegistration $registration): BrokerRegistration
    {
        $data = $registration->toArray();

        BrokerRegistrationModel::query()
            ->where('id', $data['id'])
            ->update([
                'status'     => $data['status'],
                'updated_at' => Carbon::now(),
            ]);

        return $this->findById(Uuid::fromString($data['id'])) ?? $registration;
    }

    public function findById(Uuid $registrationId): ?BrokerRegistration
    {
        $model = BrokerRegistrationModel::query()->find($registrationId->value());
        if (! $model) {
            return null;
        }

        return $this->factory->fromState($model->toArray());
    }

    public function list(): array
    {
        $models = BrokerRegistrationModel::query()->orderByDesc('created_at')->get();

        return $models->map(function (BrokerRegistrationModel $model) {
            return $this->factory->fromState($model->toArray());
        })->all();
    }
}
