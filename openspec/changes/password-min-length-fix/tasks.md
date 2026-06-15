# Tasks: Password Minimum Length Consistency Fix

> **Strict TDD**: true — Tests are written before implementation.

## Task 1: Create shared constants module (RED phase setup)

**File**: `src/lib/constants.ts` (CREATE)
**Action**: Create the file and export `MIN_PASSWORD_LENGTH = 8`.
**Verification**: File exists and exports the constant with value `8`.

```
[ ] 1.1 Create `src/lib/constants.ts` with `export const MIN_PASSWORD_LENGTH = 8`
```

## Task 2: Write failing test (RED)

**File**: `tests/password-min-length.test.cjs` (CREATE)
**Action**: Write a test that imports the API validation logic and asserts:
- A password of `MIN_PASSWORD_LENGTH - 1` characters is rejected (status 400)
- A password of `MIN_PASSWORD_LENGTH` characters passes the length check
- The error message references the shared constant value
**Verification**: `bun run test:password` runs and the test FAILS (the API still uses hardcoded `6`).

```
[ ] 2.1 Create `tests/password-min-length.test.cjs` with test cases
[ ] 2.2 Add `"test:password"` script to `package.json`
[ ] 2.3 Run test and confirm it FAILS (RED)
```

## Task 3: Fix the API route (GREEN)

**File**: `src/app/api/reseller/register/route.ts` (EDIT)
**Action**:
- Add import: `import { MIN_PASSWORD_LENGTH } from '@/lib/constants'`
- Change line 28: `password.length < 6` → `password.length < MIN_PASSWORD_LENGTH`
- Change line 30 error message: `"al menos 6 caracteres"` → `` `al menos ${MIN_PASSWORD_LENGTH} caracteres` ``
**Verification**: `bun run test:password` now PASSES (GREEN).

```
[ ] 3.1 Import `MIN_PASSWORD_LENGTH` in `route.ts`
[ ] 3.2 Replace hardcoded `6` with `MIN_PASSWORD_LENGTH`
[ ] 3.3 Make error message dynamic with template literal
[ ] 3.4 Run test and confirm it PASSES (GREEN)
```

## Task 4: Update frontend to use shared constant (REFACTOR)

**File**: `src/components/reseller/ResellerRegister.tsx` (EDIT)
**Action**:
- Add import: `import { MIN_PASSWORD_LENGTH } from '@/lib/constants'`
- Change line 43: `form.password.length < 8` → `form.password.length < MIN_PASSWORD_LENGTH`
- Change line 44 toast: `"al menos 8 caracteres"` → `` `al menos ${MIN_PASSWORD_LENGTH} caracteres` ``
- Change line 160 placeholder: `"Mínimo 8 caracteres"` → `` `Mínimo ${MIN_PASSWORD_LENGTH} caracteres` ``
**Verification**: `bun run test:password` still PASSES. `bun run lint` passes.

```
[ ] 4.1 Import `MIN_PASSWORD_LENGTH` in `ResellerRegister.tsx`
[ ] 4.2 Replace hardcoded `8` in validation check
[ ] 4.3 Replace hardcoded `8` in toast message
[ ] 4.4 Replace hardcoded `8` in placeholder text
```

## Task 5: Update Zod schema to use shared constant (REFACTOR)

**File**: `src/lib/reseller/validators.ts` (EDIT)
**Action**:
- Add import: `import { MIN_PASSWORD_LENGTH } from '@/lib/constants'`
- Change line 16: `.min(8, '...')` → `.min(MIN_PASSWORD_LENGTH, `...${MIN_PASSWORD_LENGTH}...`)`
**Verification**: `bun run test:password` still PASSES. `bun run lint` passes.

```
[ ] 5.1 Import `MIN_PASSWORD_LENGTH` in `validators.ts`
[ ] 5.2 Replace hardcoded `8` in `.min()` call
```

## Task 6: Final verification

```
[ ] 6.1 Run `bun run test:password` — all tests pass
[ ] 6.2 Run `bun run test:catalog` — existing tests still pass
[ ] 6.3 Run `bun run lint` — no lint errors
[ ] 6.4 Run `bunx tsc --noEmit` — no type errors
```
