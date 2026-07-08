# Authentication Context

The **Authentication Context** is responsible for managing identity, credentials, user registration, and Role-Based Access Control (RBAC). It ensures that only authenticated and authorized users can interact with the system.

## Modules

The context is primarily composed of the **Auth Module**, which encapsulates the entire identity lifecycle. It utilizes a `SharedKernel` for common context-specific utilities.

* [Auth Module](authentication-context/auth-module.md)

## Context Boundary

```mermaid
graph TD
    subgraph Authentication Context
        auth[Auth Logic]
        identity[(Auth Schema)]
        auth --> identity
    end
```

This bounded context does not rely on any other contexts. Other contexts rely on the claims (e.g. JWT tokens) issued by this context but do not query it directly, adhering to loose coupling principles.
