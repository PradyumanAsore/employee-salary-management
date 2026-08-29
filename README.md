# Employee Salary Management System (SalaryHub)

A production-grade web application for HR Managers to manage, search, filter, and analyze salary information across 10,000+ global employees.

---

## Overview

SalaryHub replaces static Excel-based salary tracking with a scalable, web-based platform. Built with a **Python/Django REST Framework** backend and a **React/TypeScript/Mantine** frontend, it delivers fast search, paginated employee lists, salary editing, and multi-currency salary analytics.

---

## Key Features

- **Dashboard Analytics:** Currency-grouped salary statistics (average, median, min, max) by department and country.
- **Employee Search & Filtering:** Instant search by name, email, or employee ID; multi-criteria filtering by department, country, currency, and salary range.
- **Paginated Data Table:** Server-side pagination and column sorting designed for 10,000+ employee records.
- **Employee CRUD:** Create, read, update (salary, job title, department), and delete employee records with full validation feedback.
- **Multi-Currency Safety:** All financial statistics are grouped strictly by ISO currency codes to avoid misleading cross-currency comparisons.
- **Synthetic Seed Generator:** Deterministic seed command to populate 10,000 realistic employees across 10 countries and 8 departments.

---

## Tech Stack

- **Backend:** Python 3.13, Django 6.1, Django REST Framework 3.18, django-filter
- **Frontend:** React 19, TypeScript, Vite, Mantine UI v7, Recharts
- **Database:** SQLite (local dev), PostgreSQL ready
- **Testing:** pytest, pytest-django
- **Containerization:** Docker, Docker Compose

---

## Local Setup Instructions

### Prerequisites

- Python 3.11+
- Node.js v20+ & npm

### 1. Backend Setup

```bash
# Navigate to repository root
cd d:\Asccesment\Salary_Management_Assessment

# Create and activate virtual environment
python -m venv venv
.\venv\Scripts\activate  # On Windows PowerShell

# Install backend dependencies
pip install -r backend/requirements.txt

# Run migrations
cd backend
python manage.py migrate

# Seed database with 10,000 employees
python manage.py seed_employees

# Run Django development server
python manage.py runserver
```
Backend API will be running at: `http://localhost:8000/api/`

### 2. Frontend Setup

In a new terminal:

```bash
cd frontend

# Install frontend dependencies
npm install

# Start Vite dev server
npm run dev
```
Frontend application will be accessible at: `http://localhost:5173/`

---

## Running Tests

### Backend Tests

```bash
cd backend
..\venv\Scripts\python.exe -m pytest --tb=short
```

49 unit & integration tests covering models, CRUD API endpoints, pagination, filtering, and analytics calculations.

### Frontend Type Check & Build

```bash
cd frontend
npx tsc --noEmit
npm run build
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/employees/` | List employees (supports search, filtering, pagination) |
| `POST` | `/api/employees/` | Create new employee record |
| `GET` | `/api/employees/{id}/` | Retrieve detailed employee record |
| `PATCH` | `/api/employees/{id}/` | Partially update employee record |
| `DELETE` | `/api/employees/{id}/` | Delete employee record |
| `GET` | `/api/analytics/summary/` | Overall salary statistics by currency |
| `GET` | `/api/analytics/by-department/` | Department salary metrics by currency |
| `GET` | `/api/analytics/by-country/` | Country salary metrics by currency |

---

## Deployment via Docker

To run the complete production stack (Django + Gunicorn + PostgreSQL):

```bash
docker-compose up --build
```

---

## Assessment Documentation

Comprehensive architectural artifacts located in `docs/`:

- [Requirements](docs/requirements.md)
- [Architecture](docs/architecture.md)
- [Data Model](docs/data-model.md)
- [API Design](docs/api-design.md)
- [Design Decisions](docs/decisions.md)
- [Testing Strategy](docs/testing-strategy.md)
- [Performance](docs/performance.md)
- [AI Usage](docs/ai-usage.md)
- [Trade-offs](docs/tradeoffs.md)
