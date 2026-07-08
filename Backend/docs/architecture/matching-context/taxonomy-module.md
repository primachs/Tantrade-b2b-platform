# Taxonomy Module

The `Taxonomy` module provides the hierarchical categorization system used to classify businesses (Capabilities) and Requests (Service Types).

## Detailed Class Architecture

![Taxonomy_Module_Class_Diagram](./diagrams/Taxonomy_Module_Class_Diagram.svg)

## Use Cases

![Taxonomy_Module_Use_Cases](./diagrams/Taxonomy_Module_Use_Cases.svg)

## Layers Description

- **Domain Layer**: Manages `ServiceCategory` (with self-referential nested hierarchies), `ServiceType` (the concrete service being requested/offered), and specific `ServiceAttribute` properties.
- **Application Layer**: Provides methods to build the static taxonomy system and list it fully for frontend consumption.
- **Infrastructure Layer**: standard Eloquent implementation.
- **Presentation Layer**: Exposes endpoints for managing the categorization structure (Admin) and querying it (Users/App).
