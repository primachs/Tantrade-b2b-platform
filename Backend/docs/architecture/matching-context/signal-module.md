# Signal Module

The `Signal` module aggregates trust vectors. It tracks KYC (Know Your Customer) verifications, historical ratings, and performance signals of businesses.

## Module Architecture

```plantuml
@startuml Signal_Module
skinparam componentStyle rectangle

package "Signal Module" {
  package "Presentation" {
    [SignalController]
  }
  
  package "Application" {
    [SignalService]
  }
  
  package "Domain" {
    [TrustSignal Entity]
    [SignalRepository Interface]
  }
  
  package "Infrastructure" {
    [Eloquent SignalRepository]
    [Signal Model]
  }
}

[SignalController] --> [SignalService]
[SignalService] --> [TrustSignal Entity]
[SignalService] --> [SignalRepository Interface]
[Eloquent SignalRepository] ..|> [SignalRepository Interface]

@enduml
```

## Layers
- **Domain**: Trust signal weightings and calculation models.
- **Application**: `SignalService` exposes aggregated trust scores to the Matching engine.
- **Infrastructure**: Persists individual ratings and verification checks.
- **Presentation**: `SignalController` for adding reviews or viewing trust scores.
