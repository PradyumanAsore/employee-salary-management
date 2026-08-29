/**
 * TypeScript interfaces for the Employee domain.
 * Matches the backend API response shapes exactly.
 */

export interface Employee {
  id: string;
  employee_id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  department: string;
  job_title: string;
  country: string;
  currency: string;
  salary: string; // Decimal serialized as string to avoid floating-point issues
  salary_effective_date: string;
  created_at?: string;
  updated_at?: string;
}

export interface EmployeeFormData {
  employee_id: string;
  first_name: string;
  last_name: string;
  email: string;
  department: string;
  job_title: string;
  country: string;
  currency: string;
  salary: string;
  salary_effective_date: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface CurrencyStats {
  currency: string;
  employee_count: number;
  avg_salary: string;
  median_salary: string;
  min_salary: string;
  max_salary: string;
}

export interface SalarySummary {
  total_employees: number;
  by_currency: CurrencyStats[];
}

export interface DepartmentStats {
  department: string;
  currency: string;
  employee_count: number;
  avg_salary: string;
  min_salary: string;
  max_salary: string;
}

export interface CountryStats {
  country: string;
  currency: string;
  employee_count: number;
  avg_salary: string;
  min_salary: string;
  max_salary: string;
}

export interface EmployeeFilters {
  search?: string;
  department?: string;
  country?: string;
  currency?: string;
  salary_min?: string;
  salary_max?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
}

/** Maps ISO country codes to display names */
export const COUNTRY_NAMES: Record<string, string> = {
  US: "United States",
  GB: "United Kingdom",
  DE: "Germany",
  FR: "France",
  IN: "India",
  JP: "Japan",
  AU: "Australia",
  CA: "Canada",
  BR: "Brazil",
  SG: "Singapore",
};

/** Maps ISO currency codes to symbols */
export const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  GBP: "£",
  EUR: "€",
  INR: "₹",
  JPY: "¥",
  AUD: "A$",
  CAD: "C$",
  BRL: "R$",
  SGD: "S$",
};

export const DEPARTMENTS = [
  "Engineering",
  "Product",
  "Design",
  "Marketing",
  "Sales",
  "HR",
  "Finance",
  "Operations",
];

export const COUNTRY_CURRENCY_MAP: Record<string, string> = {
  US: "USD",
  GB: "GBP",
  DE: "EUR",
  FR: "EUR",
  IN: "INR",
  JP: "JPY",
  AU: "AUD",
  CA: "CAD",
  BR: "BRL",
  SG: "SGD",
};
