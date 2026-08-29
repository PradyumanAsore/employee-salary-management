/**
 * EmployeeCreatePage — Form to add a new employee.
 *
 * Features:
 * - Client-side validation
 * - Server-side error mapping (e.g., duplicate email)
 * - Auto-currency selection based on country
 * - Loading state during submission
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Title,
  Card,
  Text,
  Group,
  Stack,
  Button,
  TextInput,
  Select,
  NumberInput,
  Grid,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import {
  IconArrowLeft,
  IconCheck,
  IconUserPlus,
} from "@tabler/icons-react";

import { createEmployee, ApiError } from "../services/api";
import {
  DEPARTMENTS,
  COUNTRY_NAMES,
  CURRENCY_SYMBOLS,
  COUNTRY_CURRENCY_MAP,
} from "../types/employee";

const COUNTRY_OPTIONS = Object.entries(COUNTRY_NAMES).map(([code, name]) => ({
  value: code,
  label: name,
}));
const CURRENCY_OPTIONS = Object.entries(CURRENCY_SYMBOLS).map(
  ([code, symbol]) => ({ value: code, label: `${code} (${symbol})` })
);
const DEPT_OPTIONS = DEPARTMENTS.map((d) => ({ value: d, label: d }));

export function EmployeeCreatePage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const form = useForm({
    initialValues: {
      employee_id: "",
      first_name: "",
      last_name: "",
      email: "",
      department: "",
      job_title: "",
      country: "",
      currency: "",
      salary: 0 as number,
      salary_effective_date: "",
    },
    validate: {
      employee_id: (v) =>
        v.trim() ? null : "Employee ID is required",
      first_name: (v) => (v.trim() ? null : "First name is required"),
      last_name: (v) => (v.trim() ? null : "Last name is required"),
      email: (v) =>
        /^\S+@\S+\.\S+$/.test(v) ? null : "Invalid email address",
      department: (v) => (v ? null : "Department is required"),
      job_title: (v) => (v.trim() ? null : "Job title is required"),
      country: (v) => (v ? null : "Country is required"),
      currency: (v) => (v ? null : "Currency is required"),
      salary: (v) =>
        v > 0 ? null : "Salary must be greater than 0",
      salary_effective_date: (v) =>
        v ? null : "Effective date is required",
    },
  });

  async function handleSubmit(values: typeof form.values) {
    try {
      setSubmitting(true);
      const created = await createEmployee({
        ...values,
        salary: String(values.salary),
      });
      notifications.show({
        title: "Employee Created",
        message: `${created.full_name} has been added successfully.`,
        color: "green",
        icon: <IconCheck size={16} />,
      });
      navigate(`/employees/${created.id}`);
    } catch (err) {
      if (err instanceof ApiError) {
        const fieldErrors: Record<string, string> = {};
        Object.entries(err.data).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            fieldErrors[key] = value[0] as string;
          }
        });
        form.setErrors(fieldErrors);
        notifications.show({
          title: "Validation Error",
          message: "Please fix the highlighted fields.",
          color: "red",
        });
      } else {
        notifications.show({
          title: "Error",
          message: "Failed to create employee. Please try again.",
          color: "red",
        });
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Stack gap="lg">
      <Group>
        <Button
          variant="subtle"
          leftSection={<IconArrowLeft size={16} />}
          onClick={() => navigate("/employees")}
        >
          Back
        </Button>
        <div>
          <Title order={2}>Add Employee</Title>
          <Text c="dimmed" size="sm">
            Create a new employee record
          </Text>
        </div>
      </Group>

      <Card shadow="sm" radius="md" withBorder>
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <Text fw={600} size="lg">
              Employee Information
            </Text>

            <Grid>
              <Grid.Col span={{ base: 12, sm: 4 }}>
                <TextInput
                  label="Employee ID"
                  placeholder="EMP-10001"
                  required
                  {...form.getInputProps("employee_id")}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 4 }}>
                <TextInput
                  label="First Name"
                  placeholder="Jane"
                  required
                  {...form.getInputProps("first_name")}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 4 }}>
                <TextInput
                  label="Last Name"
                  placeholder="Doe"
                  required
                  {...form.getInputProps("last_name")}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <TextInput
                  label="Email"
                  placeholder="jane.doe@acme.com"
                  required
                  {...form.getInputProps("email")}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <TextInput
                  label="Job Title"
                  placeholder="Software Engineer"
                  required
                  {...form.getInputProps("job_title")}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <Select
                  label="Department"
                  placeholder="Select department"
                  required
                  data={DEPT_OPTIONS}
                  {...form.getInputProps("department")}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <Select
                  label="Country"
                  placeholder="Select country"
                  required
                  data={COUNTRY_OPTIONS}
                  {...form.getInputProps("country")}
                  onChange={(val) => {
                    form.setFieldValue("country", val || "");
                    if (val && COUNTRY_CURRENCY_MAP[val]) {
                      form.setFieldValue("currency", COUNTRY_CURRENCY_MAP[val]);
                    }
                  }}
                />
              </Grid.Col>
            </Grid>

            <Text fw={600} size="lg" mt="sm">
              Compensation
            </Text>

            <Grid>
              <Grid.Col span={{ base: 12, sm: 4 }}>
                <Select
                  label="Currency"
                  placeholder="Select currency"
                  required
                  data={CURRENCY_OPTIONS}
                  {...form.getInputProps("currency")}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 4 }}>
                <NumberInput
                  label="Annual Salary"
                  placeholder="75000"
                  required
                  min={0.01}
                  decimalScale={2}
                  thousandSeparator=","
                  {...form.getInputProps("salary")}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 4 }}>
                <TextInput
                  label="Salary Effective Date"
                  type="date"
                  required
                  {...form.getInputProps("salary_effective_date")}
                />
              </Grid.Col>
            </Grid>

            <Group justify="flex-end" mt="md">
              <Button
                variant="subtle"
                onClick={() => navigate("/employees")}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={submitting}
                leftSection={<IconUserPlus size={16} />}
              >
                Create Employee
              </Button>
            </Group>
          </Stack>
        </form>
      </Card>
    </Stack>
  );
}
