"""URL routing for the employees API."""

from django.urls import path

from . import views

urlpatterns = [
    # Employee CRUD
    path("employees/", views.EmployeeListCreateView.as_view(), name="employee-list"),
    path(
        "employees/<uuid:pk>/",
        views.EmployeeDetailView.as_view(),
        name="employee-detail",
    ),
    # Analytics
    path(
        "analytics/summary/",
        views.AnalyticsSummaryView.as_view(),
        name="analytics-summary",
    ),
    path(
        "analytics/by-department/",
        views.AnalyticsByDepartmentView.as_view(),
        name="analytics-by-department",
    ),
    path(
        "analytics/by-country/",
        views.AnalyticsByCountryView.as_view(),
        name="analytics-by-country",
    ),
]
