# B2B Service Matching Platform

## System Design & Domain-Driven Architecture Document

**Last Updated:** May 2, 2026

---

# 1. SYSTEM OVERVIEW

## 1.1 Purpose

This system is a B2B service discovery and matchmaking platform that enables businesses to find, evaluate, and engage with other businesses that best meet their service needs.

Unlike transactional marketplaces, this platform focuses on:

* Structured demand definition (RFS)
* Intelligent matchmaking
* Engagement tracking and lifecycle management
* Outcome signal capture and trust scoring

The system does not execute transactions or enforce contracts. Instead, it acts as a **deal origination and intelligence layer**.

---

## 1.2 Core Value Proposition

The platform continuously learns:

> Which business pairings are most likely to result in successful outcomes

This is achieved through:
- Structured data collection
- Outcome-based feedback loops
- Trust score evolution
- Intelligent ranking

---

# 2. ARCHITECTURE OVERVIEW

## 2.1 Bounded Context: MatchingContext

Single bounded context containing all domain logic organized into **six independent modules** plus a **SharedKernel**.

### Module Organization

| Module | Purpose |
|--------|---------|
| **Business** | Business profiles, verification, capabilities, trust metrics |
| **Taxonomy** | Service classification hierarchy and attributes |
| **RFS** | Request for Service (demand) definition and management |
| **Matching** | Intelligent candidate scoring and ranking engine |
| **Engagement** | Session lifecycle and outcome reporting |
| **Signal** | Outcome signal processing and trust calculation |
| **SharedKernel** | Common value objects, enums, and exceptions |

---

## 2.2 Layered Architecture

Each module implements a clean layered architecture:

```
Domain Layer (Entities, Value Objects, Repositories, Domain Services)
    ↓
Application Layer (Application Services, Orchestration)
    ↓
Infrastructure Layer (ORM Models, Repositories Impl., Migrations, Service Provider)
    ↓
Presentation Layer (HTTP Controllers, Routes, DTOs)
```

---

## 2.3 Directory Structure

```plaintext
app/MatchingContext/
├── SharedKernel/
│   └── Domain/
│       ├── Enums/                    # Shared enums
│       ├── Exceptions/               # DomainException
│       └── ValueObjects/             # Uuid, EmailAddress, Location, etc.
│
├── Business/
│   ├── Domain/
│   │   ├── Entities/                 # Business, BusinessCapability, etc.
│   │   ├── Factories/                # BusinessFactory
│   │   └── Repositories/             # BusinessRepository (interface)
│   ├── Application/
│   │   └── BusinessService.php
│   ├── Infrastructure/
│   │   ├── Models/                   # Eloquent models
│   │   ├── Repositories/             # EloquentBusinessRepository
│   │   ├── Persistence/
│   │   │   └── Migrations/
│   │   └── BusinessServiceProvider.php
│   ├── Presentation/
│   │   ├── Http/
│   │   │   └── BusinessController.php
│   │   └── api.php
│   └── Tests/
│       ├── Feature/
│       └── Unit/
│
├── Taxonomy/
│   ├── Domain/
│   │   ├── Entities/                 # ServiceCategory, ServiceType, ServiceAttribute
│   │   ├── Factories/
│   │   └── Repositories/             # TaxonomyRepository (interface)
│   ├── Application/
│   │   └── TaxonomyService.php
│   ├── Infrastructure/
│   │   ├── Models/
│   │   ├── Repositories/
│   │   ├── Persistence/Migrations/
│   │   └── TaxonomyServiceProvider.php
│   ├── Presentation/
│   │   └── api.php
│   └── Tests/
│
├── RFS/
│   ├── Domain/
│   │   ├── Entities/                 # Rfs, RfsConstraint, RfsPreference, RfsAttribute
│   │   ├── Factories/
│   │   └── Repositories/             # RfsRepository (interface)
│   ├── Application/
│   │   └── RfsService.php
│   ├── Infrastructure/
│   │   ├── Models/
│   │   ├── Repositories/
│   │   ├── Persistence/Migrations/
│   │   └── RfsServiceProvider.php
│   ├── Presentation/
│   │   └── api.php
│   └── Tests/
│
├── Matching/
│   ├── Domain/
│   │   ├── Entities/                 # MatchCandidate, MatchShortlist, CandidateProfile, CandidateAttribute
│   │   ├── Factories/
│   │   └── Repositories/             # MatchingRepository (interface)
│   ├── Application/
│   │   └── MatchingService.php
│   ├── Infrastructure/
│   │   ├── Models/
│   │   ├── Repositories/
│   │   ├── Persistence/Migrations/
│   │   └── MatchingServiceProvider.php
│   ├── Presentation/
│   │   └── api.php
│   └── Tests/
│
├── Engagement/
│   ├── Domain/
│   │   ├── Entities/                 # EngagementSession, SessionReport
│   │   ├── Factories/
│   │   └── Repositories/             # EngagementRepository (interface)
│   ├── Application/
│   │   └── EngagementService.php
│   ├── Infrastructure/
│   │   ├── Models/
│   │   ├── Repositories/
│   │   ├── Persistence/Migrations/
│   │   └── EngagementServiceProvider.php
│   ├── Presentation/
│   │   ├── Http/
│   │   │   └── EngagementController.php
│   │   └── api.php
│   └── Tests/
│
└── Signal/
    ├── Domain/
    │   ├── Entities/                 # OutcomeSignal
    │   ├── Factories/
    │   └── Repositories/             # OutcomeSignalRepository (interface)
    ├── Application/
    │   └── SignalService.php
    ├── Infrastructure/
    │   ├── Models/
    │   ├── Repositories/
    │   ├── Persistence/Migrations/
    │   └── SignalServiceProvider.php
    ├── Presentation/
    │   └── api.php
    └── Tests/
```

---

# 3. CORE DOMAIN CONCEPTS

## 3.1 Business

### Aggregate Root: Business
A business can operate as both **Buyer** and **Seller**.

### Entities & Value Objects:
* **Business** (Aggregate Root)
  - Immutable: id (Uuid), name, contactPerson, phone, email (EmailAddress)
  - Composed of: verification, capabilities[], trustMetrics
  - Methods: `withProfileUpdates()`, `withVerification()`, `withCapabilities()`, `withTrustMetrics()`

* **BusinessVerification** (Entity)
  - Captures regulatory/business data
  - Fields: tin_number, brela_number, business_size, employee_count, revenue_range, region, district, address, verification_status
  - Status: UNVERIFIED, PARTIALLY_VERIFIED, VERIFIED

* **BusinessCapability** (Entity)
  - Represents what a business can deliver
  - Links to ServiceType and owns attributes

* **BusinessCapabilityAttribute** (Value Object)
  - Specific capability details (e.g., "Vehicle Type: Trucks")

* **BusinessTrustMetrics** (Entity)
  - Aggregates reliability signals
  - Fields: reliability_score, success_rate, response_rate, dispute_rate, avg_response_time, session_completion_rate

### Repository:
* `BusinessRepository` (Domain Interface)
  - Methods: `create()`, `update()`, `findById()`, `upsertVerification()`, `syncCapabilities()`, `getTrustMetrics()`, `updateTrustMetrics()`, `touchActivity()`

---

## 3.2 Taxonomy

### Entities:
* **ServiceCategory** (Aggregate Root)
  - Hierarchical structure (parent_id, level)
  - Example: "Logistics"

* **ServiceCategory** (Child)
  - Example: "Fleet Services" (under Logistics)

* **ServiceType** (Aggregate Root)
  - Leaf node in taxonomy
  - Owned by ServiceCategory
  - Example: "Vehicle Maintenance"

* **ServiceAttribute** (Entity)
  - Metadata for a ServiceType
  - Example: "Vehicle Type" (with possible values: Trucks, Cars, etc.)

* **AttributeValue** (Value Object)
  - Specific value for an attribute

### Repository:
* `TaxonomyRepository` (Domain Interface)
  - Methods for querying and managing taxonomy

---

## 3.3 RFS (Request for Service)

### Aggregate Root: Rfs
A buyer's structured demand for services.

### Entities:
* **Rfs** (Aggregate Root)
  - Fields: id, buyerId, title, description, serviceTypeId, projectSize, expertiseLevel, status
  - Status: DRAFT, OPEN, MATCHED, CLOSED
  - Composed of: constraint, preference, attributes[]
  - Methods: `withStatus()`, `withUpdates()`, `withConstraint()`, `withPreference()`, `withAttributes()`

* **RfsConstraint** (Entity)
  - Operational boundaries
  - Fields: min_budget, max_budget, start_date, deadline, region, district

* **RfsPreference** (Entity)
  - Selection weights
  - Fields: cost_weight, quality_weight, speed_weight, experience_weight, location_weight

* **RfsAttribute** (Entity)
  - Specific demand detail
  - Links to ServiceAttribute with a value

### Value Objects:
* `MoneyRange` - Budget constraints (min, max)
* `DateRange` - Timeline (start_date, deadline)
* `PreferenceWeights` - Normalized weights
* `ProjectSize` - Enum: SMALL, MEDIUM, LARGE
* `ExpertiseLevel` - Enum: BASIC, INTERMEDIATE, ADVANCED

### Repository:
* `RfsRepository` (Domain Interface)
  - Methods: `create()`, `update()`, `findById()`, `updateStatus()`, `upsertConstraint()`, `upsertPreference()`, `replaceAttributes()`

---

## 3.4 Matching

### Entities:
* **MatchCandidate** (Entity)
  - Candidate seller for an RFS
  - Fields: seller_id, match_score, strengths, profile_summary
  - Owns CandidateProfile and CandidateAttributes

* **CandidateProfile** (Entity)
  - Snapshot of seller's capabilities and trust
  - Fields: capability_summary, reliability_score, responsiveness

* **CandidateAttribute** (Entity)
  - Matched attribute between RFS demand and seller capability

* **MatchShortlist** (Entity)
  - Collection of ranked candidates
  - Fields: rfs_id, candidates[], created_at

### Value Objects:
* Scoring components (capability score, constraint fit score, etc.)

### Repository:
* `MatchingRepository` (Domain Interface)
  - Methods: `createShortlist()`, `findShortlistByRfs()`, `recordMatch()`

---

## 3.5 Engagement

### Aggregate Root: EngagementSession
Lifecycle of interaction between buyer and seller.

### Entities:
* **EngagementSession** (Aggregate Root)
  - Fields: id, rfs_id, buyer_id, seller_id, status, outcome, confidence_score
  - Status: INITIATED, ACCEPTED, ACTIVE, STALLED, CLOSED
  - Outcome: DEAL_CONFIRMED, NO_AGREEMENT, DISPUTED
  - Methods: `withStatus()`, `close(outcome, confidence, closedAt)`

* **SessionReport** (Entity)
  - Outcome reported by a party
  - Fields: session_id, reported_by (BUYER/SELLER), outcome, reported_at

### Value Objects:
* `EngagementStatus` - Enum: INITIATED, ACCEPTED, ACTIVE, STALLED, CLOSED
* `EngagementOutcome` - Enum: DEAL_CONFIRMED, NO_AGREEMENT, DISPUTED
* `ReportedBy` - Enum: BUYER, SELLER

### Repository:
* `EngagementRepository` (Domain Interface)
  - Methods: `create()`, `update()`, `findById()`, `updateStatus()`, `addReport()`, `findByRfs()`

---

## 3.6 Signal

### Entities:
* **OutcomeSignal** (Aggregate Root)
  - Processed outcome from engagement
  - Fields: id, session_id, buyer_id, seller_id, outcome, confidence_score, created_at

### Repository:
* `OutcomeSignalRepository` (Domain Interface)
  - Methods: `create()`, `findBySession()`, `recordSignal()`

---

## 3.7 SharedKernel Value Objects

### Core Value Objects:
* **Uuid** - UUID v4 identifier
  - Validation via regex
  - Methods: `fromString()`, `random()`, `value()`, `__toString()`

* **EmailAddress** - Valid email
  - Validation via filter_var
  - Methods: `fromString()`, `value()`

* **Location** - Geographic area
  - Fields: region, district

* **MoneyRange** - Budget constraint
  - Fields: min, max (nullable)

* **DateRange** - Time period
  - Fields: start_date, end_date

* **PreferenceWeights** - Selection weights
  - Fields: cost_weight, quality_weight, speed_weight, experience_weight, location_weight

### Core Enums:
* `BusinessSize` - SMALL, MEDIUM, LARGE
* `VerificationStatus` - UNVERIFIED, PARTIALLY_VERIFIED, VERIFIED
* `ProjectSize` - SMALL, MEDIUM, LARGE
* `ExpertiseLevel` - BASIC, INTERMEDIATE, ADVANCED
* `RfsStatus` - DRAFT, OPEN, MATCHED, CLOSED
* `EngagementStatus` - INITIATED, ACCEPTED, ACTIVE, STALLED, CLOSED
* `EngagementOutcome` - DEAL_CONFIRMED, NO_AGREEMENT, DISPUTED
* `ReportedBy` - BUYER, SELLER
* `RevenueRange` - BELOW_50M, BETWEEN_50M_500M, BETWEEN_500M_5B, ABOVE_5B
* `OwnerGender` - MALE, FEMALE, OTHER, PREFER_NOT_TO_SAY

### Exceptions:
* `DomainException` - Base domain exception

---

# 4. SYSTEM WORKFLOW

## 4.1 End-to-End Flow

1. **Business Registration**
   - Create business profile with identity and contact info
   - Business receives Uuid identifier

2. **Business Verification**
   - Capture regulatory data (TIN, BRELA, revenue, etc.)
   - Update BusinessVerification entity
   - Set verification_status

3. **Capability Declaration**
   - Link business to ServiceTypes
   - Add specific attributes per capability
   - Example: "Can provide vehicle maintenance for Trucks"

4. **RFS Creation**
   - Buyer creates structured demand (RFS)
   - Define constraints (budget, timeline, location)
   - Define preferences (weights for cost/quality/speed/etc.)
   - Add specific attributes needed
   - Status: DRAFT

5. **RFS Publication**
   - Buyer transitions RFS to OPEN
   - System triggers matching engine

6. **Matching Execution**
   - Engine retrieves candidates with matching service types
   - Filters by constraint fit (budget, location, timeline)
   - Scores candidates using weighted model
   - Produces ranked shortlist

7. **Engagement Initiation**
   - Buyer selects sellers from shortlist
   - System creates EngagementSession for each
   - Status: INITIATED

8. **Seller Acceptance**
   - Seller accepts (status: ACCEPTED) or rejects
   - Accepted sessions transition to ACTIVE

9. **Engagement Activity**
   - Sessions may stall (inactivity) and re-activate
   - Parties interact (inside or outside platform)

10. **Outcome Reporting**
    - Buyer and/or Seller report outcomes
    - Outcomes stored as SessionReport entities
    - Tracked for conflict detection

11. **Session Closure**
    - Both parties report DEAL_CONFIRMED → outcome is DEAL_CONFIRMED
    - Only one party confirms → outcome is DISPUTED
    - Either party reports NO_AGREEMENT → outcome is NO_AGREEMENT

12. **Signal Processing**
    - OutcomeSignal created from confirmed outcomes
    - Trust metrics updated for both buyer and seller
    - Matching weights refined for future rounds

---

## 4.2 Matching Flow

```
Candidate Retrieval
  ↓
  Fetch all sellers with matching ServiceType
  ↓
Filtering
  ↓
  Apply hard constraints:
  - Budget range
  - Location (region/district)
  - Timeline (start_date/deadline)
  ↓
Scoring
  ↓
  Calculate MatchScore:
    - Capability match (service type, attributes)
    - Constraint fit
    - Preference alignment
    - Reliability score (from BusinessTrustMetrics)
    - Engagement history
  ↓
Ranking
  ↓
  Sort candidates by score (descending)
  ↓
Shortlisting
  ↓
  Return top 3-7 candidates with details
```

---

## 4.3 Engagement Lifecycle

```
INITIATED (Session created)
  ↓
  [Seller Accepts or Rejects]
  ↓
ACCEPTED → ACTIVE (Engagement begins)
  ↓
  [Optional: Stall/Re-activate if inactive]
  ↓
[Outcome Reported]
  ↓
[Both parties report]
  ↓
CLOSED (Final status)

Outcome Determination Logic:
- Both report DEAL_CONFIRMED → DEAL_CONFIRMED
- One reports DEAL_CONFIRMED, other NO_AGREEMENT → DISPUTED
- One reports, other silent → remains open until timeout
- Both report NO_AGREEMENT → NO_AGREEMENT
```

---

# 5. APPLICATION SERVICES (Orchestration)

Each module has a single Application Service responsible for orchestrating domain logic and infrastructure:

### BusinessService
```
+ create(payload): array
+ update(businessId, payload): array
+ show(businessId): array
+ upsertVerification(businessId, payload): array
+ syncCapabilities(businessId, payload): array
+ trustMetrics(businessId): array
+ touchActivity(businessId): void
```

### TaxonomyService
```
+ createCategory(payload): array
+ createServiceType(payload): array
+ listCategories(): array[]
+ listServiceTypes(categoryId): array[]
```

### RfsService
```
+ create(payload): array
+ update(rfsId, payload): array
+ show(rfsId): array
+ open(rfsId): array
+ findByBuyer(buyerId): array[]
```

### MatchingService
```
+ generateShortlist(rfsId): MatchShortlist
+ scoreCandidate(candidate, rfs): float
+ findMatches(rfsId): MatchCandidate[]
```

### EngagementService
```
+ create(sessionData): EngagementSession
+ accept(sessionId): EngagementSession
+ activate(sessionId): EngagementSession
+ stall(sessionId): EngagementSession
+ reportOutcome(sessionId, reportedBy, outcome): SessionReport
+ close(sessionId): EngagementSession
+ findByRfs(rfsId): EngagementSession[]
```

### SignalService
```
+ processOutcome(session, outcome): OutcomeSignal
+ recordSignal(signal): void
+ updateTrustMetrics(signal): void
```

---

# 6. INFRASTRUCTURE LAYER

## 6.1 Eloquent Models (Persistence)

Each domain entity has a corresponding Eloquent model for database interaction:

| Domain Entity | Eloquent Model | Table |
|---------------|---|---|
| Business | `Business` | `businesses` |
| BusinessVerification | `BusinessVerification` | `business_verification` |
| BusinessCapability | `BusinessCapability` | `business_capabilities` |
| ServiceCategory | `ServiceCategory` | `service_categories` |
| ServiceType | `ServiceType` | `service_types` |
| ServiceAttribute | `ServiceAttribute` | `service_attributes` |
| Rfs | `Rfs` | `rfs` |
| RfsConstraint | `RfsConstraint` | `rfs_constraints` |
| RfsPreference | `RfsPreference` | `rfs_preferences` |
| EngagementSession | `EngagementSession` | `engagement_sessions` |
| SessionReport | `SessionReport` | `session_reports` |
| OutcomeSignal | `OutcomeSignal` | `outcome_signals` |

## 6.2 Repository Implementations

Each module provides repository implementations (Eloquent-based):

* `EloquentBusinessRepository`
* `EloquentTaxonomyRepository`
* `EloquentRfsRepository`
* `EloquentMatchingRepository`
* `EloquentEngagementRepository`
* `EloquentOutcomeSignalRepository`

Repositories handle:
- Hydrating domain entities from database records
- Persisting domain entities back to database
- Query logic isolated from application layer

## 6.3 Service Providers

Each module registers its dependencies via a Service Provider:

```php
// Example: BusinessServiceProvider
$this->app->bind(BusinessRepository::class, EloquentBusinessRepository::class);
$this->app->singleton(BusinessFactory::class);
$this->app->singleton(BusinessService::class);
Route::group(['prefix' => 'api'], fn() => require __DIR__.'/../Presentation/api.php');
```

---

# 7. PRESENTATION LAYER

## 7.1 HTTP Controllers

Each module provides one or more controllers:

* `BusinessController` - Business profile operations
* `RfsController` - RFS creation and management
* `EngagementController` - Session operations
* (Other controllers for Taxonomy, Matching, etc.)

## 7.2 API Routes

Routes are defined per-module and auto-loaded:

```php
// Business/Presentation/api.php
Route::prefix('businesses')->group(function () {
    Route::post('/', [BusinessController::class, 'store']);
    Route::get('/{businessId}', [BusinessController::class, 'show']);
    Route::put('/{businessId}/verification', [BusinessController::class, 'upsertVerification']);
    // ...
});
```

All module routes are loaded in `config/app.php` via service providers.

---

# 8. INTER-MODULE COMMUNICATION

## 8.1 Principles

* **No Direct Cross-Module Mutation**: Modules do not call each other's repository methods directly
* **Application Service Orchestration**: Use application services as facades for orchestration
* **Value Object Sharing**: SharedKernel value objects (Uuid, Location, etc.) are safe to share
* **Immutable Data Transfer**: Domain entities converted to arrays for inter-service communication

## 8.2 Example: RFS → Matching → Engagement Flow

1. **RfsService.open(rfsId)** 
   - Loads RFS domain entity
   - Transitions to OPEN status
   - Returns array representation

2. **External caller** (HTTP request or background job)
   - Calls `MatchingService.generateShortlist(rfsId)`
   - Loads RFS data via RfsRepository
   - Loads candidate sellers via BusinessRepository
   - Computes scores
   - Creates MatchShortlist
   - Stores via MatchingRepository

3. **Engagement Creation**
   - Buyer calls `EngagementService.create(rfsId, sellerId)`
   - EngagementService creates EngagementSession domain entity
   - Persists via EngagementRepository
   - Returns session array

## 8.3 Testing Strategy

* **Unit Tests**: Test domain entities and domain services in isolation
* **Feature Tests**: Test full workflows through controllers (HTTP layer)
  - Example: POST /api/businesses → BusinessService → EloquentBusinessRepository
  - Isolated via RefreshDatabase trait; each test runs on fresh database

---

# 9. KEY DESIGN DECISIONS

### 9.1 Immutable Entities
* Domain entities are immutable; state changes return new instances
* Example: `$business->withVerification($verification)` returns new instance
* Prevents accidental state mutations

### 9.2 Factories for Hydration
* `BusinessFactory`, `RfsFactory`, etc. handle conversion:
  - Array → Domain Entity (from payload or database)
  - Domain Entity → Array (for serialization)
* Keeps infrastructure concerns out of domain

### 9.3 UUIDs for Identity
* All aggregates identified by UUID, not auto-increment IDs
* Enables distributed identity without central coordination
* Uuid value object validates format

### 9.4 Value Objects for Validation
* EmailAddress, Location, MoneyRange enforce constraints at construction
* Invalid data rejected early (exceptions thrown)
* Type-safe: prevents string/int confusion

### 9.5 Repositories as Contracts
* Repository interfaces live in Domain layer
* Implementations (Eloquent) live in Infrastructure
* Enables easy testing with in-memory stubs

### 9.6 Single Responsibility
* Each module has one Application Service (facade)
* Each module has one Repository interface
* Controllers delegate to Application Services
* Application Services orchestrate domain + infrastructure

---

# 10. TESTING APPROACH

## 10.1 Test Structure per Module

```
Tests/
├── Feature/
│   └── [Module]ApiTest.php          # HTTP endpoint tests
└── Unit/
    └── [Module]DomainTest.php       # Domain logic tests
```

## 10.2 Testing Example

```php
// Feature: BusinessApiTest
public function test_create_business() {
    $payload = [...];
    $response = $this->postJson('/api/businesses', $payload);
    $response->assertStatus(201);
    $this->assertDatabaseHas('businesses', ['name' => 'Buyer Co']);
}

// PHPUnit refreshes database before each test via RefreshDatabase trait
```

## 10.3 Rate Limiting in Tests

* API routes use Laravel's ThrottleRequests middleware
* **During testing**: rate limiting disabled to avoid 429 responses
* Config: `RouteServiceProvider` checks `$this->app->environment('testing')`

---

# 11. DATA FLOW DIAGRAM

```
HTTP Request (POST /api/businesses)
  ↓
BusinessController::store()
  ↓
BusinessService::create(payload)
  ↓
BusinessFactory::create(payload)        [Validates & constructs domain entity]
  ↓
BusinessRepository::create(business)
  ↓
EloquentBusinessRepository [Persists via Eloquent]
  ↓
Database (businesses, business_verification, etc.)
  ↓
HttpResponse (201 + JSON array representation)
```

---

# 12. CONFIGURATION & BOOTSTRAPPING

## 12.1 Service Provider Chain

In `config/app.php`:
```php
'providers' => [
    // Core Laravel providers...
    App\Providers\AppServiceProvider::class,
    App\Providers\RouteServiceProvider::class,
    
    // MatchingContext modules:
    App\MatchingContext\SharedKernel\Infrastructure\SharedKernelServiceProvider::class,
    App\MatchingContext\Business\Infrastructure\BusinessServiceProvider::class,
    App\MatchingContext\Taxonomy\Infrastructure\TaxonomyServiceProvider::class,
    App\MatchingContext\Rfs\Infrastructure\RfsServiceProvider::class,
    App\MatchingContext\Matching\Infrastructure\MatchingServiceProvider::class,
    App\MatchingContext\Engagement\Infrastructure\EngagementServiceProvider::class,
    App\MatchingContext\Signal\Infrastructure\SignalServiceProvider::class,
]
```

Each service provider:
1. Binds repository interfaces to implementations
2. Creates singletons for services and factories
3. Registers module routes

## 12.2 Middleware Stack (HTTP)

API routes use:
* `ThrottleRequests::class.':api'` - Rate limiting (60 req/min, disabled in testing)
* `SubstituteBindings::class` - Route model binding
* CORS middleware
* Standard Laravel stack

---

# 13. MODULE DEPENDENCY GRAPH

```
Presentation Layer (HTTP)
  ↓
  ├── BusinessController
  ├── RfsController
  ├── EngagementController
  ├── MatchingController
  └── TaxonomyController
  ↓
Application Layer
  ├── BusinessService
  ├── RfsService
  ├── EngagementService
  ├── MatchingService
  ├── TaxonomyService
  └── SignalService
  ↓
Domain Layer (Entities, Repositories, Value Objects, SharedKernel)
  ↓
Infrastructure Layer (Eloquent Models, Migrations, Implementations)
  ↓
Database (SQLite for testing, configurable for prod)
```

**Cross-Module Dependencies**: 
- Matching depends on Business (candidate retrieval) and Rfs (requirement definition)
- Engagement depends on Business (buyer/seller lookup) and Rfs (session context)
- Signal depends on Engagement (outcomes) and Business (trust updates)
- All modules depend on SharedKernel (Uuid, enums, exceptions)

---

# 14. FUTURE EXTENSIBILITY

### 14.1 Event Sourcing
* Currently: Event-driven via domain entities
* Future: Add event store for audit trail and replay

### 14.2 Async Processing
* Currently: Synchronous operations
* Future: Queue signals processing for background trust updates

### 14.3 Advanced Matching
* Currently: Weighted scoring
* Future: Machine learning models, collaborative filtering

### 14.4 Multi-Tenant Support
* Currently: Single tenant
* Future: Add tenant context to all entities and queries

---

# 15. GLOSSARY

| Term | Definition |
|------|-----------|
| **Bounded Context** | Single cohesive domain model (MatchingContext) |
| **Module** | Collection of related aggregates and services |
| **Aggregate Root** | Entity that is the entry point for a cluster (Business, Rfs, EngagementSession) |
| **Entity** | Object with identity (BusinessCapability, SessionReport) |
| **Value Object** | Immutable object without identity (Uuid, EmailAddress, Location) |
| **Repository** | Abstraction for persistence (Domain interface + Infrastructure implementation) |
| **Factory** | Conversion between domains/arrays and domain entities |
| **Application Service** | Orchestrator for domain logic and infrastructure |
| **RFS** | Request for Service—buyer's structured demand |
| **MatchCandidate** | Ranked seller for an RFS |
| **EngagementSession** | Lifecycle of buyer-seller interaction |
| **OutcomeSignal** | Verified engagement outcome used for trust scoring |

---

* RFSCreated → Matching triggered
* MatchGenerated → Buyer notified
* SessionStarted → Tracking begins
* SessionClosed → Signal processing

---

# 9. SHARED KERNEL

Shared across bounded contexts.

## Contains:

* Identity & Access
* Notification interfaces
* Audit & Logging
* Common Value Objects

## Excludes:

* Domain logic

---

# 10. AGGREGATES

* Business
* RFS
* EngagementSession

## Domain Services:

* MatchingEngine
* ReliabilityCalculator

---

# 11. FEEDBACK LOOP

Core system intelligence comes from:

* Session outcomes
* Behavioral data
* Match success tracking

This continuously improves:

* Matching accuracy
* Ranking quality

---

# 12. FUTURE EVOLUTION

* Machine learning-based ranking
* Dynamic taxonomy expansion
* Predictive matching

---

# 13. SUMMARY

This system is designed as:

* A structured B2B matchmaking platform
* A signal-driven intelligence system
* A modular, scalable DDD architecture

It prioritizes:

* Data quality
* Clear domain boundaries
* Continuous learning

---

# 14. AGGREGATE INVARIANTS

## 14.1 Business Invariants

* A Business must have a valid IdentityProfile upon creation
* A Business cannot act as a Seller without a valid CapabilityProfile
* A Business TrustProfile values must remain within bounds (0 ≤ score ≤ 1)
* A Business cannot have negative employee count or invalid revenue range
* Verification status must be one of: UNVERIFIED, PARTIALLY_VERIFIED, VERIFIED

---

## 14.2 RFS Invariants

* An RFS must have a valid Service Type (Level 3 taxonomy)
* An RFS must include at least one constraint (budget, timeline, or location)
* Budget range must satisfy: min ≤ max
* Timeline must satisfy: startDate ≤ deadline
* Preference weights must be normalized (sum ≤ 1 or normalized internally)
* RFS cannot transition to MATCHED without a generated shortlist

---

## 14.3 EngagementSession Invariants

* A session must always be linked to exactly one Buyer and one Seller
* A session cannot exist without an originating RFS
* A session cannot transition from CLOSED to any other state
* A session must have at least one outcome attempt before closure
* DEAL_CONFIRMED requires dual confirmation from both parties
* DISPUTED occurs when buyer and seller outcomes conflict

---

## 14.4 Matching Invariants

* Matching must only occur on VALID RFS
* Only sellers with matching Service Types (or acceptable hierarchy) can be scored
* Filtered-out candidates must never be scored
* MatchScore must remain within normalized bounds (0 ≤ score ≤ 1)

---

# 15. STATE MACHINES

## 15.1 RFS State Machine

```plaintext
DRAFT → OPEN → MATCHED → CLOSED
```

### Transitions:

* DRAFT → OPEN: Upon validation and submission
* OPEN → MATCHED: When shortlist is generated
* MATCHED → CLOSED: When engagement phase ends or RFS expires

### Rules:

* Only OPEN RFS can be matched
* CLOSED RFS cannot be modified

---

## 15.2 Engagement Session State Machine

```plaintext
INITIATED → ACCEPTED → ACTIVE → STALLED → CLOSED
```

### Transitions:

* INITIATED → ACCEPTED: Seller accepts engagement

* INITIATED → CLOSED: Seller rejects or does not respond (NO_RESPONSE)

* ACCEPTED → ACTIVE: First interaction occurs

* ACTIVE → STALLED: No activity within defined threshold

* STALLED → ACTIVE: Activity resumes

* ACTIVE → CLOSED: Outcome submitted

* STALLED → CLOSED: Timeout or forced closure

---

## 15.3 Session Outcome Resolution

```plaintext
Buyer Outcome + Seller Outcome → Final Outcome
```

### Rules:

* DEAL_CONFIRMED: Both parties confirm success

* NO_AGREEMENT: Both parties agree no deal

* NO_RESPONSE: Seller never engages

* MOVED_OFF_PLATFORM: Reported by one or both parties

* DISPUTED: Conflicting reports

---

# 16. FAILURE SCENARIOS

## 16.1 No Matches Found

* System returns empty shortlist
* Buyer is prompted to:

  * Broaden constraints
  * Adjust requirements

---

## 16.2 Seller Non-Responsiveness

* Session auto-transitions to CLOSED (NO_RESPONSE)
* Seller reliability score is impacted

---

## 16.3 Conflicting Outcomes

* Session marked as DISPUTED
* Confidence score reduced
* No positive signal applied to matching engine

---

## 16.4 Invalid or Incomplete RFS

* RFS remains in DRAFT state
* Cannot enter matching pipeline

---

# 17. MATCHING PERSISTENCE DECISION

## Approach: Hybrid

* Matches are generated on-demand
* Top results are cached as a shortlist

### Benefits:

* Improved performance
* Historical analysis of match quality
* Enables feedback loop tracking

---

# 18. FINAL NOTES

This system is designed to handle:

* Imperfect real-world behavior
* Off-platform negotiations
* Incomplete reporting

Through:

* Structured data
* Controlled state transitions
* Signal-based intelligence

---

# 19. SCHEMA CLARIFICATIONS & STANDARD DEFINITIONS

## 19.1 Service Taxonomy Tables (Correction)

The taxonomy must explicitly separate categories and service types.

### Tables:

* service_categories (Level 1 & 2)
* service_types (Level 3 – atomic matching unit)

#### service_types

| Field       | Type      | Notes                   |
| ----------- | --------- | ----------------------- |
| id          | UUID (PK) |                         |
| name        | VARCHAR   |                         |
| category_id | UUID (FK) | → service_categories.id |
| is_active   | BOOLEAN   |                         |

#### Update Rule:

* service_attributes MUST reference service_types (not categories)

---

## 19.2 ENUM DEFINITIONS (STANDARDIZED)

### business_size

* SMALL
* MEDIUM
* LARGE

### verification_status

* UNVERIFIED
* PARTIALLY_VERIFIED
* VERIFIED

### owner_gender

* MALE
* FEMALE

### revenue_range (TZS-based buckets)

* BELOW_50M
* BETWEEN_50M_500M
* BETWEEN_500M_5B
* ABOVE_5B

### project_size

* SMALL
* MEDIUM
* LARGE

### expertise_level

* BASIC
* INTERMEDIATE
* ADVANCED

### engagement_status

* INITIATED
* ACCEPTED
* ACTIVE
* STALLED
* CLOSED

### engagement_outcome

* DEAL_CONFIRMED
* NO_AGREEMENT
* NO_RESPONSE
* OUT_OF_SCOPE
* MOVED_OFF_PLATFORM
* DISPUTED

---

## 19.3 TRUST METRICS (INITIALIZATION & FORMULAS)

### Default Values (New Business)

* reliability_score = 0.5 (neutral baseline)
* success_rate = 0.0
* response_rate = 0.0
* dispute_rate = 0.0
* avg_response_time = NULL

---

### Computation Rules

#### success_rate

= successful_sessions / total_sessions

---

#### response_rate

= sessions_responded / sessions_received

---

#### dispute_rate

= disputed_sessions / total_sessions

---

#### avg_response_time

= average(time_between_session_creation_and_first_response)

---

#### reliability_score

Weighted formula:

reliability_score =
0.5 * success_rate +
0.3 * response_rate +
0.2 * (1 - dispute_rate)

### Notes:

* Clamp all values between 0 and 1
* Apply minimum session threshold before trusting score (e.g. ≥ 5 sessions)

---

## 19.4 PREFERENCE WEIGHTS POLICY

### Decision:

Store raw values, normalize at runtime.

---

### Rule:

If sum(weights) ≠ 1:

normalized_weight = weight / total_weight

---

### Why:

* Better UX (no strict input constraints)
* Flexible weighting
* Consistent scoring

---

## 19.5 OUTCOME RESOLUTION LOGIC (STRICT)

### Inputs:

* Buyer Report
* Seller Report

---

### Resolution Table:

| Buyer              | Seller         | Final Outcome      |
| ------------------ | -------------- | ------------------ |
| DEAL_CONFIRMED     | DEAL_CONFIRMED | DEAL_CONFIRMED     |
| NO_AGREEMENT       | NO_AGREEMENT   | NO_AGREEMENT       |
| ANY                | NO_RESPONSE    | NO_RESPONSE        |
| MOVED_OFF_PLATFORM | ANY            | MOVED_OFF_PLATFORM |
| Conflict           | Conflict       | DISPUTED           |

---

### Conflict Definition:

If buyer ≠ seller AND not covered above:
→ DISPUTED

---

### Confidence Scoring:

* Dual agreement → 1.0
* Single report → 0.6
* Disputed → 0.3

---

### System Behavior:

* Only DEAL_CONFIRMED with high confidence updates success_rate positively
* DISPUTED reduces reliability_score
* NO_RESPONSE penalizes response_rate

---

# 20. FINAL ARCHITECTURAL CLARITY

This system explicitly embraces:

* Imperfect truth (self-reported outcomes)
* Probabilistic confidence (not binary correctness)
* Continuous learning via signals

---

END OF DOCUMENT
