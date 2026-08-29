"""
Filters for the Employee API.

Uses django-filter to provide declarative filtering on employee list queries.
"""

import django_filters

from .models import Employee


class EmployeeFilter(django_filters.FilterSet):
    """
    Supports filtering employees by:
    - department (exact match)
    - country (exact match)
    - currency (exact match)
    - salary_min / salary_max (range)
    """

    salary_min = django_filters.NumberFilter(
        field_name="salary", lookup_expr="gte", label="Minimum salary"
    )
    salary_max = django_filters.NumberFilter(
        field_name="salary", lookup_expr="lte", label="Maximum salary"
    )

    class Meta:
        model = Employee
        fields = ["department", "country", "currency"]
