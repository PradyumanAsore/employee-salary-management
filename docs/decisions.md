# Design Decisions

## 1. Salary as DECIMAL(12,2) vs Integer Cents

**Decision:** `DECIMAL(12,2)`

**Why:** We're managing salary data (display/comparison), not processing financial transactions. Decimal is more readable in the database (`85000.00` vs `8500000`), avoids floating-point errors, and works consistently across SQLite and PostgreSQL.

**Trade-off:** Integer minor units would be better for a payment processing system where sub-cent arithmetic matters.

## 2. No Cross-Currency Aggregation

**Decision:** All salary analytics are grouped by currency. There is no "global average salary" calculation.

**Why:** Averaging $80,000 USD and ₹1,500,000 INR produces a meaningless number. Without reliable, timestamped exchange rates, any cross-currency comparison is misleading.

**Trade-off:** The dashboard can't show a single organization-wide "average salary" number. This is a feature, not a limitation — it prevents the HR manager from drawing incorrect conclusions.

## 3. UUID Primary Keys

**Decision:** UUID v4 for Employee primary keys.

**Why:** Non-enumerable (security), portable across environments, no merge conflicts.

**Trade-off:** Slightly larger index size and less cache-friendly than integer PKs. Negligible at 10K records.

## 4. Department as String (Denormalized)

**Decision:** Store department as a `VARCHAR(100)` with validation in the serializer, not as a foreign key to a separate Department table.

**Why:** ~8 departments, rarely changing. A FK relationship adds joins without benefit and requires managing a separate entity lifecycle.

**Trade-off:** No department metadata (manager, budget, location). If needed, can be normalized later without breaking the Employee schema.

## 5. No Authentication

**Decision:** Deliberately excluded from scope.

**Why:** Assessment focuses on salary management domain logic, not auth infrastructure. Adding auth (Django's auth, JWT tokens, session management, permission checks) would add significant complexity without testing the target skills.

**Trade-off:** The system is not production-ready for unrestricted deployment. This is documented as a known gap.

## 6. SPA Instead of SSR

**Decision:** React SPA with Vite, not Next.js SSR.

**Why:** This is an internal HR tool with no SEO requirement. SPA provides better UX for data-heavy interactions (filtering, pagination without full-page reloads) and simpler architecture.

## 7. Mantine Component Library

**Decision:** Mantine v7 for UI components.

**Why:** Well-typed, comprehensive (tables, forms, charts, notifications), moderate bundle size, excellent DX. Includes form management and chart components we need.

**Alternatives considered:** Material UI (heavier, more opinionated), shadcn/ui (requires more assembly), Ant Design (larger bundle).

## 8. Service Layer in Backend

**Decision:** `services.py` for analytics business logic, keeping views thin.

**Why:** Analytics calculations (median, currency-grouped aggregations) are business logic that shouldn't live in HTTP views. A service layer makes this logic testable independently.

**Not over-abstracted:** One services file, not a service-per-entity pattern or a repository pattern. The domain complexity doesn't warrant it.

## 9. Hard Delete vs Soft Delete

**Decision:** Hard delete for MVP.

**Why:** Soft delete requires filtering inactive records in every query, handling "deleted" state in the UI, and answering "what does it mean to edit a deleted employee?" — complexity that isn't justified for the assessment.

**Trade-off:** No undo for deletions. Production would likely want soft delete with an audit trail.

## 10. SQLite for Development

**Decision:** SQLite locally, PostgreSQL-compatible schema.

**Why:** Zero setup, works on all platforms, Django ORM abstracts the differences. Docker config uses PostgreSQL for production-like testing.

**Constraints:** No native median aggregate (computed in Python), no full-text search (using Django ORM's `icontains` via SearchFilter).
