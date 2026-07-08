# Matching Module

The `Matching` module contains the algorithmic core of the platform. It calculates fit scores between Requests for Services (RFS) and candidate businesses based on constraints, taxonomy attributes, trust metrics, and preferences, outputting a ranked Shortlist.

## Detailed Class Architecture

```plantuml
@startuml Matching_Module_Class_Diagram
skinparam handwritten false
skinparam titleFontSize 18
title Matching Module - Class Architecture

Package MatchingContext {
  Package MatchingModule {

    Package Presentation {
      Package Http {
        Class MatchingController {
          + match(Request, string rfsId): JsonResponse
          + shortlist(Request, string rfsId): JsonResponse
        }
      }
    }

    Package Application {
      Class MatchingService {
        - engine: MatchingEngine
        - factory: MatchingFactory
        - matchingRepository: MatchingRepository
        - rfsRepository: RfsRepository
        - taxonomyRepository: TaxonomyRepository
        - events: DomainEventRecorder
        + generateShortlist(string rfsId): array
        + latestShortlist(string rfsId): ?array
        - getRfs(string rfsId): Rfs
        - buildTaxonomyScoreMap(string serviceTypeId): array
        - attributeMatchRatio(array req, array prov): float
      }
    }

    Package Domain {
      Package Entities {
        Class MatchShortlist <<AggregateRoot>> {
          - id: Uuid
          - rfsId: Uuid
          - candidates: array
          - createdAt: DateTimeImmutable
          + id(): Uuid
          + candidates(): array
          + toArray(): array
        }
        
        Class MatchCandidate {
          - id: ?Uuid
          - sellerId: Uuid
          - sellerName: ?string
          - score: float
          - rank: int
          + toArray(): array
        }

        Class CandidateProfile {
          - sellerId: Uuid
          - serviceTypeId: Uuid
          - location: Location
          - trustMetrics: ?BusinessTrustMetrics
          - attributes: array
          + toArray(): array
        }
      }
      
      Package Factories {
        Class MatchingFactory {
          + createShortlist(Uuid rfsId, array candidates): MatchShortlist
        }
      }

      Package Services {
        Class MatchingEngine <<DomainService>> {
          + scoreCandidate(Rfs, CandidateProfile): array
          - calculateCapabilityScore(Rfs, CandidateProfile): float
          - calculateConstraintFit(RfsConstraint, CandidateProfile): array
          - calculatePreferenceScore(RfsPreference, CandidateProfile): float
          - clamp(float val, float min, float max): float
        }
      }

      Package Repositories {
        Interface MatchingRepository {
          + findCandidatesByServiceTypes(array typeIds): array
          + storeShortlist(MatchShortlist): MatchShortlist
          + findLatestShortlist(Uuid): ?MatchShortlist
        }
      }
    }

    Package Infrastructure {
      Package Models {
        Class EloquentMatchShortlist <<Eloquent>> {
          + rfs(): BelongsTo
          + candidates(): HasMany
        }
        Class EloquentMatchCandidate <<Eloquent>> {
          + shortlist(): BelongsTo
          + seller(): BelongsTo
        }
      }
      
      Package Repositories {
        Class EloquentMatchingRepository {
          + findCandidatesByServiceTypes(array typeIds): array
          + storeShortlist(MatchShortlist): MatchShortlist
          + findLatestShortlist(Uuid): ?MatchShortlist
        }
      }
    }
  }
}

' Relationships
MatchingController --> MatchingService : injects >
MatchingService --> MatchingEngine : uses >
MatchingService --> MatchingRepository : uses >
MatchingService --> MatchingFactory : uses >

EloquentMatchingRepository ..|> MatchingRepository : implements
EloquentMatchingRepository --> EloquentMatchShortlist : persists >
EloquentMatchingRepository --> EloquentMatchCandidate : persists >

@enduml
```

## Use Cases

```plantuml
@startuml Matching_Module_Use_Cases
left to right direction
skinparam packageStyle rectangle

actor "Buyer (RFS Owner)" as Buyer
actor "Matching Engine (System)" as System

rectangle "Matching Module" {
  usecase "Trigger Generation of Shortlist" as UC1
  usecase "View Generated Shortlist" as UC2
  usecase "Calculate Candidate Score" as UC3
  usecase "Rank Candidates" as UC4
}

Buyer --> UC1
Buyer --> UC2

System --> UC3
System --> UC4
@enduml
```

## Layers Description

- **Domain Layer**: Centralized around the `MatchShortlist` aggregate and the `MatchingEngine` domain service which isolates the complex scoring algorithms (Capability, Constraint Fit, Trust/Preferences).
- **Application Layer**: `MatchingService` bridges the `Rfs` module to get constraints, the `Taxonomy` module to get scoring weights, and delegates candidate retrieval to the `MatchingRepository`.
- **Infrastructure Layer**: Stores historical `shortlists` and associated `match_candidates` with their rank and scores.
- **Presentation Layer**: Exposes endpoints to trigger matching and fetch results.
