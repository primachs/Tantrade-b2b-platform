<?php

namespace Database\Seeders;

use App\MatchingContext\Taxonomy\Infrastructure\Models\AttributeValue;
use App\MatchingContext\Taxonomy\Infrastructure\Models\ServiceAttribute;
use App\MatchingContext\Taxonomy\Infrastructure\Models\ServiceCategory;
use App\MatchingContext\Taxonomy\Infrastructure\Models\ServiceType;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class TaxonomySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Agriculture & Agro-processing', 'parent' => null, 'level' => 0],
            ['name' => 'Logistics & Transport', 'parent' => null, 'level' => 0],
            ['name' => 'Quality & Compliance', 'parent' => null, 'level' => 0],
            ['name' => 'Products', 'parent' => null, 'level' => 0],
            ['name' => 'Technology & IT', 'parent' => null, 'level' => 0],
            ['name' => 'Horticulture', 'parent' => 'Agriculture & Agro-processing', 'level' => 1],
            ['name' => 'Food Processing', 'parent' => 'Agriculture & Agro-processing', 'level' => 1],
            ['name' => 'Farm Produce', 'parent' => 'Products', 'level' => 1],
            ['name' => 'Software Products', 'parent' => 'Products', 'level' => 1],
            ['name' => 'Software Development', 'parent' => 'Technology & IT', 'level' => 1],
        ];

        $categoryModels = [];
        foreach ($categories as $category) {
            $parentId = $category['parent'] ? ($categoryModels[$category['parent']]->id ?? null) : null;

            $model = ServiceCategory::firstOrCreate(
                ['name' => $category['name']],
                [
                    'id' => (string) Str::uuid(),
                    'parent_id' => $parentId,
                    'level' => $category['level'],
                    'is_active' => true,
                ]
            );

            if ($parentId && $model->parent_id !== $parentId) {
                $model->update([
                    'parent_id' => $parentId,
                    'level' => $category['level'],
                ]);
            }

            $categoryModels[$category['name']] = $model;
        }

        $serviceTypes = [
            ['name' => 'Cold Chain Logistics', 'category' => 'Logistics & Transport'],
            ['name' => 'Freight Forwarding', 'category' => 'Logistics & Transport'],
            ['name' => 'Crop Aggregation', 'category' => 'Horticulture'],
            ['name' => 'Packaging & Labeling', 'category' => 'Food Processing'],
            ['name' => 'Quality Assurance', 'category' => 'Quality & Compliance'],
            ['name' => 'Export Documentation', 'category' => 'Quality & Compliance'],
            ['name' => 'Fresh Fruits', 'category' => 'Farm Produce'],
            ['name' => 'Grains', 'category' => 'Farm Produce'],
            ['name' => 'SaaS', 'category' => 'Software Products'],
            ['name' => 'Web App Development', 'category' => 'Software Development'],
            ['name' => 'IT Consultation', 'category' => 'Technology & IT'],
            ['name' => 'Software Consultation', 'category' => 'Technology & IT'],
        ];

        $typeModels = [];
        foreach ($serviceTypes as $type) {
            $categoryId = $categoryModels[$type['category']]->id ?? null;
            if (! $categoryId) {
                continue;
            }

            $typeModels[$type['name']] = ServiceType::firstOrCreate(
                ['name' => $type['name'], 'category_id' => $categoryId],
                [
                    'id' => (string) Str::uuid(),
                    'is_active' => true,
                ]
            );
        }

        $attributes = [
            'Cold Chain Logistics' => ['Fleet Size', 'Temperature Range'],
            'Freight Forwarding' => ['Modes Supported', 'Customs Clearance'],
            'Crop Aggregation' => ['Storage Capacity', 'Regions Served'],
            'Packaging & Labeling' => ['Packaging Types', 'Daily Throughput'],
            'Quality Assurance' => ['Certifications', 'Inspection Turnaround'],
            'Export Documentation' => ['Supported Markets', 'Digital Filing'],
        ];

        $attributeModels = [];
        foreach ($attributes as $typeName => $attributeNames) {
            $typeModel = $typeModels[$typeName] ?? null;
            if (! $typeModel) {
                continue;
            }

            foreach ($attributeNames as $attributeName) {
                $key = $typeName . '::' . $attributeName;
                $attributeModels[$key] = ServiceAttribute::firstOrCreate(
                    ['name' => $attributeName, 'service_type_id' => $typeModel->id],
                    ['id' => (string) Str::uuid()]
                );
            }
        }

        $values = [
            'Cold Chain Logistics::Fleet Size' => ['5-10 Trucks', '10+ Trucks'],
            'Cold Chain Logistics::Temperature Range' => ['-18C to 5C', '2C to 12C'],
            'Freight Forwarding::Modes Supported' => ['Road and Sea', 'Road, Sea, Air'],
            'Freight Forwarding::Customs Clearance' => ['In-house Licensed', 'Partnered Agents'],
            'Crop Aggregation::Storage Capacity' => ['100-300 Tons', '300+ Tons'],
            'Crop Aggregation::Regions Served' => ['Northern Zone', 'Coastal Zone'],
            'Packaging & Labeling::Packaging Types' => ['Crates and Pallets', 'Vacuum and Pouches'],
            'Packaging & Labeling::Daily Throughput' => ['5,000 Units', '12,000 Units'],
            'Quality Assurance::Certifications' => ['ISO 22000', 'GLOBALG.A.P'],
            'Quality Assurance::Inspection Turnaround' => ['48 Hours', '72 Hours'],
            'Export Documentation::Supported Markets' => ['EAC, COMESA', 'EU, GCC'],
            'Export Documentation::Digital Filing' => ['ePhyto Ready', 'Single Window Ready'],
        ];

        foreach ($values as $key => $valueList) {
            $attribute = $attributeModels[$key] ?? null;
            if (! $attribute) {
                continue;
            }

            foreach ($valueList as $value) {
                AttributeValue::firstOrCreate(
                    ['attribute_id' => $attribute->id, 'value' => $value],
                    ['id' => (string) Str::uuid()]
                );
            }
        }
    }
}
