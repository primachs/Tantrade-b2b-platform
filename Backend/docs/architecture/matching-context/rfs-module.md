# RFS (Request for Services) Module

The `Rfs` module manages buyer-created requests. It collects exactly what a buyer needs (service type), their constraints (budget, timeline, location), and their preferences (how they weight different matching factors).

## Detailed Class Architecture

```plantuml
@startuml Rfs_Module_Class_Diagram
skinparam handwritten false
skinparam titleFontSize 18
title Rfs Module - Class Architecture

Package MatchingContext {
  Package RfsModule {

    Package Presentation {
      Package Http {
        Class RfsController {
          + index(Request): JsonResponse
          + store(Request): JsonResponse
          + show(Request, string id): JsonResponse
          + update(Request, string id): JsonResponse
          + open(Request, string id): JsonResponse
        }
      }
    }

    Package Application {
      Class RfsService {
        - repository: RfsRepository
        - factory: RfsFactory
        - events: DomainEventRecorder
        + create(array data): array
        + update(string id, array data): array
        + list(array filters): array
        + show(string id): array
        + open(string id): array
        - requireRfs(string id): Rfs
      }
    }

    Package Domain {
      Package Entities {
        Class Rfs <<AggregateRoot>> {
          - id: Uuid
          - buyerId: Uuid
          - title: string
          - description: string
          - serviceTypeId: Uuid
          - projectSize: string
          - expertiseLevel: string
          - status: string
          - createdAt: ?DateTimeImmutable
          - constraint: ?RfsConstraint
          - preference: ?RfsPreference
          - shortId: ?string
          - buyerName: ?string
          + withStatus(string status): self
          + withUpdates(array data): self
          + withConstraint(RfsConstraint): self
          + withPreference(RfsPreference): self
          + toArray(): array
        }
        
        Class RfsConstraint {
          - id: ?Uuid
          - rfsId: Uuid
          - budget: MoneyRange
          - timeline: DateRange
          - location: Location
          + budget(): MoneyRange
          + timeline(): DateRange
          + location(): Location
          + toArray(): array
        }

        Class RfsPreference {
          - rfsId: Uuid
          - weights: PreferenceWeights
          + weights(): PreferenceWeights
          + toArray(): array
        }
      }
      
      Package Factories {
        Class RfsFactory {
          + create(array data): Rfs
          + fromState(array state): Rfs
          + constraintFromPayload(array data): ?RfsConstraint
          + constraintFromState(array state): RfsConstraint
          + preferenceFromPayload(array data): ?RfsPreference
          + preferenceFromState(array state): RfsPreference
        }
      }

      Package Repositories {
        Interface RfsRepository {
          + create(Rfs): Rfs
          + update(Rfs): Rfs
          + findById(Uuid): ?Rfs
          + list(array filters): array
          + updateStatus(Rfs): void
          + upsertConstraint(RfsConstraint): void
          + upsertPreference(RfsPreference): void
        }
      }
    }

    Package Infrastructure {
      Package Models {
        Class EloquentRfs <<Eloquent>> {
          + constraints(): HasOne
          + preferences(): HasOne
          + shortlists(): HasMany
          + engagementSessions(): HasMany
        }
        Class EloquentRfsConstraint <<Eloquent>>
        Class EloquentRfsPreference <<Eloquent>>
      }
      
      Package Repositories {
        Class EloquentRfsRepository {
          + create(Rfs): Rfs
          + update(Rfs): Rfs
          + findById(Uuid): ?Rfs
          + list(array filters): array
          + updateStatus(Rfs): void
          + upsertConstraint(RfsConstraint): void
          + upsertPreference(RfsPreference): void
        }
      }
    }
  }
}

' Relationships
RfsController --> RfsService : injects >
RfsService --> RfsRepository : uses >
RfsService --> RfsFactory : uses >

EloquentRfsRepository ..|> RfsRepository : implements
EloquentRfsRepository --> EloquentRfs : persists >

@enduml
```

## Use Cases

```plantuml
@startuml Rfs_Module_Use_Cases
left to right direction
skinparam packageStyle rectangle

actor "Buyer (Registered User)" as Buyer

rectangle "RFS Module" {
  usecase "Draft RFS" as UC1
  usecase "Update RFS Content & Constraints" as UC2
  usecase "Publish (Open) RFS" as UC3
  usecase "View RFS" as UC4
  usecase "List own RFSs" as UC5
}

Buyer --> UC1
Buyer --> UC2
Buyer --> UC3
Buyer --> UC4
Buyer --> UC5
@enduml
```

## Layers Description

- **Domain Layer**: The `Rfs` aggregate root ensures validity before transitioning states (e.g. `DRAFT` -> `OPEN`). It embeds `RfsConstraint` (Value Objects like MoneyRange, DateRange, Location) and `RfsPreference`.
- **Application Layer**: `RfsService` manages the orchestration. Upon publishing (`open()`), it may emit domain events caught by the `Matching` module.
- **Infrastructure Layer**: Maps constraints and preferences to side tables (`rfs_constraints`, `rfs_preferences`) connected via Eloquent relations to the main `rfs_requests` table.
- **Presentation Layer**: Exposes standard endpoints for buyers to manage their sourcing needs.
