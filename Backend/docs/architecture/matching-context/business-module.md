# Business Module

The `Business` module within the Matching Context represents companies participating in the B2B platform. It handles the onboarding flow, verification data, business capabilities (what they sell), and their trust metrics.

## Detailed Class Architecture

```plantuml
@startuml Business_Module_Class_Diagram
skinparam handwritten false
skinparam titleFontSize 18
title Business Module - Class Architecture

Package MatchingContext {
  Package BusinessModule {

    Package Presentation {
      Package Http {
        Class BusinessController {
          - validateDistrictForRegion(string district, string region): void
          - verificationRules(): array
          + index(Request): JsonResponse
          + myBusiness(Request): JsonResponse
          + store(Request): JsonResponse
          + show(Request, string id): JsonResponse
          + update(Request, string id): JsonResponse
          + upsertVerification(Request, string id): JsonResponse
          + reviewVerification(Request, string id): JsonResponse
          + syncCapabilities(Request, string id): JsonResponse
          + trustMetrics(Request, string id): JsonResponse
        }
      }
    }

    Package Application {
      Class BusinessService {
        - repository: BusinessRepository
        - factory: BusinessFactory
        + create(array data): array
        + update(string id, array data): array
        + list(array filters): array
        + show(string id): array
        + findByUserId(string userId): ?array
        + upsertVerification(string id, array data): array
        + reviewVerification(string id, string status): array
        + syncCapabilities(string id, array capabilities): array
        + trustMetrics(string id): array
        + touchActivity(string id): void
        - requireBusiness(string id): Business
      }
    }

    Package Domain {
      Package Entities {
        Class Business <<AggregateRoot>> {
          - id: Uuid
          - name: string
          - contactPerson: string
          - phone: string
          - email: EmailAddress
          - verification: ?BusinessVerification
          - capabilities: array
          - trustMetrics: ?BusinessTrustMetrics
          - createdAt: ?DateTimeImmutable
          - updatedAt: ?DateTimeImmutable
          - userId: ?Uuid
          + id(): Uuid
          + userId(): ?Uuid
          + withProfileUpdates(array updates): self
          + withVerification(BusinessVerification): self
          + withCapabilities(array capabilities): self
          + withTrustMetrics(BusinessTrustMetrics): self
          + toArray(): array
        }
        
        Class BusinessVerification {
          - id: ?Uuid
          - businessId: Uuid
          - tinNumber: ?string
          - brelaNumber: ?string
          - businessSize: string
          - isOwner: bool
          - ownerGender: string
          - employeeCount: int
          - revenueRange: string
          - region: ?string
          - district: ?string
          - address: ?string
          - verificationStatus: string
          + toArray(): array
        }

        Class BusinessCapability {
          - id: ?Uuid
          - businessId: Uuid
          - serviceTypeId: Uuid
          - attributes: array
          + toArray(): array
        }

        Class BusinessTrustMetrics {
          - businessId: Uuid
          - reliabilityScore: float
          - successRate: float
          - responseRate: float
          - disputeRate: float
          - avgResponseTime: ?float
          - sessionCompletionRate: ?float
          + toArray(): array
        }
      }
      
      Package Factories {
        Class BusinessFactory {
          + create(array data): Business
          + fromState(array state): Business
          + verificationFromPayload(Uuid, array): BusinessVerification
          + verificationFromState(array): BusinessVerification
          + capabilitiesFromPayload(Uuid, array): array
          + capabilityFromState(array): BusinessCapability
          + trustMetricsFromState(array): BusinessTrustMetrics
          + defaultTrustMetrics(Uuid): BusinessTrustMetrics
        }
      }

      Package Repositories {
        Interface BusinessRepository {
          + create(Business): Business
          + update(Business): Business
          + findById(Uuid): ?Business
          + findByUserId(Uuid): ?Business
          + list(array filters): array
          + upsertVerification(BusinessVerification): BusinessVerification
          + syncCapabilities(Uuid, array capabilities): void
          + touchActivity(Uuid): void
          + getTrustMetrics(Uuid): ?BusinessTrustMetrics
          + updateTrustMetrics(BusinessTrustMetrics): BusinessTrustMetrics
        }
      }
    }

    Package Infrastructure {
      Package Models {
        Class EloquentBusiness <<Eloquent>>
        Class EloquentBusinessVerification <<Eloquent>>
        Class EloquentBusinessCapability <<Eloquent>>
        Class EloquentBusinessTrustMetrics <<Eloquent>>
      }
      
      Package Repositories {
        Class EloquentBusinessRepository {
          + create(Business): Business
          + update(Business): Business
          + findById(Uuid): ?Business
          + findByUserId(Uuid): ?Business
          + list(array filters): array
          + upsertVerification(BusinessVerification): BusinessVerification
          + syncCapabilities(Uuid, array capabilities): void
          + touchActivity(Uuid): void
          + getTrustMetrics(Uuid): ?BusinessTrustMetrics
          + updateTrustMetrics(BusinessTrustMetrics): BusinessTrustMetrics
        }
      }
    }
  }
}

' Relationships
BusinessController --> BusinessService : injects >
BusinessService --> BusinessRepository : uses >
BusinessService --> BusinessFactory : uses >

EloquentBusinessRepository ..|> BusinessRepository : implements
EloquentBusinessRepository --> EloquentBusiness : persists >

@enduml
```

## Use Cases

```plantuml
@startuml Business_Module_Use_Cases
left to right direction
skinparam packageStyle rectangle

actor "Verified Business (User)" as User
actor "Administrator / Broker" as Admin

rectangle "Business Module" {
  usecase "Onboard/Create Business Profile" as UC1
  usecase "Submit Verification Docs (BRELA/TIN)" as UC2
  usecase "Define Business Capabilities (Taxonomy)" as UC3
  
  usecase "Review Verification" as UC4
  usecase "List Businesses / Search Directory" as UC5
  usecase "View Trust Metrics" as UC6
}

User --> UC1
User --> UC2
User --> UC3

Admin --> UC4
Admin --> UC5

User --> UC6
Admin --> UC6
@enduml
```

## Layers Description

- **Domain Layer**: The `Business` aggregate root holds references to its `BusinessVerification`, `BusinessCapability` tags (linking to Taxonomy), and `BusinessTrustMetrics`.
- **Application Layer**: `BusinessService` provides methods to mutate profile state and capabilities, and handle verification review.
- **Infrastructure Layer**: Relational models map to standard MySQL tables.
- **Presentation Layer**: Exposes endpoints allowing businesses to self-manage and admins to review.
