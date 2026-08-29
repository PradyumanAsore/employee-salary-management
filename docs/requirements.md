# Requirements — Employee Salary Management System

## Goal

Replace ACME's Excel-based salary tracking with a web-based system that allows the HR Manager to manage, search, filter, and analyze salary information for ~10,000 employees across multiple countries.

## Primary User

**HR Manager** — needs to quickly find employees, understand compensation patterns, and maintain accurate salary records.

## Core User Journeys

1. **View employees** — Browse paginated employee list with key info (name, department, country, salary)
2. **Search employees** — Find employees by name, email, or employee ID
3. **Filter employees** — Narrow results by department, country, currency, salary range
4. **View employee details** — See full salary and employment information for one employee
5. **Add employee** — Create new employee record with validated salary data
6. **Edit employee** — Update salary, department, job title, or other fields
7. **Delete employee** — Remove an employee record
8. **Understand salary distribution** — View salary statistics grouped by currency to avoid misleading cross-currency comparisons
9. **Compare across dimensions** — See salary breakdowns by department and country (within same currency)

## Scope

- Employee CRUD operations with validation
- Search (name, email, employee ID) and filtering (department, country, currency, salary range)
- Paginated, sortable employee list
- Dashboard with salary analytics grouped by currency
- Department and country salary breakdowns
- Seed command for 10,000 deterministic synthetic employees
- Responsive, accessible UI with proper loading/error/empty states
- Backend API tests and focused frontend tests
- Docker deployment configuration
- Complete documentation

## Out of Scope

| Feature | Reason |
|---------|--------|
| Authentication/SSO | Significant complexity; not required for assessment. Documented as production gap. |
| Payroll processing | Different domain — we manage salary data, not process payments |
| Tax calculation | Country-specific complexity outside salary management |
| Benefits administration | Separate system concern |
| Currency conversion | No reliable FX source; would produce misleading comparisons |
| Salary history | MVP tracks current salary only; `salary_effective_date` records when it was set |
| Approval workflows | Organization-specific process, not core data management |
| Employee self-service | Different user persona |
| File import/export | Nice-to-have, not core to the assessment |

## Assumptions

- **Salary frequency:** All salaries are annual gross compensation
- **Currency:** Stored per-employee using ISO 4217 codes; no cross-currency conversion
- **Country:** ISO 3166-1 alpha-2 codes; employees belong to one country
- **Departments:** Fixed set of ~8 departments (Engineering, Product, Design, Marketing, Sales, HR, Finance, Operations)
- **Employee ID:** Format `EMP-XXXXX`, unique, can be manually entered or auto-generated
- **Email:** Unique per employee; standard format validation
- **Salary representation:** DECIMAL(12,2) — supports values up to ~10 billion with 2 decimal places
- **Editing:** Any field can be edited; no approval workflow
- **Deletion:** Hard delete (no soft-delete/archival in MVP)

## Success Criteria

1. HR Manager can find any employee within seconds using search or filters
2. Employee list handles 10,000 records via pagination without performance issues
3. CRUD operations work reliably with clear validation feedback
4. Dashboard provides meaningful salary insights without misleading cross-currency math
5. All core functionality is covered by automated tests
6. Application can be set up and run by another engineer following the README
7. Code is clean, maintainable, and demonstrates senior-level engineering judgment
