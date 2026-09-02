<?php

namespace App\MatchingContext\Rfs\Infrastructure\Repositories;

use App\MatchingContext\Rfs\Domain\Entities\Rfs;
use App\MatchingContext\Rfs\Domain\Entities\RfsConstraint;
use App\MatchingContext\Rfs\Domain\Entities\RfsPreference;
use App\MatchingContext\Rfs\Domain\Factories\RfsFactory;
use App\MatchingContext\Rfs\Domain\Repositories\RfsRepository;
use App\MatchingContext\Rfs\Infrastructure\Models\Rfs as RfsModel;
use App\MatchingContext\Rfs\Infrastructure\Models\RfsConstraint as RfsConstraintModel;
use App\MatchingContext\Rfs\Infrastructure\Models\RfsPreference as RfsPreferenceModel;
use App\MatchingContext\SharedKernel\Domain\ValueObjects\Uuid;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class EloquentRfsRepository implements RfsRepository
{
    public function __construct(private readonly RfsFactory $factory) {}

    public function create(Rfs $rfs): Rfs
    {
        return DB::transaction(function () use ($rfs) {
            $data = $rfs->toArray();

            RfsModel::create([
                'id' => $data['id'],
                'short_id' => $data['short_id'],
                'buyer_id' => $data['buyer_id'],
                'title' => $data['title'],
                'description' => $data['description'],
                'service_type_id' => $data['service_type_id'],
                'project_size' => $data['project_size'],
                'expertise_level' => $data['expertise_level'],
                'status' => $data['status'],
                'created_at' => Carbon::now(),
            ]);

            if ($data['constraint']) {
                $this->upsertConstraint($this->factory->constraintFromState($data['constraint']));
            }

            if ($data['preference']) {
                $this->upsertPreference($this->factory->preferenceFromState($data['preference']));
            }

            return $this->findById(Uuid::fromString($data['id'])) ?? $rfs;
        });
    }

    public function update(Rfs $rfs): Rfs
    {
        $data = $rfs->toArray();

        RfsModel::query()
            ->where('id', $data['id'])
            ->update([
                'title' => $data['title'],
                'description' => $data['description'],
                'project_size' => $data['project_size'],
                'expertise_level' => $data['expertise_level'],
            ]);

        return $this->findById(Uuid::fromString($data['id'])) ?? $rfs;
    }

    public function findById(Uuid $rfsId): ?Rfs
    {
        $model = RfsModel::with(['constraints', 'preferences', 'buyer'])->find($rfsId->value());
        if (! $model) {
            return null;
        }

        return $this->factory->fromState($this->mapRfsModel($model));
    }

    public function list(?string $buyerId = null): array
    {
        $query = RfsModel::with(['constraints', 'preferences', 'buyer'])
            ->orderByDesc('created_at');

        if ($buyerId) {
            // Show the caller's own RFS regardless of status (including their
            // private DRAFTs), plus every other business's RFS once it has
            // been published (OPEN or later) - buyers post requests that
            // sellers need to be able to discover and engage with.
            $query->where(function ($q) use ($buyerId) {
                $q->where('buyer_id', $buyerId)
                    ->orWhere('status', '!=', 'DRAFT');
            });
        }

        $models = $query->get();

        return $models->map(function (RfsModel $model) {
            return $this->factory->fromState($this->mapRfsModel($model));
        })->all();
    }

    public function updateStatus(Uuid $rfsId, string $status): void
    {
        RfsModel::query()->where('id', $rfsId->value())->update(['status' => $status]);
    }

    public function upsertConstraint(RfsConstraint $constraint): void
    {
        $data = $constraint->toArray();

        // Avoid attempting to update the primary key when upserting.
        $upsertData = $data;
        unset($upsertData['id']);

        RfsConstraintModel::updateOrCreate(
            ['rfs_id' => $data['rfs_id']],
            $upsertData
        );
    }

    public function upsertPreference(RfsPreference $preference): void
    {
        $data = $preference->toArray();

        $upsertData = $data;
        unset($upsertData['id']);

        RfsPreferenceModel::updateOrCreate(
            ['rfs_id' => $data['rfs_id']],
            $upsertData
        );
    }

    private function mapRfsModel(RfsModel $model): array
    {
        return [
            'id' => $model->id,
            'short_id' => $model->short_id,
            'buyer_id' => $model->buyer_id,
            'buyer_name' => $model->buyer?->name,
            'title' => $model->title,
            'description' => $model->description,
            'service_type_id' => $model->service_type_id,
            'project_size' => $model->project_size,
            'expertise_level' => $model->expertise_level,
            'status' => $model->status,
            'created_at' => $model->created_at?->toAtomString(),
            'constraint' => $model->constraints?->toArray(),
            'preference' => $model->preferences?->toArray(),
        ];
    }
}