# Proposal: Password Minimum Length Consistency Fix

## Problem Statement

The reseller registration flow has inconsistent password minimum length validation across its layers:

| Location | Minimum Length | Status |
|---|---|---|
| `ResellerRegister.tsx:43` (frontend) | 8 characters | Correct |
| `register/route.ts:28` (API) | **6 characters** | **Inconsistent** |
| `validators.ts:16` (Zod schema) | 8 characters | Correct |

The API route accepts passwords of 6-7 characters that the frontend already rejects. This creates a contradiction: a user who bypasses frontend validation (e.g., direct API call) can set a weaker password than what the UI enforces. Additionally, no shared constant defines this policy, so each location hardcodes its own value.

## Motivation

- **Security**: The API is the single source of truth for validation. A lower bar at the API level defeats the frontend's stricter check.
- **Maintainability**: Three separate hardcoded values (6, 8, 8) will inevitably drift again. A single constant prevents this.
- **User experience**: Password change (Zod: 8) and registration (API: 6) use different thresholds for the same user population.

## Proposed Change

Align all password minimum length validation to a shared constant of **8 characters**, and introduce `MIN_PASSWORD_LENGTH` in `src/lib/constants.ts` (or similar shared location).

## Capabilities

1. **Shared password policy constant** — A single exported constant `MIN_PASSWORD_LENGTH = 8` used by all validation points.
2. **API registration alignment** — `register/route.ts` uses the shared constant instead of hardcoded `6`.
3. **Unit test coverage** — A test that verifies the API rejects passwords shorter than 8 characters.

## Scope

- **In scope**: API route fix, shared constant extraction, unit test
- **Out of scope**: Admin auth changes, database migration, password strength rules (uppercase, numbers, etc.)

## Risk Assessment

- **Risk**: Very low — changing a single validation threshold from 6 to 8
- **Breaking change**: No — the frontend already enforces 8, so no existing user flow is affected
- **Data migration**: None required

## Estimated Effort

~15 minutes of implementation.
