# Market Module

The `Market` module manages the definition, categorization, and lifecycle of distinct markets within the platform. Markets serve as the foundational venues where brokers moderate and businesses engage.

## Detailed Class Architecture

```plantuml
@startuml Market_Module_Class_Diagram
skinparam handwritten false
skinparam titleFontSize 18
title Market Module - Class Architecture

Package MarketGovernanceContext {
  Package MarketModule {

    Package Presentation {
      Package Http {
        Class MarketController {
          - validateDistrictForRegion(string district, string region): void
          - marketRules(): array
          + index(Request): JsonResponse
          + store(Request): JsonResponse
          + show(Request, string id): JsonResponse
          + update(Request, string id): JsonResponse
        }
      }
    }

    Package Application {
      Class MarketService {
        - repository: MarketRepository
        - factory: MarketFactory
        + create(array data): array
        + update(string id, array data): array
        + show(string id): array
        + list(array filters): array
        - requireMarket(string id): Market
      }
    }

    Package Domain {
      Package Entities {
        Class Market <<AggregateRoot>> {
          - id: Uuid
          - userId: ?Uuid
          - marketName: string
          - region: string
          - district: string
          - ward: ?string
          - address: string
          - status: string
          - createdAt: ?DateTimeImmutable
          - updatedAt: ?DateTimeImmutable
          + id(): Uuid
          + withUpdates(array data): self
          + withStatus(string status): self
          + toArray(): array
        }
      }
      
      Package Factories {
        Class MarketFactory {
          + create(array data): Market
          + fromState(array state): Market
        }
      }

      Package Repositories {
        Interface MarketRepository {
          + create(Market): Market
          + update(Market): Market
          + findById(Uuid): ?Market
          + list(array filters): array
        }
      }
    }

    Package Infrastructure {
      Package Models {
        Class EloquentMarket <<Eloquent>>
      }
      
      Package Repositories {
        Class EloquentMarketRepository {
          + create(Market): Market
          + update(Market): Market
          + findById(Uuid): ?Market
          + list(array filters): array
        }
      }
    }
  }
}

' Relationships
MarketController --> MarketService : injects >
MarketService --> MarketRepository : uses >
MarketService --> MarketFactory : uses >

EloquentMarketRepository ..|> MarketRepository : implements
EloquentMarketRepository --> EloquentMarket : persists >

@enduml
```

## Use Cases

```plantuml
@startuml Market_Module_Use_Cases
left to right direction
skinparam packageStyle rectangle

actor "Administrator" as Admin
actor "Guest / Any User" as User

rectangle "Market Module" {
  usecase "Create Market" as UC1
  usecase "Update Market Details" as UC2
  usecase "View Specific Market" as UC3
  usecase "List all Markets" as UC4
}

Admin --> UC1
Admin --> UC2
Admin --> UC3
Admin --> UC4

User --> UC3
User --> UC4
@enduml
```

## Layers Description

- **Domain Layer**: The `Market` aggregate root represents physical or logical trading venues. It includes properties like region and district.
- **Application Layer**: `MarketService` coordinates market creation and modification logic.
- **Infrastructure Layer**: Stores market instances in the relational database via Eloquent.
- **Presentation Layer**: Exposes HTTP JSON endpoints for market discovery and administration.
