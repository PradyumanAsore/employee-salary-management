"""
Tests for the Employee model — validation, constraints, and field behavior.
"""

from datetime import date
from decimal import Decimal

import pytest
from django.core.exceptions import ValidationError
from django.db import IntegrityError

from employees.models import Employee


@pytest.fixture
def sample_employee_data():
    """Base employee data dict for creating test instances."""
    return {
        "employee_id": "EMP-99001",
        "first_name": "Jane",
        "last_name": "Doe",
        "email": "jane.doe@test.com",
        "department": "Engineering",
        "job_title": "Software Engineer",
        "country": "US",
        "currency": "USD",
        "salary": Decimal("85000.00"),
        "salary_effective_date": date(2024, 1, 15),
    }


@pytest.mark.django_db
class TestEmployeeModel:

    def test_create_valid_employee(self, sample_employee_data):
        """A valid employee can be created and saved."""
        employee = Employee.objects.create(**sample_employee_data)
        assert employee.pk is not None
        assert employee.employee_id == "EMP-99001"
        assert employee.salary == Decimal("85000.00")
        assert employee.full_name == "Jane Doe"
        assert str(employee) == "EMP-99001 — Jane Doe"

    def test_employee_id_must_be_unique(self, sample_employee_data):
        """Duplicate employee_id raises IntegrityError."""
        Employee.objects.create(**sample_employee_data)
        with pytest.raises(IntegrityError):
            Employee.objects.create(
                **{**sample_employee_data, "email": "other@test.com"}
            )

    def test_email_must_be_unique(self, sample_employee_data):
        """Duplicate email raises IntegrityError."""
        Employee.objects.create(**sample_employee_data)
        with pytest.raises(IntegrityError):
            Employee.objects.create(
                **{**sample_employee_data, "employee_id": "EMP-99002"}
            )

    def test_salary_validator_rejects_zero(self, sample_employee_data):
        """Salary of 0 should fail validation."""
        employee = Employee(**{**sample_employee_data, "salary": Decimal("0.00")})
        with pytest.raises(ValidationError):
            employee.full_clean()

    def test_salary_validator_rejects_negative(self, sample_employee_data):
        """Negative salary should fail validation."""
        employee = Employee(**{**sample_employee_data, "salary": Decimal("-100.00")})
        with pytest.raises(ValidationError):
            employee.full_clean()

    def test_salary_accepts_large_value(self, sample_employee_data):
        """Large salary within DECIMAL(12,2) range should be accepted."""
        data = {**sample_employee_data, "salary": Decimal("9999999999.99")}
        employee = Employee.objects.create(**data)
        assert employee.salary == Decimal("9999999999.99")

    def test_created_at_auto_set(self, sample_employee_data):
        """created_at should be automatically set on creation."""
        employee = Employee.objects.create(**sample_employee_data)
        assert employee.created_at is not None

    def test_updated_at_changes_on_save(self, sample_employee_data):
        """updated_at should change when the employee is saved."""
        employee = Employee.objects.create(**sample_employee_data)
        original_updated = employee.updated_at
        employee.salary = Decimal("90000.00")
        employee.save()
        employee.refresh_from_db()
        assert employee.updated_at >= original_updated

    def test_default_ordering(self, sample_employee_data):
        """Employees should be ordered by last_name, first_name by default."""
        Employee.objects.create(
            **{
                **sample_employee_data,
                "employee_id": "EMP-99002",
                "email": "z@test.com",
                "first_name": "Zara",
                "last_name": "Adams",
            }
        )
        Employee.objects.create(
            **{
                **sample_employee_data,
                "employee_id": "EMP-99003",
                "email": "a@test.com",
                "first_name": "Alice",
                "last_name": "Adams",
            }
        )
        employees = list(Employee.objects.all())
        assert employees[0].first_name == "Alice"
        assert employees[1].first_name == "Zara"
