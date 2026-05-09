<?php

namespace App\MatchingContext\Business\Tests\Unit;

use App\MatchingContext\Business\Domain\Entities\BusinessTrustMetrics;
use App\MatchingContext\Business\Domain\Factories\BusinessFactory;
use App\MatchingContext\Business\Infrastructure\Repositories\EloquentBusinessRepository;
use App\MatchingContext\SharedKernel\Domain\ValueObjects\Uuid;
use App\MatchingContext\Taxonomy\Infrastructure\Models\ServiceAttribute;
use App\MatchingContext\Taxonomy\Infrastructure\Models\ServiceCategory;
use App\MatchingContext\Taxonomy\Infrastructure\Models\ServiceType;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EloquentBusinessRepositoryTest extends TestCase
{
    use RefreshDatabase;

    public function test_business_repository_methods(): void
    {
        $serviceType = $this->seedTaxonomy();
        $attribute = ServiceAttribute::create([
            'service_type_id' => $serviceType->id,
            'name' => 'Vehicle Type',
        ]);

        $factory = new BusinessFactory();
        $repository = new EloquentBusinessRepository($factory);

        $business = $factory->create([
            'name' => 'Buyer Co',
            'contact_person' => 'Jane Doe',
            'phone' => '+255700000000',
            'email' => 'buyer.repo@example.com',
            'tin_number' => 'TIN-001',
            'brela_number' => 'BRELA-001',
            'business_size' => 'SMALL',
            'is_owner' => true,
            'owner_gender' => 'FEMALE',
            'employee_count' => 10,
            'revenue_range' => 'BELOW_50M',
            'region' => 'Dar',
            'district' => 'Ilala',
            'address' => 'Street 1',
            'verification_status' => 'UNVERIFIED',
            'capabilities' => [
                [
                    'service_type_id' => $serviceType->id,
                    'attributes' => [
                        [
                            'attribute_id' => $attribute->id,
                            'value' => 'Trucks',
                        ],
                    ],
                ],
            ],
        ]);

        $saved = $repository->create($business);
        $this->assertNotNull($repository->findById($saved->id()));

        $updated = $saved->withProfileUpdates(['name' => 'Buyer Co Updated']);
        $repository->update($updated);

        $verification = $factory->verificationFromPayload($saved->id(), [
            'tin_number' => 'TIN-002',
            'brela_number' => 'BRELA-002',
            'business_size' => 'MEDIUM',
            'is_owner' => true,
            'owner_gender' => 'FEMALE',
            'employee_count' => 12,
            'revenue_range' => 'BETWEEN_50M_500M',
            'region' => 'Dar',
            'district' => 'Ilala',
            'address' => 'Street 2',
            'verification_status' => 'PARTIALLY_VERIFIED',
        ]);
        $repository->upsertVerification($verification);

        $capabilities = $factory->capabilitiesFromPayload($saved->id(), [
            [
                'service_type_id' => $serviceType->id,
                'attributes' => [
                    [
                        'attribute_id' => $attribute->id,
                        'value' => 'Cars',
                    ],
                ],
            ],
        ]);
        $repository->syncCapabilities($saved->id(), $capabilities);

        $metrics = $repository->getTrustMetrics($saved->id());
        $this->assertNotNull($metrics);

        $newMetrics = new BusinessTrustMetrics(
            Uuid::fromString($saved->id()->value()),
            0.9,
            0.8,
            0.7,
            0.0,
            1.2,
            0.95
        );
        $repository->updateTrustMetrics($newMetrics);

        $repository->touchActivity($saved->id());
    }

    private function seedTaxonomy(): ServiceType
    {
        $category = ServiceCategory::create([
            'name' => 'Logistics',
            'parent_id' => null,
            'level' => 1,
            'is_active' => true,
        ]);

        return ServiceType::create([
            'name' => 'Vehicle Maintenance',
            'category_id' => $category->id,
            'is_active' => true,
        ]);
    }
}
