/**
 * DashboardPage — Overview of organizational salary data.
 *
 * Shows total employee count, salary stats by currency,
 * and department/country breakdowns.
 * All analytics are grouped by currency to avoid misleading cross-currency comparisons.
 */

import { useEffect, useState } from "react";
import {
  Title,
  Grid,
  Card,
  Text,
  Group,
  Stack,
  Loader,
  Alert,
  Badge,
  Table,
  SimpleGrid,
  Paper,
  ThemeIcon,
} from "@mantine/core";
import { BarChart } from "@mantine/charts";
import {
  IconUsers,
  IconCash,
  IconArrowUp,
  IconArrowDown,
  IconChartBar,
  IconAlertCircle,
  IconBuilding,
  IconWorld,
} from "@tabler/icons-react";

import {
  fetchSalarySummary,
  fetchStatsByDepartment,
  fetchStatsByCountry,
} from "../services/api";
import type {
  SalarySummary,
  DepartmentStats,
  CountryStats,
} from "../types/employee";
import { formatSalary, getCountryName } from "../utils/format";

export function DashboardPage() {
  const [summary, setSummary] = useState<SalarySummary | null>(null);
  const [deptStats, setDeptStats] = useState<DepartmentStats[]>([]);
  const [countryStats, setCountryStats] = useState<CountryStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [summaryData, deptData, countryData] = await Promise.all([
          fetchSalarySummary(),
          fetchStatsByDepartment(),
          fetchStatsByCountry(),
        ]);
        setSummary(summaryData);
        setDeptStats(deptData);
        setCountryStats(countryData);
      } catch {
        setError("Failed to load dashboard data. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <Stack align="center" justify="center" h={400}>
        <Loader size="lg" />
        <Text c="dimmed">Loading dashboard...</Text>
      </Stack>
    );
  }

  if (error) {
    return (
      <Alert icon={<IconAlertCircle />} color="red" title="Error">
        {error}
      </Alert>
    );
  }

  if (!summary) return null;

  return (
    <Stack gap="xl">
      <div>
        <Title order={2} mb="xs">
          Dashboard
        </Title>
        <Text c="dimmed">
          Organization salary overview for {summary.total_employees.toLocaleString()} employees
        </Text>
      </div>

      {/* Key Metrics */}
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}>
        <StatCard
          icon={<IconUsers size={24} />}
          label="Total Employees"
          value={summary.total_employees.toLocaleString()}
          color="indigo"
        />
        <StatCard
          icon={<IconCash size={24} />}
          label="Currencies"
          value={summary.by_currency.length.toString()}
          color="teal"
        />
        {summary.by_currency.length > 0 && (
          <>
            <StatCard
              icon={<IconArrowUp size={24} />}
              label={`Highest Avg (${summary.by_currency[0]?.currency})`}
              value={formatSalary(
                Math.max(
                  ...summary.by_currency
                    .filter((c) => c.currency === summary.by_currency[0]?.currency)
                    .map((c) => parseFloat(c.avg_salary))
                ),
                summary.by_currency[0]?.currency
              )}
              color="green"
            />
            <StatCard
              icon={<IconArrowDown size={24} />}
              label="Largest Group"
              value={`${summary.by_currency.reduce((a, b) => a.employee_count > b.employee_count ? a : b).currency} (${summary.by_currency.reduce((a, b) => a.employee_count > b.employee_count ? a : b).employee_count.toLocaleString()})`}
              color="orange"
            />
          </>
        )}
      </SimpleGrid>

      {/* Salary Stats by Currency */}
      <Card shadow="sm" radius="md" withBorder>
        <Group mb="md">
          <ThemeIcon variant="light" size="lg" color="indigo">
            <IconCash size={20} />
          </ThemeIcon>
          <div>
            <Text fw={600}>Salary Statistics by Currency</Text>
            <Text size="xs" c="dimmed">
              Stats are grouped by currency to ensure accurate comparisons
            </Text>
          </div>
        </Group>
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Currency</Table.Th>
              <Table.Th style={{ textAlign: "right" }}>Employees</Table.Th>
              <Table.Th style={{ textAlign: "right" }}>Average</Table.Th>
              <Table.Th style={{ textAlign: "right" }}>Median</Table.Th>
              <Table.Th style={{ textAlign: "right" }}>Min</Table.Th>
              <Table.Th style={{ textAlign: "right" }}>Max</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {summary.by_currency.map((stat) => (
              <Table.Tr key={stat.currency}>
                <Table.Td>
                  <Badge variant="light" size="lg">
                    {stat.currency}
                  </Badge>
                </Table.Td>
                <Table.Td style={{ textAlign: "right" }}>
                  {stat.employee_count.toLocaleString()}
                </Table.Td>
                <Table.Td style={{ textAlign: "right" }}>
                  {formatSalary(stat.avg_salary, stat.currency)}
                </Table.Td>
                <Table.Td style={{ textAlign: "right" }}>
                  {formatSalary(stat.median_salary, stat.currency)}
                </Table.Td>
                <Table.Td style={{ textAlign: "right" }}>
                  {formatSalary(stat.min_salary, stat.currency)}
                </Table.Td>
                <Table.Td style={{ textAlign: "right" }}>
                  {formatSalary(stat.max_salary, stat.currency)}
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Card>

      <Grid>
        {/* Department Breakdown */}
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card shadow="sm" radius="md" withBorder h="100%">
            <Group mb="md">
              <ThemeIcon variant="light" size="lg" color="violet">
                <IconBuilding size={20} />
              </ThemeIcon>
              <div>
                <Text fw={600}>By Department</Text>
                <Text size="xs" c="dimmed">
                  Employee count per department
                </Text>
              </div>
            </Group>
            <BarChart
              h={300}
              data={aggregateDeptCounts(deptStats)}
              dataKey="department"
              series={[{ name: "employees", color: "indigo.6" }]}
              tickLine="y"
              gridAxis="y"
            />
          </Card>
        </Grid.Col>

        {/* Country Breakdown */}
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card shadow="sm" radius="md" withBorder h="100%">
            <Group mb="md">
              <ThemeIcon variant="light" size="lg" color="cyan">
                <IconWorld size={20} />
              </ThemeIcon>
              <div>
                <Text fw={600}>By Country</Text>
                <Text size="xs" c="dimmed">
                  Employee distribution across countries
                </Text>
              </div>
            </Group>
            <BarChart
              h={300}
              data={countryStats.map((s) => ({
                country: getCountryName(s.country),
                employees: s.employee_count,
              }))}
              dataKey="country"
              series={[{ name: "employees", color: "cyan.6" }]}
              tickLine="y"
              gridAxis="y"
            />
          </Card>
        </Grid.Col>
      </Grid>

      {/* Department Salary Details Table */}
      <Card shadow="sm" radius="md" withBorder>
        <Group mb="md">
          <ThemeIcon variant="light" size="lg" color="violet">
            <IconChartBar size={20} />
          </ThemeIcon>
          <div>
            <Text fw={600}>Department Salary Details</Text>
            <Text size="xs" c="dimmed">
              Salary ranges by department and currency
            </Text>
          </div>
        </Group>
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Department</Table.Th>
              <Table.Th>Currency</Table.Th>
              <Table.Th style={{ textAlign: "right" }}>Employees</Table.Th>
              <Table.Th style={{ textAlign: "right" }}>Average</Table.Th>
              <Table.Th style={{ textAlign: "right" }}>Min</Table.Th>
              <Table.Th style={{ textAlign: "right" }}>Max</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {deptStats.map((stat, i) => (
              <Table.Tr key={i}>
                <Table.Td fw={500}>{stat.department}</Table.Td>
                <Table.Td>
                  <Badge variant="outline" size="sm">
                    {stat.currency}
                  </Badge>
                </Table.Td>
                <Table.Td style={{ textAlign: "right" }}>
                  {stat.employee_count}
                </Table.Td>
                <Table.Td style={{ textAlign: "right" }}>
                  {formatSalary(stat.avg_salary, stat.currency)}
                </Table.Td>
                <Table.Td style={{ textAlign: "right" }}>
                  {formatSalary(stat.min_salary, stat.currency)}
                </Table.Td>
                <Table.Td style={{ textAlign: "right" }}>
                  {formatSalary(stat.max_salary, stat.currency)}
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Card>
    </Stack>
  );
}

/** Aggregate department stats across currencies for the bar chart */
function aggregateDeptCounts(stats: DepartmentStats[]) {
  const map = new Map<string, number>();
  stats.forEach((s) => {
    map.set(s.department, (map.get(s.department) || 0) + s.employee_count);
  });
  return Array.from(map.entries()).map(([department, employees]) => ({
    department,
    employees,
  }));
}

/** Reusable stat card component */
function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <Paper shadow="sm" radius="md" p="md" withBorder className="stat-card">
      <Group>
        <ThemeIcon variant="light" size="xl" color={color} radius="md">
          {icon}
        </ThemeIcon>
        <div>
          <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
            {label}
          </Text>
          <Text size="xl" fw={700}>
            {value}
          </Text>
        </div>
      </Group>
    </Paper>
  );
}
