"""Custom pagination for the Employee API."""

from rest_framework.pagination import PageNumberPagination


class EmployeePagination(PageNumberPagination):
    """
    Pagination with configurable page size via query parameter.

    Defaults to 25 results per page, max 100.
    Client can request a different size with ?page_size=N.
    """

    page_size = 25
    page_size_query_param = "page_size"
    max_page_size = 100
