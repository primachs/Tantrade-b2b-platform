# Business Module

The `Business` module within the Matching Context represents companies participating in the B2B platform.

## Module Architecture

```plantuml
@startuml Business_Module
skinparam componentStyle rectangle

package "Business Module" {
  package "Presentation" {
    [BusinessController]
  }
  
  package "Application" {
    [BusinessService]
  }
  
  package "Domain" {
    [Business Profile Entity]
    [BusinessRepository Interface]
  }
  
  package "Infrastructure" {
    [Eloquent BusinessRepository]
    [Business Model]
  }
}

[BusinessController] --> [BusinessService]
[BusinessService] --> [Business Profile Entity]
[BusinessService] --> [BusinessRepository Interface]
[Eloquent BusinessRepository] ..|> [BusinessRepository Interface]

@enduml
```

## Layers
- **Domain**: Core attributes like company size, registration numbers, and status.
- **Application**: `BusinessService` handles onboarding flow and verification triggers.
- **Infrastructure**: Eloquent repositories storing business profile metadata.
- **Presentation**: `BusinessController` API endpoints.
