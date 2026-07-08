# Matching Context

The **Matching Context** is the core operational domain of the B2B platform. It manages the onboarding of business entities, the classification of goods and services (Taxonomy), the submission of Request For Services (RFS), the algorithmic matching of businesses, user trust signals, and the resulting business engagements.

## Modules

The context is divided into six functional modules and a `SharedKernel` for shared domain events, value objects, and standard exceptions.

1. **[Business Module](matching-context/business-module.md)**: Manages business profiles and verifications.
2. **[Engagement Module](matching-context/engagement-module.md)**: Manages communications, bids, and contracts resulting from a match.
3. **[Matching Module](matching-context/matching-module.md)**: Encapsulates the algorithmic logic matching an RFS to potential Businesses.
4. **[Rfs Module](matching-context/rfs-module.md)**: Manages Request For Service (RFS) creation and lifecycle.
5. **[Signal Module](matching-context/signal-module.md)**: Manages trust indicators, KYC/AML scores, and user ratings.
6. **[Taxonomy Module](matching-context/taxonomy-module.md)**: Defines the classification tree for products and services.

## Context Boundary

```mermaid
architecture-beta
    group match(server)[Matching Context]

    service core(database)[Matching Schema] in match
    
    match:R --> core:L
```

The modules within this context communicate with each other via internal domain events and strictly defined interfaces, operating within the same database transaction boundary when necessary.
