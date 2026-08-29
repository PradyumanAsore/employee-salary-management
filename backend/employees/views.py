"""
API views for Employee management and salary analytics.

Views are intentionally thin — they handle HTTP concerns (pagination, response format)
and delegate business logic to the service layer.
"""

from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .filters import EmployeeFilter
from .models import Employee
from .serializers import EmployeeListSerializer, EmployeeSerializer
from . import services


class EmployeeListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/employees/ — List employees with search, filtering, pagination
    POST /api/employees/ — Create a new employee
    """

    queryset = Employee.objects.all()
    filterset_class = EmployeeFilter
    search_fields = ["first_name", "last_name", "email", "employee_id"]
    ordering_fields = [
        "employee_id",
        "first_name",
        "last_name",
        "department",
        "country",
        "salary",
        "salary_effective_date",
        "created_at",
    ]
    ordering = ["last_name", "first_name"]

    def get_serializer_class(self):
        if self.request.method == "GET":
            return EmployeeListSerializer
        return EmployeeSerializer


class EmployeeDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /api/employees/{id}/ — Retrieve employee details
    PATCH  /api/employees/{id}/ — Partially update an employee
    PUT    /api/employees/{id}/ — Fully update an employee
    DELETE /api/employees/{id}/ — Delete an employee
    """

    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer


class AnalyticsSummaryView(APIView):
    """
    GET /api/analytics/summary/ — Organization-wide salary statistics by currency.
    """

    def get(self, request):
        summary = services.get_salary_summary()
        return Response(summary)


class AnalyticsByDepartmentView(APIView):
    """
    GET /api/analytics/by-department/ — Salary stats per department, grouped by currency.
    """

    def get(self, request):
        stats = services.get_stats_by_department()
        return Response(stats)


class AnalyticsByCountryView(APIView):
    """
    GET /api/analytics/by-country/ — Salary stats per country, grouped by currency.
    """

    def get(self, request):
        stats = services.get_stats_by_country()
        return Response(stats)
