# Shared Password Policy Constant

## Capability

A single source of truth for the minimum password length policy, exported from a shared module.

## Scenarios

### Scenario: Constant exports the correct minimum length

**Given** the shared constants module is imported
**When** the consumer reads `MIN_PASSWORD_LENGTH`
**Then** the value is `8`

### Scenario: All password validation points import from the shared module

**Given** the reseller registration frontend, API route, and Zod schema are inspected
**When** each validation point is checked for password length enforcement
**Then** all three reference `MIN_PASSWORD_LENGTH` from the shared module (no hardcoded values)

### Scenario: Changing the constant propagates everywhere

**Given** `MIN_PASSWORD_LENGTH` is changed from `8` to `10` in the shared module
**When** the frontend, API, and Zod schema are evaluated
**Then** all three enforce the new value of `10` without code changes in their own files
