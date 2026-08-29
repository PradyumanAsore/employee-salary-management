"""
Tests for the Employee REST API — CRUD, filtering, search, pagination.
"""

from datetime import date
from decimal import Decimal

import pytest
from django.test import TestCase
from rest_framework.test import APIClient

from employees.models import Employee


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def sample_employee():
    """Create and return a single employee."""
    return Employee.objects.create(
        employee_id="EMP-99001",
        first_name="Jane",
        last_name="Doe",
        email="jane.doe@test.com",
        department="Engineering",
        job_title="Software Engineer",
        country="US",
        currency="USD",
        salary=Decimal("85000.00"),
        salary_effective_date=date(2024, 1, 15),
    )


@pytest.fixture
def multiple_employees():
    """Create a set of employees for filter/search/pagination tests."""
    employees = [
        Employee(
            employee_id="EMP-00001",
            first_name="Alice",
            last_name="Smith",
            email="alice.smith@test.com",
            department="Engineering",
            job_title="Senior Software Engineer",
            country="US",
            currency="USD",
            salary=Decimal("120000.00"),
            salary_effective_date=date(2024, 1, 1),
        ),
        Employee(
            employee_id="EMP-00002",
            first_name="Bob",
            last_name="Jones",
            email="bob.jones@test.com",
            department="Marketing",
            job_title="Marketing Manager",
            country="GB",
            currency="GBP",
            salary=Decimal("65000.00"),
            salary_effective_date=date(2024, 2, 1),
        ),
        Employee(
            employee_id="EMP-00003",
            first_name="Charlie",
            last_name="Kumar",
            email="charlie.kumar@test.com",
            department="Engineering",
            job_title="Staff Engineer",
            country="IN",
            currency="INR",
            salary=Decimal("2500000.00"),
            salary_effective_date=date(2024, 3, 1),
        ),
        Employee(
            employee_id="EMP-00004",
            first_name="Diana",
            last_name="Mueller",
            email="diana.mueller@test.com",
            department="Design",
            job_title="UX Designer",
            country="DE",
            currency="EUR",
            salary=Decimal("72000.00"),
            salary_effective_date=date(2024, 4, 1),
        ),
        Employee(
            employee_id="EMP-00005",
            first_name="Eve",
            last_name="Tanaka",
            email="eve.tanaka@test.com",
            department="Finance",
            job_title="Financial Analyst",
            country="JP",
            currency="JPY",
            salary=Decimal("8000000.00"),
            salary_effective_date=date(2024, 5, 1),
        ),
    ]
    Employee.objects.bulk_create(employees)
    return employees


# === CRUD Tests ===


@pytest.mark.django_db
class TestEmployeeCreate:

    def test_create_valid_employee(self, api_client):
        """POST /api/employees/ with valid data returns 201."""
        data = {
            "employee_id": "EMP-10001",
            "first_name": "Test",
            "last_name": "User",
            "email": "test.user@acme.com",
            "department": "Engineering",
            "job_title": "Software Engineer",
            "country": "US",
            "currency": "USD",
            "salary": "75000.00",
            "salary_effective_date": "2024-06-01",
        }
        response = api_client.post("/api/employees/", data, format="json")
        assert response.status_code == 201
        assert response.data["employee_id"] == "EMP-10001"
        assert response.data["full_name"] == "Test User"
        assert Employee.objects.count() == 1

    def test_create_missing_required_field(self, api_client):
        """POST /api/employees/ without required fields returns 400."""
        response = api_client.post("/api/employees/", {}, format="json")
        assert response.status_code == 400
        assert "employee_id" in response.data
        assert "first_name" in response.data

    def test_create_invalid_department(self, api_client):
        """POST with invalid department returns 400."""
        data = {
            "employee_id": "EMP-10001",
            "first_name": "Test",
            "last_name": "User",
            "email": "test@acme.com",
            "department": "Nonexistent",
            "job_title": "Engineer",
            "country": "US",
            "currency": "USD",
            "salary": "75000.00",
            "salary_effective_date": "2024-06-01",
        }
        response = api_client.post("/api/employees/", data, format="json")
        assert response.status_code == 400
        assert "department" in response.data

    def test_create_invalid_country(self, api_client):
        """POST with invalid country code returns 400."""
        data = {
            "employee_id": "EMP-10001",
            "first_name": "Test",
            "last_name": "User",
            "email": "test@acme.com",
            "department": "Engineering",
            "job_title": "Engineer",
            "country": "XX",
            "currency": "USD",
            "salary": "75000.00",
            "salary_effective_date": "2024-06-01",
        }
        response = api_client.post("/api/employees/", data, format="json")
        assert response.status_code == 400
        assert "country" in response.data

    def test_create_negative_salary(self, api_client):
        """POST with negative salary returns 400."""
        data = {
            "employee_id": "EMP-10001",
            "first_name": "Test",
            "last_name": "User",
            "email": "test@acme.com",
            "department": "Engineering",
            "job_title": "Engineer",
            "country": "US",
            "currency": "USD",
            "salary": "-5000.00",
            "salary_effective_date": "2024-06-01",
        }
        response = api_client.post("/api/employees/", data, format="json")
        assert response.status_code == 400
        assert "salary" in response.data

    def test_create_duplicate_employee_id(self, api_client, sample_employee):
        """POST with existing employee_id returns 400."""
        data = {
            "employee_id": "EMP-99001",  # Already exists
            "first_name": "Other",
            "last_name": "Person",
            "email": "other@acme.com",
            "department": "Engineering",
            "job_title": "Engineer",
            "country": "US",
            "currency": "USD",
            "salary": "75000.00",
            "salary_effective_date": "2024-06-01",
        }
        response = api_client.post("/api/employees/", data, format="json")
        assert response.status_code == 400
        assert "employee_id" in response.data

    def test_create_duplicate_email(self, api_client, sample_employee):
        """POST with existing email returns 400."""
        data = {
            "employee_id": "EMP-10001",
            "first_name": "Other",
            "last_name": "Person",
            "email": "jane.doe@test.com",  # Already exists
            "department": "Engineering",
            "job_title": "Engineer",
            "country": "US",
            "currency": "USD",
            "salary": "75000.00",
            "salary_effective_date": "2024-06-01",
        }
        response = api_client.post("/api/employees/", data, format="json")
        assert response.status_code == 400
        assert "email" in response.data


@pytest.mark.django_db
class TestEmployeeRetrieve:

    def test_list_employees(self, api_client, multiple_employees):
        """GET /api/employees/ returns paginated results."""
        response = api_client.get("/api/employees/")
        assert response.status_code == 200
        assert response.data["count"] == 5
        assert len(response.data["results"]) == 5

    def test_get_single_employee(self, api_client, sample_employee):
        """GET /api/employees/{id}/ returns employee details."""
        response = api_client.get(f"/api/employees/{sample_employee.pk}/")
        assert response.status_code == 200
        assert response.data["employee_id"] == "EMP-99001"
        assert response.data["salary"] == "85000.00"

    def test_get_nonexistent_employee(self, api_client):
        """GET /api/employees/{id}/ for missing ID returns 404."""
        import uuid

        response = api_client.get(f"/api/employees/{uuid.uuid4()}/")
        assert response.status_code == 404


@pytest.mark.django_db
class TestEmployeeUpdate:

    def test_patch_salary(self, api_client, sample_employee):
        """PATCH /api/employees/{id}/ can update salary."""
        response = api_client.patch(
            f"/api/employees/{sample_employee.pk}/",
            {"salary": "95000.00"},
            format="json",
        )
        assert response.status_code == 200
        assert response.data["salary"] == "95000.00"

    def test_patch_invalid_salary(self, api_client, sample_employee):
        """PATCH with invalid salary returns 400."""
        response = api_client.patch(
            f"/api/employees/{sample_employee.pk}/",
            {"salary": "0"},
            format="json",
        )
        assert response.status_code == 400


@pytest.mark.django_db
class TestEmployeeDelete:

    def test_delete_employee(self, api_client, sample_employee):
        """DELETE /api/employees/{id}/ removes the employee."""
        response = api_client.delete(f"/api/employees/{sample_employee.pk}/")
        assert response.status_code == 204
        assert Employee.objects.count() == 0

    def test_delete_nonexistent_employee(self, api_client):
        """DELETE /api/employees/{id}/ for missing ID returns 404."""
        import uuid

        response = api_client.delete(f"/api/employees/{uuid.uuid4()}/")
        assert response.status_code == 404


# === Filter & Search Tests ===


@pytest.mark.django_db
class TestEmployeeFiltering:

    def test_filter_by_department(self, api_client, multiple_employees):
        """Filter by department returns only matching employees."""
        response = api_client.get("/api/employees/?department=Engineering")
        assert response.status_code == 200
        assert response.data["count"] == 2
        for emp in response.data["results"]:
            assert emp["department"] == "Engineering"

    def test_filter_by_country(self, api_client, multiple_employees):
        """Filter by country returns only matching employees."""
        response = api_client.get("/api/employees/?country=US")
        assert response.status_code == 200
        assert response.data["count"] == 1
        assert response.data["results"][0]["country"] == "US"

    def test_filter_by_currency(self, api_client, multiple_employees):
        """Filter by currency returns only matching employees."""
        response = api_client.get("/api/employees/?currency=EUR")
        assert response.status_code == 200
        assert response.data["count"] == 1

    def test_filter_by_salary_range(self, api_client, multiple_employees):
        """Filter by salary min/max returns employees in range."""
        response = api_client.get(
            "/api/employees/?salary_min=60000&salary_max=130000"
        )
        assert response.status_code == 200
        # Should match: Alice (120K USD), Bob (65K GBP), Diana (72K EUR)
        assert response.data["count"] == 3

    def test_search_by_name(self, api_client, multiple_employees):
        """Search finds employees by first or last name."""
        response = api_client.get("/api/employees/?search=Alice")
        assert response.status_code == 200
        assert response.data["count"] == 1
        assert response.data["results"][0]["first_name"] == "Alice"

    def test_search_by_employee_id(self, api_client, multiple_employees):
        """Search finds employees by employee_id."""
        response = api_client.get("/api/employees/?search=EMP-00003")
        assert response.status_code == 200
        assert response.data["count"] == 1
        assert response.data["results"][0]["employee_id"] == "EMP-00003"

    def test_search_by_email(self, api_client, multiple_employees):
        """Search finds employees by email."""
        response = api_client.get("/api/employees/?search=diana.mueller")
        assert response.status_code == 200
        assert response.data["count"] == 1

    def test_empty_search_returns_all(self, api_client, multiple_employees):
        """Empty search string returns all employees."""
        response = api_client.get("/api/employees/?search=")
        assert response.status_code == 200
        assert response.data["count"] == 5

    def test_no_results_search(self, api_client, multiple_employees):
        """Search for nonexistent name returns empty results."""
        response = api_client.get("/api/employees/?search=zzzznotfound")
        assert response.status_code == 200
        assert response.data["count"] == 0


# === Pagination & Ordering Tests ===


@pytest.mark.django_db
class TestEmployeePagination:

    def test_default_pagination(self, api_client, multiple_employees):
        """Default pagination returns results with count and next/previous."""
        response = api_client.get("/api/employees/")
        assert response.status_code == 200
        assert "count" in response.data
        assert "results" in response.data
        assert "next" in response.data
        assert "previous" in response.data

    def test_custom_page_size(self, api_client, multiple_employees):
        """Custom page_size limits results per page."""
        response = api_client.get("/api/employees/?page_size=2")
        assert response.status_code == 200
        assert len(response.data["results"]) == 2
        assert response.data["count"] == 5
        assert response.data["next"] is not None

    def test_ordering_by_salary_desc(self, api_client, multiple_employees):
        """Ordering by -salary returns highest salary first."""
        response = api_client.get("/api/employees/?ordering=-salary")
        assert response.status_code == 200
        results = response.data["results"]
        salaries = [Decimal(r["salary"]) for r in results]
        assert salaries == sorted(salaries, reverse=True)

    def test_ordering_by_last_name(self, api_client, multiple_employees):
        """Ordering by last_name returns alphabetically sorted results."""
        response = api_client.get("/api/employees/?ordering=last_name")
        assert response.status_code == 200
        results = response.data["results"]
        names = [r["last_name"] for r in results]
        assert names == sorted(names)
