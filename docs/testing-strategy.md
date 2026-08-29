# Testing Strategy

## Philosophy

Tests cover **business-critical behavior**, not implementation details. Each test should answer: "if this test fails, what real-world problem does it catch?"

## Backend Testing (pytest + Django)

### Test Organization

```
backend/employees/tests/
├── test_models.py      — Model validation, constraints, field behavior
├── test_api.py         — CRUD operations, filtering, search, pagination
├── test_analytics.py   — Salary analytics, multi-currency correctness
```

### What We Test

| Category | Why It Matters |
|----------|----------------|
| **Employee CRUD** | Core functionality — must work correctly |
| **Unique constraints** | Duplicate employee IDs or emails corrupt data |
| **Salary validation** | Negative or zero salaries are data integrity bugs |
| **Search and filtering** | HR manager's primary workflow for finding employees |
| **Pagination** | Without it, 10K records crash the browser |
| **Multi-currency analytics** | Mixing currencies in aggregations produces misleading data |
| **Median calculation** | Edge cases (empty, single, even/odd count) |

### What We Don't Test

- Django ORM internals
- DRF serialization framework behavior
- Standard HTTP method routing
- Database driver behavior

### Test Characteristics

- **Fast:** Full suite runs in ~3 seconds (uses SQLite in-memory)
- **Deterministic:** No random data, no time-dependent assertions
- **Isolated:** Each test uses fresh database state via pytest fixtures
- **Readable:** Test names describe the business behavior being verified

## Frontend Testing

Frontend tests focus on **user-facing behavior** rather than component rendering details.

### Key Areas

- Form validation (are errors shown correctly?)
- API error handling (does the UI show meaningful feedback?)
- Currency formatting (are salaries displayed correctly?)

## Running Tests

```bash
# Backend
cd backend
../venv/Scripts/python.exe -m pytest --tb=short -q

# Frontend
cd frontend
npm run test
```

## Coverage Approach

We don't target a coverage percentage. Instead, we ensure every **user journey** has at least one happy-path and one error-path test. The goal is high-value coverage, not high-percentage coverage.
