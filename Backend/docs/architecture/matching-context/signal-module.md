# Signal Module

The `Signal` module is responsible for capturing raw outcomes (Signals) from user engagements and recalculating dynamic trust metrics for businesses.

## Detailed Class Architecture

![Signal_Module_Class_Diagram](./diagrams/Signal_Module_Class_Diagram.svg)

## Use Cases

![Signal_Module_Use_Cases](./diagrams/Signal_Module_Use_Cases.svg)

## Layers Description

- **Domain Layer**: Introduces `OutcomeSignal` as an event stream record. Contains heavy logic in `OutcomeResolver` (to deduce actual deal states from conflicting user reports) and `ReliabilityCalculator` (math logic for trust scores).
- **Application Layer**: `SignalService` acts as an event subscriber/listener, taking completed engagement reports and turning them into Signals and recalculating trust metrics.
- **Infrastructure Layer**: Basic storage of the signals for historical and audit purposes.
- **Presentation Layer**: Does not exist for this module natively. Signals are recorded via internal Domain Events emitted by the `Engagement` module.

## Implementation Details & Workflows

### 1. Outcome Resolution (`OutcomeResolver`)
The `OutcomeResolver` analyzes `SessionReport` records to deduce truth. 
- If both parties report a successful deal (dual confirmation), it immediately resolves to a Deal.
- If one party claims a deal and the other doesn't respond (no response priority), it favors the responder.
- If outcomes conflict, it assigns a `DISPUTED` signal, which heavily impacts trust metrics.

### 2. Trust Metric Recalculation (`ReliabilityCalculator`)
The `ReliabilityCalculator` dynamically recalculates a seller's `BusinessTrustMetrics`. It fetches historical sessions via the `EngagementRepository`.
- It calculates `successRate` (completed deals / total active sessions).
- It tracks `disputeRate` (conflicting outcomes).
- It calculates `averageResponseTime` to fulfill buyer preferences in the matching algorithm.
- Values are clamped (e.g., between 0.0 and 1.0) before being synchronized via the `SignalService`.
