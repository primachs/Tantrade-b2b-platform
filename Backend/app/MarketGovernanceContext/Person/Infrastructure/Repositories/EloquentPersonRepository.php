<?php

namespace App\MarketGovernanceContext\Person\Infrastructure\Repositories;

use App\MarketGovernanceContext\Person\Domain\Entities\Person;
use App\MarketGovernanceContext\Person\Domain\Factories\PersonFactory;
use App\MarketGovernanceContext\Person\Domain\Repositories\PersonRepository;
use App\MarketGovernanceContext\Person\Infrastructure\Models\Person as PersonModel;
use App\MarketGovernanceContext\SharedKernel\Domain\ValueObjects\Uuid;
use Illuminate\Support\Carbon;

class EloquentPersonRepository implements PersonRepository
{
    public function __construct(private readonly PersonFactory $factory) {}

    public function create(Person $person): Person
    {
        $data = $person->toArray();

        PersonModel::create([
            'id' => $data['id'],
            'user_id' => $data['user_id'],
            'nida_number' => $data['nida_number'],
            'first_name' => $data['first_name'],
            'middle_name' => $data['middle_name'],
            'surname' => $data['surname'],
            'gender' => $data['gender'],
            'mobile' => $data['mobile'],
            'email' => $data['email'],
            'address' => $data['address'],
        ]);

        return $this->findById(Uuid::fromString($data['id'])) ?? $person;
    }

    public function update(Person $person): Person
    {
        $data = $person->toArray();

        PersonModel::query()
            ->where('id', $data['id'])
            ->update([
                'user_id' => $data['user_id'],
                'nida_number' => $data['nida_number'],
                'first_name' => $data['first_name'],
                'middle_name' => $data['middle_name'],
                'surname' => $data['surname'],
                'gender' => $data['gender'],
                'mobile' => $data['mobile'],
                'email' => $data['email'],
                'address' => $data['address'],
                'updated_at' => Carbon::now(),
            ]);

        return $this->findById(Uuid::fromString($data['id'])) ?? $person;
    }

    public function findById(Uuid $personId): ?Person
    {
        $model = PersonModel::query()->find($personId->value());
        if (! $model) {
            return null;
        }

        return $this->factory->fromState($model->toArray());
    }

    public function list(): array
    {
        $models = PersonModel::query()->orderByDesc('created_at')->get();

        return $models->map(function (PersonModel $model) {
            return $this->factory->fromState($model->toArray());
        })->all();
    }
}
