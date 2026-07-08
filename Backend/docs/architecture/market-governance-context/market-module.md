# Market Module

The `Market` module manages the definition, categorization, and lifecycle of distinct markets within the platform. Markets serve as the foundational venues where brokers moderate and businesses engage.

## Module Architecture

```plantuml
@startuml Market_Module
skinparam componentStyle rectangle

package "Market Module" {
  package "Presentation" {
    [MarketController]
  }
  
  package "Application" {
    [MarketService]
  }
  
  package "Domain" {
    [Market Entity]
    [MarketCategory ValueObject]
    [MarketRepository Interface]
  }
  
  package "Infrastructure" {
    [Eloquent MarketRepository]
    [Market Model]
  }
}

[MarketController] --> [MarketService]
[MarketService] --> [Market Entity]
[MarketService] --> [MarketRepository Interface]
[Eloquent MarketRepository] ..|> [MarketRepository Interface]

@enduml
```

## Layers

### Domain Layer
- **Market Entity**: Aggregate root defining a market (e.g., Agricultural, Tech Services).
- **Repository Interface**: `MarketRepositoryInterface`.

### Application Layer
- **MarketService**: Handles operations like creating markets, updating market statuses (Open/Closed), and retrieving market structures.

### Infrastructure Layer
- **Repositories**: Eloquent mappings for Market storage.

### Presentation Layer
- **Controllers**: Exposes endpoints to browse markets and for admins to manage them.
