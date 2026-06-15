# API Registration Password Validation Alignment

## Capability

The reseller registration API endpoint rejects passwords shorter than the shared minimum length.

## Scenarios

### Scenario: API rejects password shorter than minimum

**Given** a POST request to `/api/reseller/register` with all required fields
**When** the `password` field has fewer than `MIN_PASSWORD_LENGTH` characters (e.g., 7 characters)
**Then** the response status is `400`
**And** the response body contains `{ success: false, error: "..." }` with a message indicating the minimum length

### Scenario: API accepts password at minimum length

**Given** a POST request to `/api/reseller/register` with all required fields
**When** the `password` field has exactly `MIN_PASSWORD_LENGTH` characters
**Then** the request passes the password length check (subsequent validation may still apply)

### Scenario: API error message matches the shared constant value

**Given** the shared `MIN_PASSWORD_LENGTH` is `8`
**When** a password shorter than 8 characters is submitted
**Then** the error message states "al menos 8 caracteres" (not a hardcoded number)
