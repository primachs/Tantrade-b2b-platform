# Broker Module

The `Broker` module within the Market Governance Context is responsible for managing administrative brokers. Brokers serve as moderators or facilitators within specific markets.

## Detailed Class Architecture

![Broker_Module_Class_Diagram](./diagrams/Broker_Module_Class_Diagram.svg)

## Use Cases

![Broker_Module_Use_Cases](./diagrams/Broker_Module_Use_Cases.svg)

## Layers Description

- **Domain Layer**: Contains the `BrokerRegistration` aggregate root managing the broker's identity, linked to a specific `MarketId` and `UserId`.
- **Application Layer**: `BrokerService` manages the lifecycle of a broker (e.g., onboarding, deactivation).
- **Infrastructure Layer**: `EloquentBrokerRepository` implements storage operations using the `market_governance_broker_registrations` table.
- **Presentation Layer**: Exposes the CRUD endpoints through `BrokerController`.

## Implementation Details & Workflows

### 1. Broker Registration (`register`)
Brokers are registered using the `BrokerService::register` flow. The provided payload maps to a `BrokerRegistration` domain entity via the `BrokerFactory`. A broker must be linked to a specific `marketId`, creating a bound relationship between the administrative moderator (broker) and the marketplace they govern.

### 2. Status Management (`deactivate`)
Instead of deleting broker records (which would destroy historical governance data), the platform uses a soft-deactivation approach. The `BrokerService::deactivate` method retrieves the `BrokerRegistration` aggregate, mutates its state using the domain method `withStatus(BrokerStatus::INACTIVE->value)`, and persists the change.
