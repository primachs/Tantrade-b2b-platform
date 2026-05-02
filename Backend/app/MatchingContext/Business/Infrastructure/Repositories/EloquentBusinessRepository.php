<?php

namespace App\MatchingContext\Business\Infrastructure\Repositories;

use App\MatchingContext\Business\Domain\Entities\Business;
use App\MatchingContext\Business\Domain\Entities\BusinessCapability;
use App\MatchingContext\Business\Domain\Entities\BusinessTrustMetrics;
use App\MatchingContext\Business\Domain\Entities\BusinessVerification;
use App\MatchingContext\Business\Domain\Factories\BusinessFactory;
use App\MatchingContext\Business\Domain\Repositories\BusinessRepository;
use App\MatchingContext\Business\Infrastructure\Models\Business as BusinessModel;
use App\MatchingContext\Business\Infrastructure\Models\BusinessCapability as BusinessCapabilityModel;
use App\MatchingContext\Business\Infrastructure\Models\BusinessCapabilityAttribute as BusinessCapabilityAttributeModel;
use App\MatchingContext\Business\Infrastructure\Models\BusinessTrustMetrics as BusinessTrustMetricsModel;
use App\MatchingContext\Business\Infrastructure\Models\BusinessVerification as BusinessVerificationModel;
use App\MatchingContext\SharedKernel\Domain\ValueObjects\Uuid;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class EloquentBusinessRepository implements BusinessRepository
{
    public function __construct(private readonly BusinessFactory $factory)
    {
    }

    public function create(Business $business): Business
    {
        return DB::transaction(function () use ($business) {
            $data = $business->toArray();

            BusinessModel::create([
                'id' => $data['id'],
                'name' => $data['name'],
                'contact_person' => $data['contact_person'],
                'phone' => $data['phone'],
                'email' => $data['email'],
            ]);

            if ($data['verification']) {
                BusinessVerificationModel::create($data['verification']);
            }

            if ($data['trust_metrics']) {
                BusinessTrustMetricsModel::create($data['trust_metrics']);
            }

            if (!empty($data['capabilities'])) {
                $capabilities = array_map(function (array $capability) {
                    return $this->factory->capabilityFromState($capability);
                }, $data['capabilities']);
                $this->syncCapabilities(Uuid::fromString($data['id']), $capabilities);
            }

            return $this->findById(Uuid::fromString($data['id'])) ?? $business;
        });
    }

    public function update(Business $business): Business
    {
        $data = $business->toArray();

        BusinessModel::query()
            ->where('id', $data['id'])
            ->update([
                'name' => $data['name'],
                'contact_person' => $data['contact_person'],
                'phone' => $data['phone'],
                'email' => $data['email'],
                'updated_at' => Carbon::now(),
            ]);

        return $this->findById(Uuid::fromString($data['id'])) ?? $business;
    }

    public function findById(Uuid $businessId): ?Business
    {
        $model = BusinessModel::with(['verification', 'capabilities.capabilityAttributes', 'trustMetrics'])
            ->find($businessId->value());

        if (!$model) {
            return null;
        }

        return $this->factory->fromState($this->mapBusinessModel($model));
    }

    public function upsertVerification(BusinessVerification $verification): BusinessVerification
    {
        $data = $verification->toArray();

        // Prevent updating the primary key when calling updateOrCreate.
        // Some inputs include an `id` field which causes SQLite to attempt
        // to set the primary key to null on update, triggering a constraint
        // violation. Remove it from the payload before upserting.
        $upsertData = $data;
        unset($upsertData['id']);

        BusinessVerificationModel::updateOrCreate(
            ['business_id' => $data['business_id']],
            $upsertData
        );

        return $verification;
    }

    public function syncCapabilities(Uuid $businessId, array $capabilities): void
    {
        BusinessCapabilityModel::where('business_id', $businessId->value())->delete();

        foreach ($capabilities as $capability) {
            if (!$capability instanceof BusinessCapability) {
                continue;
            }

            $capabilityData = $capability->toArray();
            $capabilityModel = BusinessCapabilityModel::create([
                'id' => $capabilityData['id'],
                'business_id' => $capabilityData['business_id'],
                'service_type_id' => $capabilityData['service_type_id'],
            ]);

            foreach ($capabilityData['attributes'] as $attribute) {
                BusinessCapabilityAttributeModel::create([
                    'id' => $attribute['id'] ?? null,
                    'capability_id' => $capabilityModel->id,
                    'attribute_id' => $attribute['attribute_id'],
                    'value' => $attribute['value'],
                ]);
            }
        }
    }

    public function touchActivity(Uuid $businessId): void
    {
        BusinessModel::query()
            ->where('id', $businessId->value())
            ->update(['updated_at' => Carbon::now()]);
    }

    public function getTrustMetrics(Uuid $businessId): ?BusinessTrustMetrics
    {
        $metrics = BusinessTrustMetricsModel::where('business_id', $businessId->value())->first();
        if (!$metrics) {
            return null;
        }

        return $this->factory->trustMetricsFromState($metrics->toArray());
    }

    public function updateTrustMetrics(BusinessTrustMetrics $metrics): BusinessTrustMetrics
    {
        $data = $metrics->toArray();

        BusinessTrustMetricsModel::updateOrCreate(
            ['business_id' => $data['business_id']],
            $data
        );

        return $metrics;
    }

    private function mapBusinessModel(BusinessModel $model): array
    {
        return [
            'id' => $model->id,
            'name' => $model->name,
            'contact_person' => $model->contact_person,
            'phone' => $model->phone,
            'email' => $model->email,
            'verification' => $model->verification?->toArray(),
            'capabilities' => $model->capabilities->map(function ($capability) {
                return [
                    'id' => $capability->id,
                    'business_id' => $capability->business_id,
                    'service_type_id' => $capability->service_type_id,
                    'attributes' => $capability->capabilityAttributes->map(function ($attribute) {
                        return [
                            'id' => $attribute->id,
                            'capability_id' => $attribute->capability_id,
                            'attribute_id' => $attribute->attribute_id,
                            'value' => $attribute->value,
                        ];
                    })->all(),
                ];
            })->all(),
            'trust_metrics' => $model->trustMetrics?->toArray(),
            'created_at' => $model->created_at?->toAtomString(),
            'updated_at' => $model->updated_at?->toAtomString(),
        ];
    }
}
