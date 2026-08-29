from django.contrib import admin

from .models import Employee


@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = [
        "employee_id",
        "first_name",
        "last_name",
        "department",
        "country",
        "currency",
        "salary",
    ]
    list_filter = ["department", "country", "currency"]
    search_fields = ["employee_id", "first_name", "last_name", "email"]
    readonly_fields = ["id", "created_at", "updated_at"]
