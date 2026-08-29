"""
Serializers for the Employee API.

Handles validation, data transformation, and field-level constraints
beyond what the model enforces.
"""

from rest_framework import serializers

from .models import (
    DEPARTMENTS,
    VALID_COUNTRIES,
    VALID_CURRENCIES,
    Employee,
)


class EmployeeSerializer(serializers.ModelSerializer):
    """
    Full serializer for Employee CRUD operations.

    Validation notes:
    - department must be from the predefined list
    - country must be a valid ISO 3166-1 alpha-2 code (from our supported set)
    - currency must be a valid ISO 4217 code (from our supported set)
    - salary must be > 0 (also enforced at model level)
    """

    full_name = serializers.CharField(read_only=True)

    class Meta:
        model = Employee
        fields = [
            "id",
            "employee_id",
            "first_name",
            "last_name",
            "full_name",
            "email",
            "department",
            "job_title",
            "country",
            "currency",
            "salary",
            "salary_effective_date",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_department(self, value):
        if value not in DEPARTMENTS:
            raise serializers.ValidationError(
                f"Invalid department. Must be one of: {', '.join(DEPARTMENTS)}"
            )
        return value

    def validate_country(self, value):
        if value not in VALID_COUNTRIES:
            raise serializers.ValidationError(
                f"Invalid country code. Must be one of: {', '.join(VALID_COUNTRIES)}"
            )
        return value

    def validate_currency(self, value):
        if value not in VALID_CURRENCIES:
            raise serializers.ValidationError(
                f"Invalid currency code. Must be one of: {', '.join(VALID_CURRENCIES)}"
            )
        return value

    def validate_salary(self, value):
        if value <= 0:
            raise serializers.ValidationError("Salary must be greater than zero.")
        return value


class EmployeeListSerializer(serializers.ModelSerializer):
    """
    Lighter serializer for list views — omits timestamps to reduce payload.
    At 25-100 employees per page, the savings are modest, but it keeps
    the list response focused on what the table actually displays.
    """

    full_name = serializers.CharField(read_only=True)

    class Meta:
        model = Employee
        fields = [
            "id",
            "employee_id",
            "first_name",
            "last_name",
            "full_name",
            "email",
            "department",
            "job_title",
            "country",
            "currency",
            "salary",
            "salary_effective_date",
        ]
