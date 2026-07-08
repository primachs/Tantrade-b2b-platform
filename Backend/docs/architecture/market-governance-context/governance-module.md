# Governance Module

The `Governance` module handles the rules, moderation policies, and market administration (e.g., assigning chairpersons to offices).

## Detailed Class Architecture

```plantuml
@startuml Governance_Module_Class_Diagram
skinparam handwritten false
skinparam titleFontSize 18
title Governance Module - Class Architecture

Package MarketGovernanceContext {
  Package GovernanceModule {

    Package Presentation {
      Package Http {
        Class GovernanceController {
          + createOffice(Request): JsonResponse
          + assignChairperson(Request, string officeId): JsonResponse
          + endTerm(Request, string termId): JsonResponse
        }
      }
    }

    Package Application {
      Class GovernanceService {
        - repository: GovernanceRepository
        - factory: GovernanceFactory
        + createOffice(array data): array
        + assignChairperson(string officeId, string userId, ?string startDate, ?string endDate): array
        + endTerm(string termId, ?string endDate): array
        - requireOfficeTerm(string termId): OfficeTerm
      }
    }

    Package Domain {
      Package Entities {
        Class MarketOffice <<AggregateRoot>> {
          - id: Uuid
          - marketId: Uuid
          - officeType: string
          - createdAt: ?DateTimeImmutable
          - updatedAt: ?DateTimeImmutable
          + id(): Uuid
          + toArray(): array
        }
        
        Class OfficeTerm {
          - id: Uuid
          - officeId: Uuid
          - userId: Uuid
          - startDate: DateTimeImmutable
          - endDate: DateTimeImmutable
          - status: string
          - createdAt: ?DateTimeImmutable
          - updatedAt: ?DateTimeImmutable
          + id(): Uuid
          + withStatus(string status): self
          + withEndDate(DateTimeImmutable endDate): self
          + toArray(): array
        }
      }
      
      Package Factories {
        Class GovernanceFactory {
          + createOffice(array data): MarketOffice
          + createOfficeTerm(array data): OfficeTerm
          + officeFromState(array state): MarketOffice
          + termFromState(array state): OfficeTerm
        }
      }

      Package Repositories {
        Interface GovernanceRepository {
          + createOffice(MarketOffice): MarketOffice
          + findOfficeById(Uuid): ?MarketOffice
          + findOfficeByMarketAndType(Uuid, string): ?MarketOffice
          + createOfficeTerm(OfficeTerm): OfficeTerm
          + updateOfficeTerm(OfficeTerm): OfficeTerm
          + findOfficeTermById(Uuid): ?OfficeTerm
          + hasActiveOfficeTermForUser(Uuid): bool
          + hasActiveOfficeTermForOffice(Uuid): bool
          + findActiveOfficeTermForOffice(Uuid): ?OfficeTerm
        }
      }
    }

    Package Infrastructure {
      Package Models {
        Class EloquentMarketOffice <<Eloquent>> {
          + terms(): HasMany
        }
        Class EloquentOfficeTerm <<Eloquent>> {
          + office(): BelongsTo
        }
      }
      
      Package Repositories {
        Class EloquentGovernanceRepository {
          + createOffice(MarketOffice): MarketOffice
          + findOfficeById(Uuid): ?MarketOffice
          + findOfficeByMarketAndType(Uuid, string): ?MarketOffice
          + createOfficeTerm(OfficeTerm): OfficeTerm
          + updateOfficeTerm(OfficeTerm): OfficeTerm
          + findOfficeTermById(Uuid): ?OfficeTerm
          + hasActiveOfficeTermForUser(Uuid): bool
          + hasActiveOfficeTermForOffice(Uuid): bool
          + findActiveOfficeTermForOffice(Uuid): ?OfficeTerm
        }
      }
    }
  }
}

' Relationships
GovernanceController --> GovernanceService : injects >
GovernanceService --> GovernanceRepository : uses >
GovernanceService --> GovernanceFactory : uses >

EloquentGovernanceRepository ..|> GovernanceRepository : implements
EloquentGovernanceRepository --> EloquentMarketOffice : persists >
EloquentGovernanceRepository --> EloquentOfficeTerm : persists >

@enduml
```

## Use Cases

```plantuml
@startuml Governance_Module_Use_Cases
left to right direction
skinparam packageStyle rectangle

actor "Platform Administrator" as Admin

rectangle "Governance Module" {
  usecase "Create Market Office" as UC1
  usecase "Assign Chairperson to Office" as UC2
  usecase "End Term Early" as UC3
}

Admin --> UC1
Admin --> UC2
Admin --> UC3
@enduml
```

## Layers Description

- **Domain Layer**: Contains the `MarketOffice` and `OfficeTerm` aggregates which define administrative positions for a given market.
- **Application Layer**: `GovernanceService` enforces rules like ensuring a user isn't assigned to multiple active terms or that terms don't exceed time limits.
- **Infrastructure Layer**: Implements standard Eloquent repositories and migrations.
- **Presentation Layer**: Exposes API endpoints for administrators to manage governance structures.
