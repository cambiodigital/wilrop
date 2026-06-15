# Design: Password Minimum Length Consistency Fix

## Context

Three independent code locations define the reseller password minimum length using hardcoded values:

1. `src/components/reseller/ResellerRegister.tsx:43` — `form.password.length < 8`
2. `src/app/api/reseller/register/route.ts:28` — `password.length < 6`
3. `src/lib/reseller/validators.ts:16` — `z.string().min(8, ...)`

The API route (6) is the outlier. The frontend and Zod schema both use 8. There is no shared constant anywhere in `src/lib/`.

## Decisions

### D1: Create `src/lib/constants.ts` for shared policy constants

**Chosen:** New file `src/lib/constants.ts` exporting `MIN_PASSWORD_LENGTH = 8`.

**Alternatives considered:**
- Add to existing `src/lib/brand.ts` — Rejected. `brand.ts` is for brand identity (name, logo, tagline), not security policy. Mixing concerns would confuse future readers.
- Add to existing `src/lib/reseller/validators.ts` — Rejected. The frontend component would need to import from a validator module, coupling UI to backend validation logic.
- Inline fix only (just change `6` to `8` in route.ts) — Rejected. The three locations would still be independently hardcoded, inviting future drift.

**Rationale:** A new dedicated constants file is the lightest-touch approach that actually solves the root cause (no shared source of truth). It follows the existing project pattern where `src/lib/` modules are single-responsibility (e.g., `brand.ts`, `json.ts`, `password.mjs`).

### D2: Keep numeric value in error message dynamic

**Chosen:** The API error message will reference the constant value (e.g., `al menos ${MIN_PASSWORD_LENGTH} caracteres`).

**Alternative:** Hardcode "8" in the string — Rejected. If the constant changes, the message would be stale.

### D3: Test strategy — direct handler invocation

**Chosen:** Write a `.test.cjs` file using `node:test` + `node:assert/strict` following the existing test pattern from `tests/catalog-pr2.test.cjs`. Import the validation logic directly rather than testing through HTTP.

**Alternative:** Full HTTP integration test with a running server — Rejected. Overkill for a validation check. The existing test suite uses direct function imports, and we follow that convention.

### D4: No changes to frontend or Zod schema

**Chosen:** Only the API route and the new constants file are modified. The frontend (`ResellerRegister.tsx`) and Zod schema (`validators.ts`) already use `8` and will be updated to import `MIN_PASSWORD_LENGTH` for future-proofing.

**Rationale:** This makes the change atomic — the actual enforcement value doesn't change for 2 of 3 consumers, reducing risk.

## File Changes

| File | Action | Description |
|---|---|---|
| `src/lib/constants.ts` | **CREATE** | Export `MIN_PASSWORD_LENGTH = 8` |
| `src/app/api/reseller/register/route.ts` | **EDIT** | Import constant, replace `6` with `MIN_PASSWORD_LENGTH`, make error message dynamic |
| `src/components/reseller/ResellerRegister.tsx` | **EDIT** | Import constant, replace hardcoded `8` with `MIN_PASSWORD_LENGTH` |
| `src/lib/reseller/validators.ts` | **EDIT** | Import constant, replace hardcoded `8` with `MIN_PASSWORD_LENGTH` |
| `tests/password-min-length.test.cjs` | **CREATE** | Unit test for API validation logic |

## Dependencies

- No new npm packages required
- No database changes
- No environment variable changes
