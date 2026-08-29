/**
 * API client for the Employee Salary Management backend.
 *
 * Centralizes all HTTP calls so components never construct URLs or
 * handle fetch options directly.
 */

import type {
  Employee,
  EmployeeFormData,
  EmployeeFilters,
  PaginatedResponse,
  SalarySummary,
  DepartmentStats,
  CountryStats,
} from "../types/employee";

const API_BASE = import.meta.env.VITE_API_URL || "/api";

class ApiError extends Error {
  status: number;
  data: Record<string, unknown>;

  constructor(status: number, data: Record<string, unknown>) {
    super(`API Error: ${status}`);
    this.status = status;
    this.data = data;
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${path}`;
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(response.status, data);
  }

  return data as T;
}

// === Employee CRUD ===

export function fetchEmployees(
  filters: EmployeeFilters = {}
): Promise<PaginatedResponse<Employee>> {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== "" && value !== null) {
      params.append(key, String(value));
    }
  });

  const query = params.toString();
  return request<PaginatedResponse<Employee>>(
    `/employees/${query ? `?${query}` : ""}`
  );
}

export function fetchEmployee(id: string): Promise<Employee> {
  return request<Employee>(`/employees/${id}/`);
}

export function createEmployee(data: EmployeeFormData): Promise<Employee> {
  return request<Employee>("/employees/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateEmployee(
  id: string,
  data: Partial<EmployeeFormData>
): Promise<Employee> {
  return request<Employee>(`/employees/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function deleteEmployee(id: string): Promise<void> {
  return request<void>(`/employees/${id}/`, {
    method: "DELETE",
  });
}

// === Analytics ===

export function fetchSalarySummary(): Promise<SalarySummary> {
  return request<SalarySummary>("/analytics/summary/");
}

export function fetchStatsByDepartment(): Promise<DepartmentStats[]> {
  return request<DepartmentStats[]>("/analytics/by-department/");
}

export function fetchStatsByCountry(): Promise<CountryStats[]> {
  return request<CountryStats[]>("/analytics/by-country/");
}

export { ApiError };
