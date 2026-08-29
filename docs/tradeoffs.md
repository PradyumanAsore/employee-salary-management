# System Trade-offs

This document outlines key technical and product trade-offs made during the development of the Employee Salary Management System.

## Architectural Trade-offs

| Decision | Trade-off | Mitigating Factor / Future Path |
|----------|-----------|----------------------------------|
| **Monolith over Microservices** | Limits independent scaling of analytics vs CRUD operations. | At 10,000 employees, traffic is modest. Single Django app is simple to deploy, maintain, and reason about. |
| **No Authentication Layer** | Open access to API endpoints in MVP. | Documented as an explicit assessment scope exclusion. Production deployment requires adding OAuth2 / OIDC / Session Auth middleware. |
| **SQLite for Local Dev** | Missing PostgreSQL-native features (e.g. `percentile_cont` median function). | Median is calculated cleanly in the service layer in Python. PostgreSQL compatibility maintained in model schema & Docker config. |

## Data Model Trade-offs

| Decision | Trade-off | Mitigating Factor / Future Path |
|----------|-----------|----------------------------------|
| **Denormalized Departments** | No separate Department entity for manager names or budget metadata. | Department names are stable; validated against predefined list in API layer. Can be normalized if org structure expands. |
| **Current Salary Only (No History Table)** | Cannot track historical salary increases over time. | `salary_effective_date` records when current salary was set. Historical tracking can be added as a audit/history table without breaking existing schema. |
| **Hard Deletion** | No recovery mechanism for deleted employee records. | Simpler CRUD state management for MVP. Production systems would implement soft-deletion (`is_active = False`) with audit logs. |

## Product & Analytics Trade-offs

| Decision | Trade-off | Mitigating Factor / Future Path |
|----------|-----------|----------------------------------|
| **No Cross-Currency Normalization** | Cannot view a single organization-wide average salary. | Prevents mathematically invalid/misleading averages (e.g., USD + JPY). Summary dashboard provides explicit side-by-side currency cards. |
| **No CSV / Excel Export** | HR managers must view data in the web UI. | Web table provides robust filtering, sorting, and search. Export endpoints can be added as a minor feature enhancement. |
