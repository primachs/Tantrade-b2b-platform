# System Architecture Overview

The TanTrade B2B Platform is designed as a **Modular Monolith** using **Domain-Driven Design (DDD)** principles. The backend codebase is strictly separated into distinct **Bounded Contexts**.

## Bounded Contexts

The application is divided into three primary bounded contexts:
1. **Authentication Context (`app/AuthenticationContext`)**: Manages identity, access control, and user roles.
2. **Market Governance Context (`app/MarketGovernanceContext`)**: Responsible for market administration, brokerage, and compliance.
3. **Matching Context (`app/MatchingContext`)**: The core domain engine responsible for business profiles, Request For Services (RFS), B2B matching algorithms, engagements, and trust signals.

## System Diagram

```mermaid
graph TD
    api[API Gateway / Router]

    subgraph Authentication Context
        auth_db[(Identity & Roles)]
    end

    subgraph Market Governance Context
        gov_db[(Market & Broker Admin)]
    end

    subgraph Matching Context
        match_db[(B2B Matching Engine)]
    end

    api --> auth_db
    api --> gov_db
    api --> match_db
```

### Detailed PlantUML System Map

```plantuml
@startuml System_Overview
skinparam componentStyle rectangle

package "TanTrade B2B Platform (Modular Monolith)" {
  
  [Authentication Context] as AuthCtx
  [Market Governance Context] as GovCtx
  [Matching Context] as MatchCtx
  
  database "Shared Relational DB" as DB {
    [Auth Schema]
    [Governance Schema]
    [Matching Schema]
  }
}

AuthCtx ..> [Auth Schema] : Read/Write
GovCtx ..> [Governance Schema] : Read/Write
MatchCtx ..> [Matching Schema] : Read/Write

note right of AuthCtx
  Strict boundaries: No direct 
  code dependencies between contexts.
end note

@enduml
```

## Communication

The contexts are designed to be completely independent. Analysis of the codebase reveals **no cross-context imports** in the production domain or application layers. They operate as autonomous modules within the Laravel monolith, sharing only the underlying infrastructure (Database) and framework primitives (Routing).
