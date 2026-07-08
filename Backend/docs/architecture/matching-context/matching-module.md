# Matching Module

The `Matching` module contains the algorithmic core of the platform. It calculates fit scores between Requests for Services (RFS) and candidate businesses based on constraints, taxonomy attributes, trust metrics, and preferences, outputting a ranked Shortlist.

## Detailed Class Architecture

![Matching_Module_Class_Diagram](./diagrams/Matching_Module_Class_Diagram.svg)

## Use Cases

![Matching_Module_Use_Cases](./diagrams/Matching_Module_Use_Cases.svg)

## Layers Description

- **Domain Layer**: Centralized around the `MatchShortlist` aggregate and the `MatchingEngine` domain service which isolates the complex scoring algorithms (Capability, Constraint Fit, Trust/Preferences).
- **Application Layer**: `MatchingService` bridges the `Rfs` module to get constraints, the `Taxonomy` module to get scoring weights, and delegates candidate retrieval to the `MatchingRepository`.
- **Infrastructure Layer**: Stores historical `shortlists` and associated `match_candidates` with their rank and scores.
- **Presentation Layer**: Exposes endpoints to trigger matching and fetch results.

## Implementation Details & Workflows

### 1. The Matching Algorithm (`MatchingEngine`)
The `MatchingEngine::scoreCandidate` is the heart of the platform. It generates a fit score between a buyer's `Rfs` and a seller's `CandidateProfile` based on three main pillars:
- **Capability Score:** Checks if the seller's specific capabilities/attributes align with the RFS Service Type. It calculates an `attributeMatchRatio`.
- **Constraint Fit:** Validates hard constraints. E.g., does the seller's pricing fit the RFS budget? Does their availability match the RFS timeline? Do their locations align?
- **Preference Score:** Incorporates the buyer's custom `PreferenceWeights`. If a buyer weights 'Speed' highly, sellers with faster historical response times (from `BusinessTrustMetrics`) are boosted.

### 2. Shortlist Generation (`generateShortlist`)
The `MatchingService` orchestrates the engine. It loads the `Rfs`, grabs the taxonomy tree (`buildTaxonomyScoreMap`), fetches candidate businesses from the repository (`findCandidatesByServiceTypes`), and feeds them into the `MatchingEngine`. It then sorts candidates by score, constructs a `MatchShortlist` aggregate via the factory, and persists it.
