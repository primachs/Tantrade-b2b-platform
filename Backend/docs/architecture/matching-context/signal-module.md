# Signal Module

The `Signal` module is responsible for capturing raw outcomes (Signals) from user engagements and recalculating dynamic trust metrics for businesses.

## Detailed Class Architecture

```plantuml
@startuml Signal_Module_Class_Diagram
skinparam handwritten false
skinparam titleFontSize 18
title Signal Module - Class Architecture

Package MatchingContext {
  Package SignalModule {

    Package Application {
      Class SignalService {
        - signals: OutcomeSignalRepository
        - factory: SignalFactory
        - calculator: ReliabilityCalculator
        - businessRepository: BusinessRepository
        + recordSignal(array payload): array
      }
    }

    Package Domain {
      Package Entities {
        Class OutcomeSignal <<AggregateRoot>> {
          - id: Uuid
          - sessionId: Uuid
          - sellerId: Uuid
          - outcome: string
          - confidenceScore: float
          - createdAt: DateTimeImmutable
          + toArray(): array
        }
      }
      
      Package Factories {
        Class SignalFactory {
          + create(array data): OutcomeSignal
        }
      }

      Package Services {
        Class OutcomeResolver <<DomainService>> {
          + resolve(array reports): array
        }
        
        Class ReliabilityCalculator <<DomainService>> {
          - engagementRepository: EngagementRepository
          + recalculateForSeller(Uuid sellerId): BusinessTrustMetrics
          - calculateAverageResponseTime(array sessions): ?float
          - clamp(float val, float min, float max): float
        }
      }

      Package Repositories {
        Interface OutcomeSignalRepository {
          + create(OutcomeSignal): OutcomeSignal
        }
      }
    }

    Package Infrastructure {
      Package Models {
        Class EloquentOutcomeSignal <<Eloquent>> {
          + session(): BelongsTo
          + seller(): BelongsTo
        }
      }
      
      Package Repositories {
        Class EloquentOutcomeSignalRepository {
          + create(OutcomeSignal): OutcomeSignal
        }
      }
    }
  }
}

' Relationships
SignalService --> OutcomeSignalRepository : uses >
SignalService --> SignalFactory : uses >
SignalService --> ReliabilityCalculator : uses >

ReliabilityCalculator --> EngagementRepository : external >

EloquentOutcomeSignalRepository ..|> OutcomeSignalRepository : implements
EloquentOutcomeSignalRepository --> EloquentOutcomeSignal : persists >

@enduml
```

## Use Cases

```plantuml
@startuml Signal_Module_Use_Cases
left to right direction
skinparam packageStyle rectangle

actor "Engagement Module (Event System)" as Event
actor "System (Background Task)" as System

rectangle "Signal Module" {
  usecase "Record Outcome Signal" as UC1
  usecase "Resolve Conflicting Reports" as UC2
  usecase "Recalculate Seller Reliability Score" as UC3
}

Event --> UC1

System --> UC2
System --> UC3
@enduml
```

## Layers Description

- **Domain Layer**: Introduces `OutcomeSignal` as an event stream record. Contains heavy logic in `OutcomeResolver` (to deduce actual deal states from conflicting user reports) and `ReliabilityCalculator` (math logic for trust scores).
- **Application Layer**: `SignalService` acts as an event subscriber/listener, taking completed engagement reports and turning them into Signals and recalculating trust metrics.
- **Infrastructure Layer**: Basic storage of the signals for historical and audit purposes.
- **Presentation Layer**: Does not exist for this module natively. Signals are recorded via internal Domain Events emitted by the `Engagement` module.
