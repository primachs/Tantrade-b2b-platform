<?php

namespace App\MatchingContext\Taxonomy\Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TaxonomyApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_taxonomy_endpoints(): void
    {
        $category = $this->postJson('/api/taxonomy/categories', [
            'name' => 'Logistics',
            'level' => 1,
            'is_active' => true,
        ])->assertStatus(201)->json();

        $subcategory = $this->postJson('/api/taxonomy/categories', [
            'name' => 'Fleet Services',
            'parent_id' => $category['id'],
            'level' => 2,
            'is_active' => true,
        ])->assertStatus(201)->json();

        $serviceType = $this->postJson('/api/taxonomy/service-types', [
            'name' => 'Vehicle Maintenance',
            'category_id' => $subcategory['id'],
            'is_active' => true,
        ])->assertStatus(201)->json();

        $attribute = $this->postJson('/api/taxonomy/attributes', [
            'service_type_id' => $serviceType['id'],
            'name' => 'Vehicle Type',
        ])->assertStatus(201)->json();

        $this->postJson('/api/taxonomy/attribute-values', [
            'attribute_id' => $attribute['id'],
            'value' => 'Trucks',
        ])->assertStatus(201);

        $response = $this->getJson('/api/taxonomy')->assertStatus(200);
        $response->assertJsonStructure(['categories', 'service_types', 'attributes']);
    }
}
