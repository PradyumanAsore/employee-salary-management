"""
Employee model — the core domain entity for salary management.

Design decisions documented in docs/data-model.md:
- UUID primary key for non-enumerable, portable IDs
- DECIMAL(12,2) for salary to avoid floating-point precision issues
- ISO 3166-1 alpha-2 for country, ISO 4217 for currency
- Department as denormalized string (not FK) — see docs for rationale
"""

import uuid

from decimal import Decimal

from django.core.validators import MinValueValidator
from django.db import models


# Valid departments — enforced in serializer, used in seed data
DEPARTMENTS = [
    "Engineering",
    "Product",
    "Design",
    "Marketing",
    "Sales",
    "HR",
    "Finance",
    "Operations",
]

# Country → Currency mapping for seed data and validation hints
COUNTRY_CURRENCY_MAP = {
    "US": "USD",
    "GB": "GBP",
    "DE": "EUR",
    "FR": "EUR",
    "IN": "INR",
    "JP": "JPY",
    "AU": "AUD",
    "CA": "CAD",
    "BR": "BRL",
    "SG": "SGD",
}

VALID_COUNTRIES = list(COUNTRY_CURRENCY_MAP.keys())
VALID_CURRENCIES = list(set(COUNTRY_CURRENCY_MAP.values()))


class Employee(models.Model):
    """Represents an employee's current salary and employment information."""

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
    )
    employee_id = models.CharField(
        max_length=20,
        unique=True,
        help_text="HR-assigned identifier, e.g. EMP-00001",
    )
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(max_length=254, unique=True)
    department = models.CharField(max_length=100, db_index=True)
    job_title = models.CharField(max_length=150)
    country = models.CharField(
        max_length=2,
        db_index=True,
        help_text="ISO 3166-1 alpha-2 country code",
    )
    currency = models.CharField(
        max_length=3,
        help_text="ISO 4217 currency code",
    )
    salary = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(Decimal("0.01"))],
        help_text="Annual gross salary in local currency",
    )
    salary_effective_date = models.DateField(
        help_text="Date when the current salary became effective",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["last_name", "first_name"]
        indexes = [
            models.Index(
                fields=["last_name", "first_name"],
                name="idx_employee_name",
            ),
        ]

    def __str__(self):
        return f"{self.employee_id} — {self.first_name} {self.last_name}"

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"
