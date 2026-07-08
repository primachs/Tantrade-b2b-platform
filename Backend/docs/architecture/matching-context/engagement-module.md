# Engagement Module

The `Engagement` module tracks interactions between businesses, tracing the lifecycle from initial expression of interest on an RFS, through active engagement, to a finalized outcome (e.g. Deal Confirmed, Rejected).

## Detailed Class Architecture

```plantuml
@startuml Engagement_Module_Class_Diagram
skinparam handwritten false
skinparam titleFontSize 18
title Engagement Module - Class Architecture

Package MatchingContext {
  Package EngagementModule {

    Package Presentation {
      Package Http {
        Class EngagementController {
          + index(Request): JsonResponse
          + store(Request): JsonResponse
          + show(Request, string id): JsonResponse
          + accept(Request, string id): JsonResponse
          + reject(Request, string id): JsonResponse
          + activate(Request, string id): JsonResponse
          + stall(Request, string id): JsonResponse
          + reportOutcome(Request, string id): JsonResponse
          + close(Request, string id): JsonResponse
        }
      }
    }

    Package Application {
      Class EngagementService {
        - repository: EngagementRepository
        - factory: EngagementFactory
        - resolver: OutcomeResolver
        - signals: SignalService
        - events: DomainEventRecorder
        + createSession(array data): array
        + listBySeller(string sellerId, array filters): array
        + listByBuyer(string buyerId, array filters): array
        + show(string sessionId): array
        + accept(string sessionId): array
        + reject(string sessionId): array
        + activate(string sessionId): array
        + stall(string sessionId): array
        + reportOutcome(string sessionId, string reporter, string outcome): array
        + close(string sessionId): array
        - requireSession(string id): EngagementSession
      }
    }

    Package Domain {
      Package Entities {
        Class EngagementSession <<AggregateRoot>> {
          - id: Uuid
          - rfsId: Uuid
          - buyerId: Uuid
          - sellerId: Uuid
          - status: string
          - outcome: ?string
          - confidenceScore: ?float
          - reports: array
          - createdAt: ?DateTimeImmutable
          - closedAt: ?DateTimeImmutable
          + id(): Uuid
          + status(): string
          + withStatus(string status): self
          + close(): self
          + toArray(): array
        }
        
        Class SessionReport {
          - id: ?Uuid
          - sessionId: Uuid
          - reportedBy: string
          - outcome: string
          - reason: ?string
          - notes: ?string
          - createdAt: DateTimeImmutable
          + toArray(): array
        }
      }
      
      Package Factories {
        Class EngagementFactory {
          + createSession(array data): EngagementSession
          + fromState(array state): EngagementSession
          + reportFromPayload(array data): SessionReport
          + reportFromState(array state): SessionReport
        }
      }

      Package Repositories {
        Interface EngagementRepository {
          + create(EngagementSession): EngagementSession
          + update(EngagementSession): EngagementSession
          + findById(Uuid): ?EngagementSession
          + upsertReport(SessionReport): SessionReport
          + listReports(Uuid): array
          + countSessionsBySeller(Uuid): int
          + listSessionsBySeller(Uuid): array
          + listSessionsByBuyer(Uuid): array
        }
      }
    }

    Package Infrastructure {
      Package Models {
        Class EloquentEngagementSession <<Eloquent>> {
          + rfs(): BelongsTo
          + buyer(): BelongsTo
          + seller(): BelongsTo
          + reports(): HasMany
        }
        Class EloquentSessionReport <<Eloquent>> {
          + session(): BelongsTo
        }
      }
      
      Package Repositories {
        Class EloquentEngagementRepository {
          + create(EngagementSession): EngagementSession
          + update(EngagementSession): EngagementSession
          + findById(Uuid): ?EngagementSession
          + upsertReport(SessionReport): SessionReport
          + listReports(Uuid): array
          + listSessionsBySeller(Uuid): array
          + listSessionsByBuyer(Uuid): array
        }
      }
    }
  }
}

' Relationships
EngagementController --> EngagementService : injects >
EngagementService --> EngagementRepository : uses >
EngagementService --> EngagementFactory : uses >

EloquentEngagementRepository ..|> EngagementRepository : implements
EloquentEngagementRepository --> EloquentEngagementSession : persists >
EloquentEngagementRepository --> EloquentSessionReport : persists >

@enduml
```

## Use Cases

```plantuml
@startuml Engagement_Module_Use_Cases
left to right direction
skinparam packageStyle rectangle

actor "Seller (Responding Business)" as Seller
actor "Buyer (RFS Creator)" as Buyer
actor "Matching Engine (System)" as System

rectangle "Engagement Module" {
  usecase "Express Interest in RFS" as UC1
  usecase "Accept / Reject Expression of Interest" as UC2
  usecase "Activate Engagement (Start Dialogue)" as UC3
  usecase "Report Outcome (Deal / No Deal)" as UC4
  usecase "Calculate Final Session Outcome" as UC5
}

Seller --> UC1

Buyer --> UC2
Buyer --> UC3

Buyer --> UC4
Seller --> UC4

System --> UC5
@enduml
```

## Layers Description

- **Domain Layer**: The `EngagementSession` aggregate maps to the negotiation state between a Buyer and Seller. Individual `SessionReport` records log their respective final outcomes.
- **Application Layer**: `EngagementService` coordinates the state machine (Pending -> Accepted -> Active -> Closed) and delegates to the `OutcomeResolver` if parties report conflicting outcomes.
- **Infrastructure Layer**: Stores engagements, associating them directly with the `users`, `businesses`, and `rfs_requests` tables via Eloquent relationships.
- **Presentation Layer**: Exposes endpoints for managing B2B engagement negotiations.
