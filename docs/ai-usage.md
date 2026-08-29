# AI Usage Documentation

This document explicitly outlines how AI was intentionally utilized during the design and development of the Employee Salary Management System.

## Where AI Was Useful

1. **Boilerplate and Structure Generation:**
   - Rapid generation of initial Django project settings, DRF serializers, and URL configurations.
   - Quick setup of Vite + React + TypeScript scaffolding and Mantine UI layout patterns.

2. **Synthetic Data Seeding Logic:**
   - Drafting the `seed_employees` management command with weighted realistic country distributions, ISO currency mapping, and salary range boundaries per currency.

3. **Comprehensive Test Writing:**
   - Assisting in generating initial test cases covering CRUD boundaries, filter combinations, and multi-currency edge cases.

## Where Human Architectural Review Was Critical

1. **Multi-Currency Analytics Decision:**
   - *Problem:* Naive aggregations often calculate a global average salary across different currencies.
   - *Human Decision:* AI initial suggestions included converting or averaging salaries. Human intervention explicitly enforced **grouping all salary stats by currency** to ensure data integrity and prevent misleading financial metrics.

2. **Money Representation:**
   - *Human Decision:* Explicitly selected `DECIMAL(12,2)` over floating-point numbers or integer minor units (cents) after evaluating assessment scope (salary management vs payment execution).

3. **Pragmatic Scope Control:**
   - Rejected premature abstractions (microservices, complex event buses, authentication frameworks) suggested by standard AI patterns, adhering strictly to a pragmatic **modular monolith**.

## Bugs & Incorrect AI Suggestions Caught During Review

- **Pagination Bug:** DRF's standard `PageNumberPagination` did not respect custom `page_size` query params out-of-the-box. Caught by automated tests (`test_custom_page_size`) and resolved by creating `EmployeePagination`.
- **Decimal Validator Warning:** Pytest surfaced warnings regarding `MinValueValidator(0.01)` expecting a `Decimal` instance instead of float. Corrected to `MinValueValidator(Decimal("0.01"))`.
- **Unused Import Errors:** Strict TypeScript build (`tsc -b`) caught unused imports in layout and page components during production build verification.

## Verification Workflow

- No code was committed without running the backend test suite (`pytest`) and verifying frontend TypeScript compilation (`tsc --noEmit`).
- Empirical execution of seed scripts (seeding 10,000 records) verified real-world database performance and query responsiveness.
