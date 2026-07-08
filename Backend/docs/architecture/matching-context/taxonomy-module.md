# Taxonomy Module

The `Taxonomy` module provides the hierarchical categorization system used to classify businesses (Capabilities) and Requests (Service Types).

## Detailed Class Architecture

```plantuml
@startuml Taxonomy_Module_Class_Diagram
skinparam handwritten false
skinparam titleFontSize 18
title Taxonomy Module - Class Architecture

Package MatchingContext {
  Package TaxonomyModule {

    Package Presentation {
      Package Http {
        Class TaxonomyController {
          + storeCategory(Request): JsonResponse
          + storeServiceType(Request): JsonResponse
          + storeAttribute(Request): JsonResponse
          + storeAttributeValue(Request): JsonResponse
          + index(Request): JsonResponse
        }
      }
    }

    Package Application {
      Class TaxonomyService {
        - repository: TaxonomyRepository
        - factory: TaxonomyFactory
        + createCategory(array data): array
        + createServiceType(array data): array
        + createAttribute(array data): array
        + createAttributeValue(array data): array
        + list(): array
      }
    }

    Package Domain {
      Package Entities {
        Class ServiceCategory <<AggregateRoot>> {
          - id: Uuid
          - name: string
          - parentId: ?Uuid
          - level: int
          - isActive: bool
          + id(): Uuid
          + parentId(): ?Uuid
          + toArray(): array
        }
        
        Class ServiceType <<AggregateRoot>> {
          - id: Uuid
          - name: string
          - categoryId: Uuid
          - isActive: bool
          + id(): Uuid
          + categoryId(): Uuid
          + toArray(): array
        }

        Class ServiceAttribute {
          - id: Uuid
          - serviceTypeId: Uuid
          - name: string
          + toArray(): array
        }

        Class AttributeValue {
          - id: Uuid
          - attributeId: Uuid
          - value: string
          + toArray(): array
        }
      }
      
      Package Factories {
        Class TaxonomyFactory {
          + createCategory(array data): ServiceCategory
          + createServiceType(array data): ServiceType
          + createAttribute(array data): ServiceAttribute
          + createAttributeValue(array data): AttributeValue
          + categoryFromState(array state): ServiceCategory
          + serviceTypeFromState(array state): ServiceType
          + attributeFromState(array state): ServiceAttribute
          + attributeValueFromState(array state): AttributeValue
        }
      }

      Package Repositories {
        Interface TaxonomyRepository {
          + createCategory(ServiceCategory): ServiceCategory
          + createServiceType(ServiceType): ServiceType
          + createAttribute(ServiceAttribute): ServiceAttribute
          + createAttributeValue(AttributeValue): AttributeValue
          + listCategories(): array
          + listCategoriesByParent(Uuid): array
          + listServiceTypes(): array
          + listServiceTypesByCategoryIds(array): array
          + listAttributes(): array
          + findCategoryById(Uuid): ?ServiceCategory
          + findServiceTypeById(Uuid): ?ServiceType
        }
      }
    }

    Package Infrastructure {
      Package Models {
        Class EloquentServiceCategory <<Eloquent>> {
          + parent(): BelongsTo
          + children(): HasMany
          + serviceTypes(): HasMany
        }
        Class EloquentServiceType <<Eloquent>> {
          + category(): BelongsTo
          + attributes(): HasMany
        }
        Class EloquentServiceAttribute <<Eloquent>> {
          + serviceType(): BelongsTo
          + values(): HasMany
        }
        Class EloquentAttributeValue <<Eloquent>> {
          + attribute(): BelongsTo
        }
      }
      
      Package Repositories {
        Class EloquentTaxonomyRepository {
          + createCategory(ServiceCategory): ServiceCategory
          + createServiceType(ServiceType): ServiceType
          + createAttribute(ServiceAttribute): ServiceAttribute
          + createAttributeValue(AttributeValue): AttributeValue
          + listCategories(): array
          + listCategoriesByParent(Uuid): array
          + listServiceTypes(): array
          + listServiceTypesByCategoryIds(array): array
          + listAttributes(): array
          + findCategoryById(Uuid): ?ServiceCategory
          + findServiceTypeById(Uuid): ?ServiceType
        }
      }
    }
  }
}

' Relationships
TaxonomyController --> TaxonomyService : injects >
TaxonomyService --> TaxonomyRepository : uses >
TaxonomyService --> TaxonomyFactory : uses >

EloquentTaxonomyRepository ..|> TaxonomyRepository : implements
EloquentTaxonomyRepository --> EloquentServiceCategory : persists >
EloquentTaxonomyRepository --> EloquentServiceType : persists >
EloquentTaxonomyRepository --> EloquentServiceAttribute : persists >
EloquentTaxonomyRepository --> EloquentAttributeValue : persists >

@enduml
```

## Use Cases

```plantuml
@startuml Taxonomy_Module_Use_Cases
left to right direction
skinparam packageStyle rectangle

actor "Administrator" as Admin
actor "Guest / Application System" as System

rectangle "Taxonomy Module" {
  usecase "Create Service Category" as UC1
  usecase "Create Service Type" as UC2
  usecase "Define Required Attributes" as UC3
  usecase "Fetch Full Taxonomy Tree" as UC4
}

Admin --> UC1
Admin --> UC2
Admin --> UC3

System --> UC4
@enduml
```

## Layers Description

- **Domain Layer**: Manages `ServiceCategory` (with self-referential nested hierarchies), `ServiceType` (the concrete service being requested/offered), and specific `ServiceAttribute` properties.
- **Application Layer**: Provides methods to build the static taxonomy system and list it fully for frontend consumption.
- **Infrastructure Layer**: standard Eloquent implementation.
- **Presentation Layer**: Exposes endpoints for managing the categorization structure (Admin) and querying it (Users/App).
