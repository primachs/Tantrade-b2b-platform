# Engagement Module

The `Engagement` module tracks interactions between businesses, such as responding to RFS bids, negotiating, and completing B2B transactions.

## Module Architecture

```plantuml
@startuml Engagement_Module
skinparam componentStyle rectangle

package "Engagement Module" {
  package "Presentation" {
    [EngagementController]
  }
  
  package "Application" {
    [EngagementService]
  }
  
  package "Domain" {
    [Engagement Entity]
    [Bid Entity]
    [EngagementRepository Interface]
  }
  
  package "Infrastructure" {
    [Eloquent EngagementRepository]
    [Engagement Model]
  }
}

[EngagementController] --> [EngagementService]
[EngagementService] --> [Engagement Entity]
[EngagementService] --> [EngagementRepository Interface]
[Eloquent EngagementRepository] ..|> [EngagementRepository Interface]

@enduml
```

## Layers
- **Domain**: Entities that enforce rules around bid submissions and contract states.
- **Application**: `EngagementService` manages the state machine of an engagement (e.g., Draft, Accepted, Completed).
- **Infrastructure**: Eloquent bindings for storing bids and engagement timelines.
- **Presentation**: `EngagementController` for managing active deals.
