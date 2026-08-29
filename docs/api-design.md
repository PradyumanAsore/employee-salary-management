# API Design — Employee Salary Management System

## Base URL

```
http://localhost:8000/api/
```

## Endpoints

### Employee CRUD

#### `GET /api/employees/`

List employees with pagination, search, filtering, and sorting.

**Query Parameters:**

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `search` | string | Searches name, email, employee_id | `?search=john` |
| `department` | string | Exact match on department | `?department=Engineering` |
| `country` | string | Exact match on country code | `?country=US` |
| `currency` | string | Exact match on currency code | `?currency=USD` |
| `salary_min` | decimal | Minimum salary (inclusive) | `?salary_min=50000` |
| `salary_max` | decimal | Maximum salary (inclusive) | `?salary_max=100000` |
| `ordering` | string | Sort field (prefix `-` for desc) | `?ordering=-salary` |
| `page` | integer | Page number (1-indexed) | `?page=2` |
| `page_size` | integer | Results per page (default 25, max 100) | `?page_size=50` |

**Response:** `200 OK`
```json
{
  "count": 10000,
  "next": "http://localhost:8000/api/employees/?page=2",
  "previous": null,
  "results": [
    {
      "id": "a1b2c3d4-...",
      "employee_id": "EMP-00001",
      "first_name": "Jane",
      "last_name": "Smith",
      "email": "jane.smith@acme.com",
      "department": "Engineering",
      "job_title": "Senior Software Engineer",
      "country": "US",
      "currency": "USD",
      "salary": "125000.00",
      "salary_effective_date": "2024-01-15",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

#### `GET /api/employees/{id}/`

Get a single employee by UUID.

**Response:** `200 OK` — Single employee object  
**Error:** `404 Not Found`

#### `POST /api/employees/`

Create a new employee.

**Request Body:**
```json
{
  "employee_id": "EMP-10001",
  "first_name": "John",
  "last_name": "Doe",
  "email": "john.doe@acme.com",
  "department": "Engineering",
  "job_title": "Software Engineer",
  "country": "US",
  "currency": "USD",
  "salary": "95000.00",
  "salary_effective_date": "2024-03-01"
}
```

**Response:** `201 Created` — Created employee object  
**Error:** `400 Bad Request` — Validation errors

```json
{
  "employee_id": ["employee with this employee id already exists."],
  "salary": ["Ensure this value is greater than 0."]
}
```

#### `PATCH /api/employees/{id}/`

Partially update an employee.

**Request Body:** Any subset of employee fields  
**Response:** `200 OK` — Updated employee object  
**Error:** `400 Bad Request` or `404 Not Found`

#### `DELETE /api/employees/{id}/`

Delete an employee.

**Response:** `204 No Content`  
**Error:** `404 Not Found`

---

### Analytics

#### `GET /api/analytics/summary/`

Organization-wide salary statistics, grouped by currency.

**Response:** `200 OK`
```json
{
  "total_employees": 10000,
  "by_currency": [
    {
      "currency": "USD",
      "employee_count": 3500,
      "avg_salary": "92450.00",
      "median_salary": "88000.00",
      "min_salary": "35000.00",
      "max_salary": "250000.00"
    },
    {
      "currency": "INR",
      "employee_count": 2000,
      "avg_salary": "1850000.00",
      "median_salary": "1600000.00",
      "min_salary": "400000.00",
      "max_salary": "5000000.00"
    }
  ]
}
```

#### `GET /api/analytics/by-department/`

Salary statistics per department, grouped by currency.

**Response:** `200 OK`
```json
[
  {
    "department": "Engineering",
    "currency": "USD",
    "employee_count": 450,
    "avg_salary": "105000.00",
    "min_salary": "65000.00",
    "max_salary": "220000.00"
  }
]
```

#### `GET /api/analytics/by-country/`

Salary statistics per country (uses that country's currency).

**Response:** `200 OK`
```json
[
  {
    "country": "US",
    "currency": "USD",
    "employee_count": 3500,
    "avg_salary": "92450.00",
    "min_salary": "35000.00",
    "max_salary": "250000.00"
  }
]
```

## Error Response Format

All errors follow a consistent structure:

```json
{
  "field_name": ["Error message."],
  "non_field_errors": ["General error message."]
}
```

For 404 errors:
```json
{
  "detail": "Not found."
}
```

## Design Notes

- **Salary as string in JSON:** DRF serializes `DecimalField` as strings to avoid floating-point issues in JSON. Frontend parses to display.
- **No cross-currency aggregation:** Analytics endpoints group by currency. There is no "global average salary" endpoint because it would be meaningless without FX conversion.
- **Pagination required:** The `/api/employees/` endpoint always paginates. There is no way to fetch all 10K records in one request.
