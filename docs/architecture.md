# Architecture — Employee Salary Management System

## Overview

A **modular monolith** consisting of a Django/DRF backend API and a React (Vite + TypeScript) single-page application.

```
┌─────────────────────────────────────────────────┐
│                   Frontend                       │
│          React + TypeScript + Mantine            │
│  ┌──────────┐ ┌──────────┐ ┌────────────────┐  │
│  │Dashboard │ │ Employee │ │  Employee      │  │
│  │  Page    │ │  List    │ │  Detail/Edit   │  │
│  └────┬─────┘ └────┬─────┘ └───────┬────────┘  │
│       └─────────────┼───────────────┘            │
│                     │ HTTP/JSON                   │
└─────────────────────┼───────────────────────────┘
                      │
┌─────────────────────┼───────────────────────────┐
│                 Backend API                      │
│            Django + DRF + SQLite                 │
│  ┌──────────────────┼──────────────────────┐    │
│  │              API Layer                   │    │
│  │    Views · Serializers · Filters         │    │
│  └──────────────────┼──────────────────────┘    │
│  ┌──────────────────┼──────────────────────┐    │
│  │           Service Layer                  │    │
│  │    Analytics · Validation · Queries      │    │
│  └──────────────────┼──────────────────────┘    │
│  ┌──────────────────┼──────────────────────┐    │
│  │           Data Layer                     │    │
│  │    Models · Managers · Migrations        │    │
│  └──────────────────┼──────────────────────┘    │
│                     │                            │
│              ┌──────┴──────┐                    │
│              │   SQLite    │                    │
│              │ (PostgreSQL │                    │
│              │  in prod)   │                    │
│              └─────────────┘                    │
└─────────────────────────────────────────────────┘
```

## Component Responsibilities

### Backend (`backend/`)

| Layer | Files | Responsibility |
|-------|-------|---------------|
| **Config** | `config/settings.py`, `config/urls.py` | Django project settings, URL routing, middleware |
| **API** | `employees/views.py`, `employees/serializers.py`, `employees/filters.py` | HTTP request/response handling, serialization, filtering |
| **Service** | `employees/services.py` | Business logic: analytics calculations, complex validation |
| **Data** | `employees/models.py` | ORM model definition, constraints, indexes |
| **Seed** | `employees/management/commands/seed_employees.py` | Deterministic test data generation |
| **Tests** | `employees/tests/` | Organized by concern: `test_models.py`, `test_api.py`, `test_analytics.py`, `test_seed.py` |

### Frontend (`frontend/`)

| Layer | Directory | Responsibility |
|-------|-----------|---------------|
| **Pages** | `src/pages/` | Route-level components: Dashboard, EmployeeList, EmployeeDetail, EmployeeCreate |
| **Components** | `src/components/` | Reusable UI: EmployeeTable, EmployeeForm, SalaryStats, ErrorBoundary |
| **Services** | `src/services/` | API client functions (fetch wrappers) |
| **Types** | `src/types/` | TypeScript interfaces for Employee, API responses |
| **Hooks** | `src/hooks/` | Custom hooks for data fetching, debounced search |

## Key Design Decisions

### Why Modular Monolith?
- 10K employees is well within a single-server workload
- Simpler deployment, debugging, and development
- No inter-service communication complexity
- Can be decomposed later if needed (unlikely at this scale)

### Why Service Layer?
- Keeps views thin — they handle HTTP concerns only
- Business logic (analytics aggregations, complex validation) lives in testable, reusable functions
- Not over-abstracted: one `services.py` file, not a service-per-entity pattern

### Why SQLite for Development?
- Zero configuration, works everywhere
- Django ORM abstracts differences with PostgreSQL
- Schema is designed to be PostgreSQL-compatible (DECIMAL types, UUID fields)
- Docker config uses PostgreSQL for production-like environment

### Why SPA (not SSR)?
- This is an internal HR tool — no SEO requirement
- SPA gives better UX for data-heavy interactions (filtering, pagination without full-page reloads)
- Simpler architecture: clear API boundary between frontend and backend

## Data Flow

```
User action → React component → API service → Django view
    → Serializer (validation) → Service (business logic) → Model (DB)
    → Response serialization → JSON → React state update → UI render
```

## Database Indexes

| Column(s) | Type | Rationale |
|-----------|------|-----------|
| `employee_id` | UNIQUE B-tree | Lookups by HR-assigned ID |
| `email` | UNIQUE B-tree | Uniqueness enforcement + lookup |
| `department` | B-tree | Filter queries |
| `country` | B-tree | Filter queries |
| `last_name, first_name` | Composite B-tree | Name-based sorting and search |

## API Pagination

- Default page size: 25
- Maximum page size: 100
- Uses DRF's `PageNumberPagination`
- Response includes `count`, `next`, `previous` URLs

## Security Posture (Assessment Context)

- **No authentication** — deliberately excluded; documented as production gap
- Input validation via DRF serializers + Django model constraints
- ORM-only queries (no raw SQL)
- CORS configured for development (localhost origins)
- No secrets in codebase — environment variables for sensitive config
- Django's CSRF/XSS protections active
