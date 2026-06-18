# TanTrade B2B Platform — Service-Aware Auth & Routing

## Overview

The system has two fully-built bounded contexts (Matching & Market Governance) and a
complete Authentication Shared Kernel. All backend views (`BusinessView`, `GovernanceView`,
`AdminView`) exist in the frontend but the wiring from **Get Started → service choice →
auth → correct dashboard** is missing.

This plan closes that gap in one cohesive implementation.

---

## Current State Summary

| Area | Status |
|------|--------|
| `LandingPage` "Get Started" | Goes directly to auth — no service choice |
| `LoginPage` registration | No service parameter; no auto-login after register |
| `DashboardPage` | Only shows `BusinessView` (BUYER/SELLER); `GovernanceView` & `AdminView` are orphaned |
| Backend `register` endpoint | Accepts name/email/password only — no role assignment |
| Roles in DB | `ADMIN`, `GOVERNANCE`, `BUYER`, `SELLER` all seeded and ready |

---

## Proposed Changes

---

### 1 — Frontend: New Service Selection Screen

#### [NEW] `src/presentation/pages/ServiceSelectionPage.tsx`

A full-screen, premium service picker displayed **after** "Get Started" is clicked and
**before** the auth form. Two cards:

| Card | Role Path | Icon |
|------|-----------|------|
| B2B Matchmaking Platform | `matching` → assigns `BUYER` | Radar |
| Broker Management System | `governance` → assigns `GOVERNANCE` | MapPin |

Design: dark glassmorphism cards with gradient accents, animated hover lift, feature
bullet lists, and a prominent CTA per card. One "← Back" link to return to landing.

---

### 2 — Frontend: Update `App.tsx`

Route state expands from 3 to 4 states:

```
"landing" → "service-select" → "auth" → "dashboard"
```

New `selectedService` state (`"matching" | "governance" | null`) is threaded from
`ServiceSelectionPage` into `LoginPage` and then into `useAuth.register()`.

After login/register, routing logic reads `user.roles` to determine the correct dashboard
view — not a generic `/dashboard`.

#### [MODIFY] `src/App.tsx`

- Add `"service-select"` to the route union type
- Add `selectedService` state
- Render `ServiceSelectionPage` at `route === "service-select"`
- Pass `selectedService` down to `LoginPage`
- On auth success, the `useEffect` that listens for `user` triggers the dashboard route

---

### 3 — Frontend: Update `LoginPage.tsx`

#### [MODIFY] `src/presentation/pages/LoginPage.tsx`

- Accept `selectedService: "matching" | "governance" | null` prop
- Show a service context badge in the header (e.g. "B2B Matchmaking" with Radar icon)
- Pass `selectedService` into the `onRegister()` call signature

---

### 4 — Frontend: Update `useAuth.ts` — Auto-login after register

#### [MODIFY] `src/modules/auth/useAuth.ts`

- `register()` accepts `service?: string` as a new last parameter
- After successful registration, immediately calls `login()` with the same credentials
- This gives the user a token + roles in one step, enabling direct dashboard routing
- No extra "Sign in" step required

---

### 5 — Frontend: Update `DashboardPage.tsx` — Role-based view routing

#### [MODIFY] `src/presentation/pages/DashboardPage.tsx`

Add role checks using the seeded role names:

```
ADMIN       → AdminView
GOVERNANCE  → GovernanceView
BUYER/SELLER → BusinessView
(none)      → "Role assignment required" message
```

If a user holds multiple roles (e.g. ADMIN + BUYER), show a tab strip so they can
switch between workspaces within the dashboard.

Pass `GovernanceView` and `AdminView` the correct props (token, user, setNotice).

---

### 6 — Backend: Update `AuthController.php` — Accept `service` on registration

#### [MODIFY] `Backend/app/AuthenticationContext/Auth/Presentation/Http/AuthController.php`

Add `service` to the register validation:
```php
'service' => ['nullable', 'string', 'in:matching,governance'],
```

Pass `service` through to `AuthService::register()`.

---

### 7 — Backend: Update `AuthService.php` — Assign role on registration

#### [MODIFY] `Backend/app/AuthenticationContext/Auth/Application/AuthService.php`

After `$saved = $this->repository->create($user)`, if `$payload['service']` is set:

| service value | Role assigned |
|---------------|---------------|
| `matching`    | `BUYER`       |
| `governance`  | `GOVERNANCE`  |

Use the existing `RoleRepository` (already bound via the service provider) to look up the
role by name and call `assignToUser()`.

Inject `RoleRepository` into `AuthService` constructor (alongside the existing
`AuthUserRepository`).

The `me` endpoint already returns `roles[]` — no changes needed there.

---

## Open Questions

> [!IMPORTANT]
> **When a new user registers for "matching", should they be BUYER, SELLER, or both?**
> The plan defaults to **BUYER** only — a logical starting point (they publish an RFS to
> find sellers). They can become a SELLER when the admin assigns that role later.
> Reply to change this behaviour.

> [!NOTE]
> **Should auto-login after registration use the same password the user just typed?**
> Yes — the plain-text password is available in the registration form state before the
> form clears, so this is safe and seamless.

---

## Verification Plan

### Frontend
- Click "Get Started" → service-select screen appears with two cards
- Select "B2B Matchmaking" → auth page shows Radar badge + "B2B Matchmaking" label
- Register a new user → immediately lands on BusinessView with BUYER role badge in header
- Select "Broker Management" → register → immediately lands on GovernanceView with GOVERNANCE role
- Existing ADMIN user logs in → sees AdminView
- User with no roles sees the "Role assignment required" notice (existing behaviour)

### Backend
- `POST /api/auth/register` with `{"service":"matching"}` → user gets BUYER role in DB
- `POST /api/auth/register` with `{"service":"governance"}` → user gets GOVERNANCE role
- `POST /api/auth/register` without `service` → no role assigned (backward-compatible)
- `GET /api/auth/me` returns `roles: ["BUYER"]` for a newly registered matching user

---

## Files Changed Summary

| File | Change |
|------|--------|
| `Frontend/src/presentation/pages/ServiceSelectionPage.tsx` | **NEW** |
| `Frontend/src/App.tsx` | Add route state, selectedService, service-select render |
| `Frontend/src/presentation/pages/LoginPage.tsx` | Accept + display selectedService, pass to register |
| `Frontend/src/modules/auth/useAuth.ts` | register accepts service, auto-login after register |
| `Frontend/src/presentation/pages/DashboardPage.tsx` | ADMIN/GOVERNANCE/BUYER routing + tab strip |
| `Backend/app/AuthenticationContext/Auth/Presentation/Http/AuthController.php` | Add service validation |
| `Backend/app/AuthenticationContext/Auth/Application/AuthService.php` | Role assignment on register |
