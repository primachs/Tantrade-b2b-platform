# Taxonomy Module

The `Taxonomy` module provides a hierarchical classification system for products and services. It allows standardizing what businesses offer and what an RFS requires.

## Module Architecture

```plantuml
@startuml Taxonomy_Module
skinparam componentStyle rectangle

package "Taxonomy Module" {
  package "Presentation" {
    [TaxonomyController]
  }
  
  package "Application" {
    [TaxonomyService]
  }
  
  package "Domain" {
    [Category Node Entity]
    [TaxonomyRepository Interface]
  }
  
  package "Infrastructure" {
    [Eloquent TaxonomyRepository]
    [Category Model]
  }
}

[TaxonomyController] --> [TaxonomyService]
[TaxonomyService] --> [Category Node Entity]
[TaxonomyService] --> [TaxonomyRepository Interface]
[Eloquent TaxonomyRepository] ..|> [TaxonomyRepository Interface]

@enduml
```

## Layers
- **Domain**: Graph/Tree logic ensuring categories have correct parents.
- **Application**: `TaxonomyService` retrieves sub-trees and registers new standard tags.
- **Infrastructure**: Adjacency list or nested set storage for the hierarchy.
- **Presentation**: `TaxonomyController` exposing the category tree to the frontend.
