# Governance Module

The `Governance` module handles the rules, moderation policies, and market administration (e.g., assigning chairpersons to offices).

## Detailed Class Architecture

![Governance_Module_Class_Diagram](./diagrams/Governance_Module_Class_Diagram.svg)

## Use Cases

![Governance_Module_Use_Cases](./diagrams/Governance_Module_Use_Cases.svg)

## Layers Description

- **Domain Layer**: Contains the `MarketOffice` and `OfficeTerm` aggregates which define administrative positions for a given market.
- **Application Layer**: `GovernanceService` enforces rules like ensuring a user isn't assigned to multiple active terms or that terms don't exceed time limits.
- **Infrastructure Layer**: Implements standard Eloquent repositories and migrations.
- **Presentation Layer**: Exposes API endpoints for administrators to manage governance structures.

## Implementation Details & Workflows

### 1. Office Creation
Markets can have multiple governance offices (e.g. `CHAIRPERSON`). The `GovernanceService::createOffice` method ensures idempotency by checking `findOfficeByMarketAndType` before creating a new `MarketOffice`. 

### 2. Chairperson Assignment Rules (`assignChairperson`)
Assigning a user to a governance office requires strict validation. 
- **Active Term Checking:** The service checks if the office already has an active term via `hasActiveOfficeTermForOffice`. If true, assignment is rejected.
- **Term Limits:** Office terms default to 5 years. The system dynamically calculates the `endDate` (if not provided) as exactly 5 years from the `startDate`. Explicit end dates are validated to ensure they fall after the start date and do not exceed the 5-year maximum.
- **Profile Synchronization:** Since Chairpersons act as public figures, assigning a chairperson automatically syncs profile fields (NIDA number, name, address) back into the shared `AuthUser` record.

### 3. Term Expiration & Ending (`endTerm`)
Terms can be ended prematurely via `GovernanceService::endTerm()`. The system mutates the term using `withEndDate()` (defaulting to 'now') and `withStatus(OfficeTermStatus::ENDED->value)`. This strictly enforces domain invariants by not allowing the new end date to fall before the original start date.
