# RFS (Request For Service) Module

The `Rfs` module allows buyers to publish a requirement for goods or services to the marketplace.

## Module Architecture

```plantuml
@startuml Rfs_Module
skinparam componentStyle rectangle

package "RFS Module" {
  package "Presentation" {
    [RfsController]
  }
  
  package "Application" {
    [RfsService]
  }
  
  package "Domain" {
    [Rfs Entity]
    [RfsRepository Interface]
  }
  
  package "Infrastructure" {
    [Eloquent RfsRepository]
    [Rfs Model]
  }
}

[RfsController] --> [RfsService]
[RfsService] --> [Rfs Entity]
[RfsService] --> [RfsRepository Interface]
[Eloquent RfsRepository] ..|> [RfsRepository Interface]

@enduml
```

## Layers
- **Domain**: Business rules around RFS budget, deadlines, and publishing states.
- **Application**: `RfsService` handles publishing RFS and closing them when deadlines are met.
- **Infrastructure**: Eloquent models mapping RFS data and its Taxonomy tags.
- **Presentation**: `RfsController` API for CRUD operations on RFS.
