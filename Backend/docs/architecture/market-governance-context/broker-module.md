# Broker Module

The `Broker` module within the Market Governance Context is responsible for managing administrative brokers. Brokers serve as moderators or facilitators within specific markets.

## Detailed Class Architecture

```plantuml
@startuml Broker_Module_Class_Diagram
skinparam handwritten false
skinparam titleFontSize 18
title Broker Module - Class Architecture

Package MarketGovernanceContext {
  Package BrokerModule {

    Package Presentation {
      Package Http {
        Class BrokerController {
          + index(Request): JsonResponse
          + store(Request): JsonResponse
          + show(Request, string id): JsonResponse
          + deactivate(Request, string id): JsonResponse
        }
      }
    }

    Package Application {
      Class BrokerService {
        - repository: BrokerRepository
        - factory: BrokerFactory
        + register(array data): array
        + deactivate(string id): array
        + show(string id): array
        + list(array filters): array
        - requireRegistration(string id): BrokerRegistration
      }
    }

    Package Domain {
      Package Entities {
        Class BrokerRegistration <<AggregateRoot>> {
          - id: Uuid
          - userId: ?Uuid
          - marketId: Uuid
          - brokerType: string
          - firstName: string
          - middleName: ?string
          - surname: string
          - nidaNumber: ?string
          - mobile: ?string
          - address: ?string
          - status: string
          - createdAt: ?DateTimeImmutable
          - updatedAt: ?DateTimeImmutable
          + id(): Uuid
          + withStatus(string status): self
          + toArray(): array
        }
      }
      
      Package Factories {
        Class BrokerFactory {
          + create(array data): BrokerRegistration
          + fromState(array state): BrokerRegistration
        }
      }

      Package Repositories {
        Interface BrokerRepository {
          + create(BrokerRegistration): BrokerRegistration
          + update(BrokerRegistration): BrokerRegistration
          + findById(Uuid): ?BrokerRegistration
          + list(array): array
        }
      }
    }

    Package Infrastructure {
      Package Models {
        Class EloquentBrokerRegistration <<Eloquent>>
      }
      
      Package Repositories {
        Class EloquentBrokerRepository {
          + create(BrokerRegistration): BrokerRegistration
          + update(BrokerRegistration): BrokerRegistration
          + findById(Uuid): ?BrokerRegistration
          + list(array): array
        }
      }
    }
  }
}

' Relationships
BrokerController --> BrokerService : injects >
BrokerService --> BrokerRepository : uses >
BrokerService --> BrokerFactory : uses >

EloquentBrokerRepository ..|> BrokerRepository : implements
EloquentBrokerRepository --> EloquentBrokerRegistration : persists >

@enduml
```

## Use Cases

```plantuml
@startuml Broker_Module_Use_Cases
left to right direction
skinparam packageStyle rectangle

actor "Administrator" as Admin
actor "Registered Broker" as Broker

rectangle "Broker Module" {
  usecase "Register new Broker" as UC1
  usecase "Deactivate Broker" as UC2
  usecase "View Broker Profile" as UC3
  usecase "List all Brokers" as UC4
}

Admin --> UC1
Admin --> UC2
Admin --> UC4
Admin --> UC3

Broker --> UC3
@enduml
```

## Layers Description

- **Domain Layer**: Contains the `BrokerRegistration` aggregate root managing the broker's identity, linked to a specific `MarketId` and `UserId`.
- **Application Layer**: `BrokerService` manages the lifecycle of a broker (e.g., onboarding, deactivation).
- **Infrastructure Layer**: `EloquentBrokerRepository` implements storage operations using the `market_governance_broker_registrations` table.
- **Presentation Layer**: Exposes the CRUD endpoints through `BrokerController`.
