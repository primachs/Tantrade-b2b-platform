<?php

namespace App\MatchingContext\Rfs\Tests\Unit;

use App\MatchingContext\Business\Infrastructure\Models\Business;
use App\MatchingContext\Rfs\Application\RfsService;
use App\MatchingContext\Taxonomy\Infrastructure\Models\ServiceAttribute;
use App\MatchingContext\Taxonomy\Infrastructure\Models\ServiceCategory;
use App\MatchingContext\Taxonomy\Infrastructure\Models\ServiceType;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RfsServiceCoverageTest extends TestCase
{
    use RefreshDatabase;

    public function test_rfs_service_flow(): void
    {
        $business = Business::create([
            'name' => 'Buyer',
            'contact_person' => 'Owner',
            'phone' => '+255700000000',
            'email' => 'buyer.service@example.com',
        ]);

        $category = ServiceCategory::create([
            'name' => 'Logistics',
            'parent_id' => null,
            'level' => 1,
            'is_active' => true,
        ]);

        $serviceType = ServiceType::create([
            'name' => 'Vehicle Maintenance',
            'category_id' => $category->id,
            'is_active' => true,
        ]);

        $attribute = ServiceAttribute::create([
            'service_type_id' => $serviceType->id,
            'name' => 'Vehicle Type',
        ]);

        $service = app(RfsService::class);

        $created = $service->create([
            'buyer_id' => $business->id,
            'title' => 'Need service',
            'description' => 'Looking for support',
            'service_type_id' => $serviceType->id,
            'project_size' => 'SMALL',
            'expertise_level' => 'BASIC',
            'constraints' => [
                'min_budget' => 1000,
                'region' => 'Dar',
            ],
        ]);

        $rfsId = $created['id'];
        $this->assertNotEmpty($service->show($rfsId));

        $service->update($rfsId, [
            'title' => 'Need service updated',
            'constraints' => [
                'min_budget' => 1000,
                'max_budget' => 2000,
                'district' => 'Ilala',
            ],
            'preferences' => [
                'cost_weight' => 0.4,
                'quality_weight' => 0.6,
            ],
            'attributes' => [
                [
                    'attribute_id' => $attribute->id,
                    'value' => 'Trucks',
                ],
            ],
        ]);

        $opened = $service->open($rfsId);
        $this->assertSame('OPEN', $opened['status']);
    }
}
