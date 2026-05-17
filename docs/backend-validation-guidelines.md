# Backend Validation Guidelines

This document describes where validation and business rules should live in this backend.

## Core Rule

Keep the request flow consistent:

`route -> middleware -> controller -> service -> repository`

- Controllers handle HTTP concerns only.
- Services orchestrate use cases and business flow.
- Repositories are the only layer that talks to Prisma.

## When To Use Middleware

Use middleware for request-level validation and normalization.

Typical responsibilities:

- Check required fields are present.
- Check primitive types such as string, number, and boolean.
- Check basic format such as `HH:mm`, email, enum, or UUID.
- Reject malformed request payloads before they reach the service layer.

Do not put database-backed business rules in middleware.

Examples:

- `policyName` must be a non-empty string.
- `baseHours` must be a number.
- `coreTimeStart` and `coreTimeEnd` must match a supported time format.

## When To Use A Validator

Use a validator for pure business rules that do not need I/O.

A validator should:

- depend only on input data,
- be deterministic,
- avoid Prisma or external calls,
- be easy to unit test in isolation.

Examples:

- `baseHours > 0`
- `coreTimeStart < coreTimeEnd`
- cross-field rules that can be decided from the DTO alone

If a rule can be evaluated only from the input, prefer a validator over inline service code.

## When To Keep Logic Inline In A Service

Keep logic inline in the service when it is small, local to one use case, and needs data from the database.

This is appropriate when the service needs to:

- query the repository,
- make one or two decisions,
- continue the use case flow,
- map persistence errors to application errors.

Examples:

- Check whether `policyName` already exists before creating a policy.
- Check whether a record exists before updating or deleting it.

If the logic is short and only used once, inline service logic is usually the simplest option.

## When To Extract A Rule Service

Extract a dedicated rule service when a business rule becomes complex, reused, or database-backed enough that inline service code becomes noisy.

A rule service is a good fit when:

- the rule needs repository access,
- the rule spans multiple queries or data sources,
- the same rule is reused across multiple use cases,
- the service starts accumulating many branches and checks.

Examples:

- Ensure there is only one default policy.
- Determine whether a policy can be deactivated based on current assignments.
- Resolve which policy is effective for a user or team.

Use names that reflect the domain decision, such as:

- `PolicyRuleService`
- `PolicyEligibilityChecker`
- `PolicyConflictChecker`

## Practical Decision Guide

Use this quick guide when placing logic:

- Request shape, types, and basic format: middleware
- Pure input-only business rules: validator
- Small DB-backed rule used in one place: inline service
- Complex or reused DB-backed rule: rule service

## Policy Example

For the current `policy` flow in this repository:

- Middleware validates request shape and supported time format.
- `PolicyValidator` handles pure rules such as positive base hours and valid time range.
- `PolicyService` orchestrates create/list flows and checks duplicate policy names through the repository.
- `PolicyRepository` performs Prisma queries and maps persistence data.
