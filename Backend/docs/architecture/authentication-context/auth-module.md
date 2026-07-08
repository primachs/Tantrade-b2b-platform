# Auth Module

The `Auth` module implements the Domain-Driven Design (DDD) layered architecture to manage user identity, authentication, and authorization.

## Detailed Class Architecture

![Auth_Module_Class_Diagram](./diagrams/Auth_Module_Class_Diagram.svg)

## Use Cases

![Auth_Module_Use_Cases](./diagrams/Auth_Module_Use_Cases.svg)

## Layers Description

- **Domain Layer**: Contains `AuthUser`, `Role`, and `Permission` aggregate roots/entities. Defines repository interfaces (`AuthUserRepository`, `RoleRepository`).
- **Application Layer**: Services like `AuthService` orchestrate domain flows (registration, login, service selection).
- **Infrastructure Layer**: Implements persistence using Eloquent models and MySQL tables (e.g. `auth_users`, `auth_roles`).
- **Presentation Layer**: Exposes JSON REST APIs through `AuthController` and `RoleController`.

## Implementation Details & Workflows

### 1. User Registration & Role Assignment
When a user registers (`AuthService::register`), the system hashes their password using Laravel's standard `Hash` facade and assigns an initial `ACTIVE` status. Crucially, if the user specifies a platform service (`matching` or `governance`), the application layer delegates to the `RoleRepository` to immediately assign the appropriate domain roles (e.g., `BUYER`, `SELLER` for matching; `GOVERNANCE` for governance). This ensures role-based access control (RBAC) starts at onboarding.

### 2. Login Security & Lockouts
The `AuthService::login` workflow incorporates standard security measures. If an account is inactive or temporarily locked, login is immediately rejected. On a failed password attempt, the system increments the `failedLoginAttempts` counter. If the user fails 5 consecutive times, the account is locked for 15 minutes (`LOCKOUT_MINUTES`). 
Upon successful login, previous failures are cleared, and a new API token is issued via the repository (`issueToken()`), simultaneously recording the login attempt for audit purposes.

### 3. Service Selection (`selectService`)
If a user registers without a service context, they can later call `selectService()`. The system validates that the user doesn't already have an assigned service role. It then assigns the necessary roles exactly like registration, bridging the gap between generic authentication and platform-specific capabilities.

### 4. Password Management
The `changePassword` flow strictly requires the existing plain-text password to be verified against the stored hash before permitting an update. Once verified, a new hash is generated and the `password_changed_at` timestamp is updated, which can be utilized to invalidate active sessions if necessary.
