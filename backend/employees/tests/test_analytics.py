"""
Tests for salary analytics — summary, by-department, and by-country endpoints.

Special focus on multi-currency correctness: verifying that analytics
never mix currencies in aggregations.
"""

from datetime import date
from decimal import Decimal

import pytest
from rest_framework.test import APIClient

from employees.models import Employee
from employees import services


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def analytics_employees():
    """
    Create a controlled set of employees for analytics testing.
    Uses two currencies to verify grouping behavior.
    """
    employees = [
        # USD employees in Engineering
        Employee(
            employee_id="EMP-A001",
            first_name="A",
            last_name="One",
            email="a1@test.com",
            department="Engineering",
            job_title="Engineer",
            country="US",
            currency="USD",
            salary=Decimal("100000.00"),
            salary_effective_date=date(2024, 1, 1),
        ),
        Employee(
            employee_id="EMP-A002",
            first_name="A",
            last_name="Two",
            email="a2@test.com",
            department="Engineering",
            job_title="Senior Engineer",
            country="US",
            currency="USD",
            salary=Decimal("150000.00"),
            salary_effective_date=date(2024, 1, 1),
        ),
        # INR employee in Engineering
        Employee(
            employee_id="EMP-A003",
            first_name="B",
            last_name="Three",
            email="b3@test.com",
            department="Engineering",
            job_title="Engineer",
            country="IN",
            currency="INR",
            salary=Decimal("2000000.00"),
            salary_effective_date=date(2024, 1, 1),
        ),
        # USD employee in Marketing
        Employee(
            employee_id="EMP-A004",
            first_name="C",
            last_name="Four",
            email="c4@test.com",
            department="Marketing",
            job_title="Marketing Manager",
            country="US",
            currency="USD",
            salary=Decimal("80000.00"),
            salary_effective_date=date(2024, 1, 1),
        ),
    ]
    Employee.objects.bulk_create(employees)
    return employees


@pytest.mark.django_db
class TestAnalyticsSummary:

    def test_summary_total_count(self, api_client, analytics_employees):
        """Summary returns correct total employee count."""
        response = api_client.get("/api/analytics/summary/")
        assert response.status_code == 200
        assert response.data["total_employees"] == 4

    def test_summary_groups_by_currency(self, api_client, analytics_employees):
        """Summary breaks down stats by currency, not mixing them."""
        response = api_client.get("/api/analytics/summary/")
        currencies = {c["currency"] for c in response.data["by_currency"]}
        assert currencies == {"USD", "INR"}

    def test_summary_usd_stats(self, api_client, analytics_employees):
        """USD stats are correct (3 employees: 100K, 150K, 80K)."""
        response = api_client.get("/api/analytics/summary/")
        usd = next(c for c in response.data["by_currency"] if c["currency"] == "USD")
        assert usd["employee_count"] == 3
        assert Decimal(usd["min_salary"]) == Decimal("80000.00")
        assert Decimal(usd["max_salary"]) == Decimal("150000.00")
        # Avg of 100K + 150K + 80K = 330K / 3 = 110K
        assert Decimal(usd["avg_salary"]) == Decimal("110000.00")
        # Median of [80K, 100K, 150K] = 100K
        assert Decimal(usd["median_salary"]) == Decimal("100000.00")

    def test_summary_inr_stats(self, api_client, analytics_employees):
        """INR stats are correct (1 employee: 2M INR)."""
        response = api_client.get("/api/analytics/summary/")
        inr = next(c for c in response.data["by_currency"] if c["currency"] == "INR")
        assert inr["employee_count"] == 1
        assert Decimal(inr["avg_salary"]) == Decimal("2000000.00")

    def test_summary_empty_database(self, api_client):
        """Summary with no employees returns zero total."""
        response = api_client.get("/api/analytics/summary/")
        assert response.status_code == 200
        assert response.data["total_employees"] == 0
        assert response.data["by_currency"] == []


@pytest.mark.django_db
class TestAnalyticsByDepartment:

    def test_by_department_groups_correctly(self, api_client, analytics_employees):
        """Department stats are grouped by (department, currency)."""
        response = api_client.get("/api/analytics/by-department/")
        assert response.status_code == 200

        # Should have 3 groups:
        # Engineering-USD (2), Engineering-INR (1), Marketing-USD (1)
        eng_usd = [
            r
            for r in response.data
            if r["department"] == "Engineering" and r["currency"] == "USD"
        ]
        assert len(eng_usd) == 1
        assert eng_usd[0]["employee_count"] == 2

    def test_by_department_correct_stats(self, api_client, analytics_employees):
        """Engineering-USD avg should be (100K + 150K) / 2 = 125K."""
        response = api_client.get("/api/analytics/by-department/")
        eng_usd = next(
            r
            for r in response.data
            if r["department"] == "Engineering" and r["currency"] == "USD"
        )
        assert Decimal(str(eng_usd["avg_salary"])) == Decimal("125000.00")


@pytest.mark.django_db
class TestAnalyticsByCountry:

    def test_by_country_groups_correctly(self, api_client, analytics_employees):
        """Country stats are grouped by (country, currency)."""
        response = api_client.get("/api/analytics/by-country/")
        assert response.status_code == 200

        countries = {r["country"] for r in response.data}
        assert "US" in countries
        assert "IN" in countries

    def test_by_country_us_stats(self, api_client, analytics_employees):
        """US stats include 3 USD employees."""
        response = api_client.get("/api/analytics/by-country/")
        us = next(r for r in response.data if r["country"] == "US")
        assert us["employee_count"] == 3
        assert us["currency"] == "USD"


# === Service Layer Unit Tests ===


@pytest.mark.django_db
class TestMedianCalculation:

    def test_median_odd_count(self):
        """Median of odd-length list returns middle value."""
        values = [Decimal("10"), Decimal("20"), Decimal("30")]
        assert services._compute_median(values) == Decimal("20")

    def test_median_even_count(self):
        """Median of even-length list returns average of two middle values."""
        values = [Decimal("10"), Decimal("20"), Decimal("30"), Decimal("40")]
        assert services._compute_median(values) == Decimal("25")

    def test_median_single_value(self):
        """Median of single-element list returns that element."""
        values = [Decimal("50000")]
        assert services._compute_median(values) == Decimal("50000")

    def test_median_empty_list(self):
        """Median of empty list returns 0."""
        assert services._compute_median([]) == Decimal("0.00")
