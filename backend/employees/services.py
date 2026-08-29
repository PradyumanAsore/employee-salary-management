"""
Business logic for salary analytics.

Keeps aggregation queries and business rules out of views.
All analytics are grouped by currency to avoid misleading cross-currency comparisons.
"""

from decimal import Decimal

from django.db.models import Avg, Count, Max, Min, Q

from .models import Employee


def get_salary_summary():
    """
    Compute organization-wide salary statistics, grouped by currency.

    Returns dict with:
    - total_employees: int
    - by_currency: list of per-currency stats (count, avg, median, min, max)
    """
    total = Employee.objects.count()

    by_currency = (
        Employee.objects.values("currency")
        .annotate(
            employee_count=Count("id"),
            avg_salary=Avg("salary"),
            min_salary=Min("salary"),
            max_salary=Max("salary"),
        )
        .order_by("currency")
    )

    # Compute median per currency (not available as a DB aggregate in SQLite)
    currency_stats = []
    for entry in by_currency:
        currency = entry["currency"]
        salaries = list(
            Employee.objects.filter(currency=currency)
            .order_by("salary")
            .values_list("salary", flat=True)
        )
        median = _compute_median(salaries)

        currency_stats.append(
            {
                "currency": currency,
                "employee_count": entry["employee_count"],
                "avg_salary": _round_decimal(entry["avg_salary"]),
                "median_salary": _round_decimal(median),
                "min_salary": entry["min_salary"],
                "max_salary": entry["max_salary"],
            }
        )

    return {
        "total_employees": total,
        "by_currency": currency_stats,
    }


def get_stats_by_department():
    """
    Salary statistics per department, grouped by currency.

    Returns a list of dicts, each with department, currency, and salary stats.
    """
    return list(
        Employee.objects.values("department", "currency")
        .annotate(
            employee_count=Count("id"),
            avg_salary=Avg("salary"),
            min_salary=Min("salary"),
            max_salary=Max("salary"),
        )
        .order_by("department", "currency")
    )


def get_stats_by_country():
    """
    Salary statistics per country, grouped by currency.

    In practice, each country typically maps to one currency,
    but we group by both to be safe.
    """
    return list(
        Employee.objects.values("country", "currency")
        .annotate(
            employee_count=Count("id"),
            avg_salary=Avg("salary"),
            min_salary=Min("salary"),
            max_salary=Max("salary"),
        )
        .order_by("country", "currency")
    )


def _compute_median(sorted_values):
    """Compute median from a pre-sorted list of Decimal values."""
    n = len(sorted_values)
    if n == 0:
        return Decimal("0.00")
    if n % 2 == 1:
        return sorted_values[n // 2]
    else:
        mid = n // 2
        return (sorted_values[mid - 1] + sorted_values[mid]) / 2


def _round_decimal(value):
    """Round a Decimal to 2 places, handling None."""
    if value is None:
        return Decimal("0.00")
    return Decimal(value).quantize(Decimal("0.01"))
