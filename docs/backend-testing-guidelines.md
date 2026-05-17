# Backend Testing Guidelines

This document describes where tests should live and what each backend layer should prove.

## Core Rule

Prefer the narrowest test that can prove the changed behavior.

- Pure logic: unit test
- Service orchestration: unit test with mocked dependencies
- Prisma queries: integration test
- HTTP contract: route integration test

Do not start with broad end-to-end coverage when a smaller test can prove the change.

## Test Location

Use the existing project structure under `src/test/`.

```text
src/test/
  unit/
    middlewares/
    services/
    validators/
  integration/
    repositories/
    routes/
```

If a new test does not clearly fit one of these folders, the production code is probably crossing layer boundaries.

## Middleware Tests

Test middleware with no repository or service mocks.

Focus on:

- missing required fields,
- invalid primitive types,
- invalid basic format,
- whether `next()` receives a `ValidationError` or no argument.

A middleware test should prove request-shape validation only. It should not prove business rules that belong to services or validators.

## Validator Tests

Use validator tests for pure business rules that depend only on input data.

Focus on:

- cross-field rules,
- numeric constraints,
- time-range comparisons,
- deterministic validation errors.

Validators should be fast and isolated. They should not touch Prisma, HTTP objects, or the DI container.

## Service Tests

Use unit tests for service methods and mock collaborators with `jest.fn()`.

Typical mocked dependencies:

- repositories,
- validators,
- rule services,
- external providers.

Focus on:

- orchestration order,
- repository calls with correct arguments,
- conflict and not-found behavior,
- mapping infrastructure errors to application errors,
- propagation of unexpected errors.

A service test should prove use-case flow, not Prisma query details.

## Repository Tests

Use integration tests for repositories because they own Prisma access.

Focus on:

- correct query behavior,
- selected fields,
- sorting and pagination,
- persistence of create and update operations,
- database-level constraints such as unique indexes.

If repository behavior is important, prove it against the test database instead of mocking Prisma internals.

## Route Tests

Use integration tests for routes when you need to prove HTTP contract.

Focus on:

- status codes,
- JSON response shape,
- middleware wiring,
- controller-to-service integration through Express,
- error handler behavior.

Route tests should be added when a behavior matters at the API boundary, not only inside the service.

## Practical Decision Guide

Use this quick guide when adding or changing behavior:

- Changed request validation: add middleware unit test
- Changed pure business rule: add validator unit test
- Changed service flow or DB-backed decision: add service unit test
- Changed Prisma query shape or persistence behavior: add repository integration test
- Changed public HTTP contract: add route integration test

## Policy Example

For the current `policy` slice:

- `validate-create-policy.middleware.ts`: middleware unit tests for required fields and time format
- `PolicyValidator`: validator unit tests for positive base hours and valid time ranges
- `PolicyService`: service unit tests for duplicate-name checks, orchestration, and error mapping
- `PolicyRepository`: integration tests for list/create queries and unique-name persistence behavior
- `policyRoutes`: route integration tests for `GET /api/policies` and `POST /api/policies`

## Test Writing Notes

- Keep each test scoped to one layer.
- Prefer explicit fixtures over large shared setup.
- Re-run the narrowest relevant Jest target after each behavior change.
- If a change is unit-testable and no unit test is added, document the reason clearly.
