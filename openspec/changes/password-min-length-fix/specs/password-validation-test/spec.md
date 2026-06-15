# Password Validation Unit Test

## Capability

A unit test verifies that the registration API enforces the shared minimum password length.

## Scenarios

### Scenario: Test rejects short password

**Given** the test creates a mock registration request with a 7-character password
**When** the API handler is invoked
**Then** the response status is `400`
**And** the error message references the minimum length

### Scenario: Test accepts valid password length

**Given** the test creates a mock registration request with an 8-character password
**When** the API handler is invoked
**Then** the request passes the password length validation (response is not `400` for length reasons)

### Scenario: Test uses the shared constant

**Given** the test imports `MIN_PASSWORD_LENGTH` from the shared module
**When** the test constructs the short password as `'a'.repeat(MIN_PASSWORD_LENGTH - 1)`
**Then** the test is decoupled from the specific number and adapts if the constant changes
