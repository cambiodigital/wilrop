# AGENTS.md - GGA Review Rules

## Context
- Project uses Next.js + TypeScript + Prisma.
- Prioritize safe, incremental changes and preserve existing behavior.

## Review Priorities
1. Functional regressions and runtime errors.
2. Security issues (auth, input validation, secret leaks).
3. Data integrity risks (Prisma queries, schema mismatches).
4. Performance pitfalls in React rendering and API routes.
5. Missing tests for critical paths.

## Code Standards
- Keep changes minimal and focused on the task.
- Follow existing project conventions and naming.
- Avoid broad refactors unless explicitly requested.
- Do not introduce blocking git hooks.
- Prefer clear error handling in API routes and async flows.

## Output Expectations
- Provide concrete findings with file references.
- Suggest actionable fixes, not generic advice.
- If no issues are found, state residual risks and test gaps.
