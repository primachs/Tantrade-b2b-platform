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
