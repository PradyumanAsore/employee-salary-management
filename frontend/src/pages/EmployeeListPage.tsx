/**
 * EmployeeListPage — Searchable, filterable, paginated employee table.
 *
 * Supports:
 * - Text search (name, email, employee ID)
 * - Filters (department, country, currency, salary range)
 * - Column sorting
 * - Pagination with configurable page size
 */

import { useEffect, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Title,
  TextInput,
  Select,
  Group,
  Stack,
  Table,
  Pagination,
  Badge,
  Text,
  Card,
  Loader,
  Alert,
  Button,
  Grid,
  NumberInput,
  ActionIcon,
  Tooltip,
} from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import {
  IconSearch,
  IconAlertCircle,
  IconUserPlus,
  IconSortAscending,
  IconSortDescending,
  IconX,
  IconFilter,
  IconUsersGroup,
} from "@tabler/icons-react";

import { fetchEmployees } from "../services/api";
import type { Employee, EmployeeFilters } from "../types/employee";
import {
  DEPARTMENTS,
  COUNTRY_NAMES,
  CURRENCY_SYMBOLS,
} from "../types/employee";
import { formatSalary, getCountryName } from "../utils/format";

const PAGE_SIZE = 25;

const COUNTRY_OPTIONS = Object.entries(COUNTRY_NAMES).map(([code, name]) => ({
  value: code,
  label: name,
}));

const CURRENCY_OPTIONS = Object.entries(CURRENCY_SYMBOLS).map(
  ([code, symbol]) => ({
    value: code,
    label: `${code} (${symbol})`,
  })
);

const DEPT_OPTIONS = DEPARTMENTS.map((d) => ({ value: d, label: d }));

export function EmployeeListPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // State from URL params for shareable filters
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [department, setDepartment] = useState<string | null>(
    searchParams.get("department")
  );
  const [country, setCountry] = useState<string | null>(
    searchParams.get("country")
  );
  const [currency, setCurrency] = useState<string | null>(
    searchParams.get("currency")
  );
  const [salaryMin, setSalaryMin] = useState<number | string>(
    searchParams.get("salary_min") || ""
  );
  const [salaryMax, setSalaryMax] = useState<number | string>(
    searchParams.get("salary_max") || ""
  );
  const [ordering, setOrdering] = useState(
    searchParams.get("ordering") || "last_name"
  );
  const [page, setPage] = useState(
    parseInt(searchParams.get("page") || "1", 10)
  );

  const [debouncedSearch] = useDebouncedValue(search, 300);

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const loadEmployees = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const filters: EmployeeFilters = {
        page,
        page_size: PAGE_SIZE,
        ordering,
      };
      if (debouncedSearch) filters.search = debouncedSearch;
      if (department) filters.department = department;
      if (country) filters.country = country;
      if (currency) filters.currency = currency;
      if (salaryMin) filters.salary_min = String(salaryMin);
      if (salaryMax) filters.salary_max = String(salaryMax);

      const result = await fetchEmployees(filters);
      setEmployees(result.results);
      setTotalCount(result.count);
    } catch {
      setError("Failed to load employees. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [
    page,
    debouncedSearch,
    department,
    country,
    currency,
    salaryMin,
    salaryMax,
    ordering,
  ]);

  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  // Sync filters to URL params
  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (department) params.set("department", department);
    if (country) params.set("country", country);
    if (currency) params.set("currency", currency);
    if (salaryMin) params.set("salary_min", String(salaryMin));
    if (salaryMax) params.set("salary_max", String(salaryMax));
    if (ordering !== "last_name") params.set("ordering", ordering);
    if (page > 1) params.set("page", String(page));
    setSearchParams(params, { replace: true });
  }, [
    search,
    department,
    country,
    currency,
    salaryMin,
    salaryMax,
    ordering,
    page,
    setSearchParams,
  ]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, department, country, currency, salaryMin, salaryMax]);

  function toggleSort(field: string) {
    if (ordering === field) {
      setOrdering(`-${field}`);
    } else if (ordering === `-${field}`) {
      setOrdering(field);
    } else {
      setOrdering(field);
    }
  }

  function SortIcon({ field }: { field: string }) {
    if (ordering === field)
      return <IconSortAscending size={14} style={{ marginLeft: 4 }} />;
    if (ordering === `-${field}`)
      return <IconSortDescending size={14} style={{ marginLeft: 4 }} />;
    return null;
  }

  function clearFilters() {
    setSearch("");
    setDepartment(null);
    setCountry(null);
    setCurrency(null);
    setSalaryMin("");
    setSalaryMax("");
    setOrdering("last_name");
    setPage(1);
  }

  const hasFilters =
    department || country || currency || salaryMin || salaryMax;

  return (
    <Stack gap="lg">
      <Group justify="space-between" align="flex-start">
        <div>
          <Title order={2}>Employees</Title>
          <Text c="dimmed" size="sm">
            {totalCount.toLocaleString()} employee{totalCount !== 1 ? "s" : ""}{" "}
            found
          </Text>
        </div>
        <Button
          leftSection={<IconUserPlus size={18} />}
          onClick={() => navigate("/employees/new")}
        >
          Add Employee
        </Button>
      </Group>

      {/* Search & Filter Controls */}
      <Card shadow="sm" radius="md" withBorder p="md">
        <Stack gap="sm">
          <Group>
            <TextInput
              placeholder="Search by name, email, or employee ID..."
              leftSection={<IconSearch size={16} />}
              value={search}
              onChange={(e) => setSearch(e.currentTarget.value)}
              style={{ flex: 1 }}
              rightSection={
                search ? (
                  <ActionIcon
                    variant="subtle"
                    size="sm"
                    onClick={() => setSearch("")}
                  >
                    <IconX size={14} />
                  </ActionIcon>
                ) : undefined
              }
            />
            <Tooltip label={showFilters ? "Hide filters" : "Show filters"}>
              <ActionIcon
                variant={hasFilters ? "filled" : "light"}
                size="lg"
                onClick={() => setShowFilters(!showFilters)}
              >
                <IconFilter size={18} />
              </ActionIcon>
            </Tooltip>
          </Group>

          {showFilters && (
            <Grid>
              <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                <Select
                  label="Department"
                  placeholder="All departments"
                  data={DEPT_OPTIONS}
                  value={department}
                  onChange={setDepartment}
                  clearable
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                <Select
                  label="Country"
                  placeholder="All countries"
                  data={COUNTRY_OPTIONS}
                  value={country}
                  onChange={setCountry}
                  clearable
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6, md: 2 }}>
                <Select
                  label="Currency"
                  placeholder="All"
                  data={CURRENCY_OPTIONS}
                  value={currency}
                  onChange={setCurrency}
                  clearable
                />
              </Grid.Col>
              <Grid.Col span={{ base: 6, sm: 3, md: 2 }}>
                <NumberInput
                  label="Min Salary"
                  placeholder="0"
                  value={salaryMin}
                  onChange={setSalaryMin}
                  min={0}
                  thousandSeparator=","
                />
              </Grid.Col>
              <Grid.Col span={{ base: 6, sm: 3, md: 2 }}>
                <NumberInput
                  label="Max Salary"
                  placeholder="∞"
                  value={salaryMax}
                  onChange={setSalaryMax}
                  min={0}
                  thousandSeparator=","
                />
              </Grid.Col>
              {hasFilters && (
                <Grid.Col span={12}>
                  <Button
                    variant="subtle"
                    size="xs"
                    onClick={clearFilters}
                    leftSection={<IconX size={14} />}
                  >
                    Clear all filters
                  </Button>
                </Grid.Col>
              )}
            </Grid>
          )}
        </Stack>
      </Card>

      {/* Error State */}
      {error && (
        <Alert
          icon={<IconAlertCircle />}
          color="red"
          title="Error"
          withCloseButton
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}

      {/* Employee Table */}
      <Card shadow="sm" radius="md" withBorder p={0}>
        {loading ? (
          <Stack align="center" justify="center" py="xl">
            <Loader />
          </Stack>
        ) : employees.length === 0 ? (
          <Stack align="center" justify="center" py="xl" gap="sm">
            <IconUsersGroup size={48} color="gray" />
            <Text c="dimmed" size="lg">
              No employees found
            </Text>
            <Text c="dimmed" size="sm">
              {hasFilters || search
                ? "Try adjusting your search or filters"
                : "Add your first employee to get started"}
            </Text>
          </Stack>
        ) : (
          <Table.ScrollContainer minWidth={800}>
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th
                    onClick={() => toggleSort("employee_id")}
                    style={{ cursor: "pointer", userSelect: "none" }}
                  >
                    ID <SortIcon field="employee_id" />
                  </Table.Th>
                  <Table.Th
                    onClick={() => toggleSort("last_name")}
                    style={{ cursor: "pointer", userSelect: "none" }}
                  >
                    Name <SortIcon field="last_name" />
                  </Table.Th>
                  <Table.Th
                    onClick={() => toggleSort("department")}
                    style={{ cursor: "pointer", userSelect: "none" }}
                  >
                    Department <SortIcon field="department" />
                  </Table.Th>
                  <Table.Th>Country</Table.Th>
                  <Table.Th
                    onClick={() => toggleSort("salary")}
                    style={{
                      cursor: "pointer",
                      userSelect: "none",
                      textAlign: "right",
                    }}
                  >
                    Salary <SortIcon field="salary" />
                  </Table.Th>
                  <Table.Th>Title</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {employees.map((emp) => (
                  <Table.Tr
                    key={emp.id}
                    data-clickable="true"
                    onClick={() => navigate(`/employees/${emp.id}`)}
                  >
                    <Table.Td>
                      <Text size="sm" ff="monospace" c="dimmed">
                        {emp.employee_id}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <div>
                        <Text size="sm" fw={500}>
                          {emp.full_name}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {emp.email}
                        </Text>
                      </div>
                    </Table.Td>
                    <Table.Td>
                      <Badge variant="light" size="sm">
                        {emp.department}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">{getCountryName(emp.country)}</Text>
                    </Table.Td>
                    <Table.Td style={{ textAlign: "right" }}>
                      <Text size="sm" fw={500}>
                        {formatSalary(emp.salary, emp.currency)}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" c="dimmed">
                        {emp.job_title}
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        )}
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <Group justify="center">
          <Pagination
            total={totalPages}
            value={page}
            onChange={setPage}
            size="md"
          />
          <Text size="sm" c="dimmed">
            Page {page} of {totalPages}
          </Text>
        </Group>
      )}
    </Stack>
  );
}
