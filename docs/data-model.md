# Data Model — Employee Salary Management System

## Employee Table

```sql
CREATE TABLE employees_employee (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id     VARCHAR(20) NOT NULL UNIQUE,
    first_name      VARCHAR(100) NOT NULL,
    last_name       VARCHAR(100) NOT NULL,
    email           VARCHAR(254) NOT NULL UNIQUE,
    department      VARCHAR(100) NOT NULL,
    job_title       VARCHAR(150) NOT NULL,
    country         VARCHAR(2) NOT NULL,        -- ISO 3166-1 alpha-2
    currency        VARCHAR(3) NOT NULL,         -- ISO 4217
    salary          DECIMAL(12,2) NOT NULL,      -- Annual gross, CHECK > 0
    salary_effective_date DATE NOT NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_employee_department ON employees_employee(department);
CREATE INDEX idx_employee_country ON employees_employee(country);
CREATE INDEX idx_employee_name ON employees_employee(last_name, first_name);
```

## Design Decisions

### Money Representation: DECIMAL(12,2)

**Decision:** Use `DECIMAL(12,2)` for salary storage.

**Rationale:**
- Avoids floating-point precision errors inherent in `FLOAT`/`DOUBLE`
- More readable than integer minor units (cents) — `75000.00` vs `7500000`
- `(12,2)` supports values up to 9,999,999,999.99 — sufficient for any real salary
- Both SQLite and PostgreSQL handle DECIMAL correctly
- We're storing/displaying salaries, not doing complex financial arithmetic where integer cents matter

**Alternative considered:** Integer minor units (store 7500000 for $75,000.00). Better for payment processing where sub-cent precision matters. Rejected because we're managing salary data, not processing payments.

### Currency + Amount (not single normalized value)

Each employee stores both `salary` (amount) and `currency` (ISO code). We never convert between currencies.

**Rationale:** Without reliable, timestamped exchange rates, converting ¥10,000,000 JPY to USD would be misleading and could change daily. The HR Manager sees actual salary in the employee's local currency.

### UUID Primary Key

**Rationale:**
- Non-sequential: doesn't leak information about record count or creation order
- Portable: no conflicts when merging data between environments
- Performance: negligible impact at 10K records (would matter at millions)

### Department as String (not FK)

**Rationale:**
- ~8-20 departments; a separate table adds joins without meaningful benefit
- Department names are stable and controlled via frontend dropdown
- If department metadata (head, budget, location) is needed later, normalization is a straightforward migration

### No Salary History Table

**Rationale:**
- MVP focuses on current salary management
- `salary_effective_date` records when the current salary was set
- Full history (previous salaries, change reasons, approvers) would add versioning complexity
- Can be added as a related table without schema changes to the Employee table

## Constraints

| Constraint | Implementation |
|-----------|---------------|
| Salary > 0 | Django model validator + DB CHECK constraint |
| Unique employee_id | DB UNIQUE constraint |
| Unique email | DB UNIQUE constraint |
| Valid country code | Django validator against ISO 3166-1 alpha-2 list |
| Valid currency code | Django validator against ISO 4217 list |
| Required fields | All fields are NOT NULL |
| Email format | Django EmailField validation |

## Enum-like Values

### Departments (enforced in application layer)
Engineering, Product, Design, Marketing, Sales, HR, Finance, Operations

### Countries (seed data uses these 10)
US, GB, DE, FR, IN, JP, AU, CA, BR, SG

### Currencies (mapped from country)
USD, GBP, EUR, EUR, INR, JPY, AUD, CAD, BRL, SGD
