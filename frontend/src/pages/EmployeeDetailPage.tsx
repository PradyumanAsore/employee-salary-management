/**
 * EmployeeDetailPage — View and edit a single employee's details.
 *
 * Supports inline editing with validation, deletion with confirmation,
 * and proper loading/error/not-found states.
 */

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Title,
  Card,
  Text,
  Group,
  Stack,
  Loader,
  Alert,
  Button,
  Badge,
  Grid,
  TextInput,
  Select,
  NumberInput,
  Modal,
  Divider,
  Paper,
  ThemeIcon,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import {
  IconAlertCircle,
  IconEdit,
  IconTrash,
  IconArrowLeft,
  IconCheck,
  IconX,
  IconUser,
  IconCash,
  IconBuilding,
  IconWorld,
  IconMail,
  IconId,
} from "@tabler/icons-react";

import { fetchEmployee, updateEmployee, deleteEmployee, ApiError } from "../services/api";
import type { Employee } from "../types/employee";
import {
  DEPARTMENTS,
  COUNTRY_NAMES,
  CURRENCY_SYMBOLS,
  COUNTRY_CURRENCY_MAP,
} from "../types/employee";
import { formatSalaryPrecise, getCountryName, formatDate } from "../utils/format";

const COUNTRY_OPTIONS = Object.entries(COUNTRY_NAMES).map(([code, name]) => ({
  value: code,
  label: name,
}));
const CURRENCY_OPTIONS = Object.entries(CURRENCY_SYMBOLS).map(
  ([code, symbol]) => ({ value: code, label: `${code} (${symbol})` })
);
const DEPT_OPTIONS = DEPARTMENTS.map((d) => ({ value: d, label: d }));

export function EmployeeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const form = useForm({
    initialValues: {
      first_name: "",
      last_name: "",
      email: "",
      department: "",
      job_title: "",
      country: "",
      currency: "",
      salary: 0,
      salary_effective_date: "",
    },
    validate: {
      first_name: (v) => (v.trim() ? null : "First name is required"),
      last_name: (v) => (v.trim() ? null : "Last name is required"),
      email: (v) => (/^\S+@\S+\.\S+$/.test(v) ? null : "Invalid email"),
      salary: (v) => (v > 0 ? null : "Salary must be greater than 0"),
      salary_effective_date: (v) => (v ? null : "Effective date is required"),
    },
  });

  useEffect(() => {
    if (!id) return;
    async function loadEmployee() {
      try {
        setLoading(true);
        const data = await fetchEmployee(id!);
        setEmployee(data);
        form.setValues({
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          department: data.department,
          job_title: data.job_title,
          country: data.country,
          currency: data.currency,
          salary: parseFloat(data.salary),
          salary_effective_date: data.salary_effective_date,
        });
      } catch (err) {
        if (err instanceof ApiError && err.status === 404) {
          setError("Employee not found.");
        } else {
          setError("Failed to load employee details.");
        }
      } finally {
        setLoading(false);
      }
    }
    loadEmployee();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleSave() {
    if (form.validate().hasErrors || !id) return;

    try {
      setSaving(true);
      const updated = await updateEmployee(id, {
        ...form.values,
        salary: String(form.values.salary),
      });
      setEmployee(updated);
      setEditing(false);
      notifications.show({
        title: "Employee Updated",
        message: `${updated.full_name}'s record has been updated.`,
        color: "green",
        icon: <IconCheck size={16} />,
      });
    } catch (err) {
      if (err instanceof ApiError) {
        // Set field-level errors from API response
        const fieldErrors: Record<string, string> = {};
        Object.entries(err.data).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            fieldErrors[key] = value[0] as string;
          }
        });
        form.setErrors(fieldErrors);
      }
      notifications.show({
        title: "Update Failed",
        message: "Please check the form for errors.",
        color: "red",
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!id) return;
    try {
      setDeleting(true);
      await deleteEmployee(id);
      notifications.show({
        title: "Employee Deleted",
        message: "The employee record has been removed.",
        color: "orange",
      });
      navigate("/employees");
    } catch {
      notifications.show({
        title: "Delete Failed",
        message: "Could not delete the employee. Please try again.",
        color: "red",
      });
    } finally {
      setDeleting(false);
      setDeleteModal(false);
    }
  }

  if (loading) {
    return (
      <Stack align="center" justify="center" h={400}>
        <Loader size="lg" />
        <Text c="dimmed">Loading employee...</Text>
      </Stack>
    );
  }

  if (error || !employee) {
    return (
      <Stack gap="md">
        <Button
          variant="subtle"
          leftSection={<IconArrowLeft size={16} />}
          onClick={() => navigate("/employees")}
        >
          Back to Employees
        </Button>
        <Alert icon={<IconAlertCircle />} color="red" title="Error">
          {error || "Employee not found."}
        </Alert>
      </Stack>
    );
  }

  return (
    <Stack gap="lg">
      {/* Header */}
      <Group justify="space-between" align="flex-start">
        <Group>
          <Button
            variant="subtle"
            leftSection={<IconArrowLeft size={16} />}
            onClick={() => navigate("/employees")}
          >
            Back
          </Button>
          <div>
            <Title order={2}>{employee.full_name}</Title>
            <Text c="dimmed" size="sm">
              {employee.employee_id} · {employee.job_title}
            </Text>
          </div>
        </Group>
        <Group>
          {editing ? (
            <>
              <Button
                variant="subtle"
                leftSection={<IconX size={16} />}
                onClick={() => {
                  setEditing(false);
                  form.setValues({
                    first_name: employee.first_name,
                    last_name: employee.last_name,
                    email: employee.email,
                    department: employee.department,
                    job_title: employee.job_title,
                    country: employee.country,
                    currency: employee.currency,
                    salary: parseFloat(employee.salary),
                    salary_effective_date: employee.salary_effective_date,
                  });
                }}
              >
                Cancel
              </Button>
              <Button
                leftSection={<IconCheck size={16} />}
                onClick={handleSave}
                loading={saving}
              >
                Save Changes
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="light"
                leftSection={<IconEdit size={16} />}
                onClick={() => setEditing(true)}
              >
                Edit
              </Button>
              <Button
                variant="light"
                color="red"
                leftSection={<IconTrash size={16} />}
                onClick={() => setDeleteModal(true)}
              >
                Delete
              </Button>
            </>
          )}
        </Group>
      </Group>

      {editing ? (
        /* Edit Form */
        <Card shadow="sm" radius="md" withBorder>
          <Stack gap="md">
            <Text fw={600} size="lg">
              Edit Employee
            </Text>
            <Grid>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <TextInput
                  label="First Name"
                  required
                  {...form.getInputProps("first_name")}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <TextInput
                  label="Last Name"
                  required
                  {...form.getInputProps("last_name")}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <TextInput
                  label="Email"
                  required
                  {...form.getInputProps("email")}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <Select
                  label="Department"
                  required
                  data={DEPT_OPTIONS}
                  {...form.getInputProps("department")}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <TextInput
                  label="Job Title"
                  required
                  {...form.getInputProps("job_title")}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <Select
                  label="Country"
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
              <Grid.Col span={{ base: 12, sm: 4 }}>
                <Select
                  label="Currency"
                  required
                  data={CURRENCY_OPTIONS}
                  {...form.getInputProps("currency")}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 4 }}>
                <NumberInput
                  label="Annual Salary"
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
          </Stack>
        </Card>
      ) : (
        /* Read-only Detail View */
        <Grid>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Card shadow="sm" radius="md" withBorder h="100%">
              <Group mb="md">
                <ThemeIcon variant="light" size="lg" color="indigo">
                  <IconUser size={20} />
                </ThemeIcon>
                <Text fw={600}>Personal Information</Text>
              </Group>
              <Stack gap="sm">
                <DetailRow
                  icon={<IconId size={16} />}
                  label="Employee ID"
                  value={employee.employee_id}
                />
                <DetailRow
                  icon={<IconUser size={16} />}
                  label="Full Name"
                  value={employee.full_name}
                />
                <DetailRow
                  icon={<IconMail size={16} />}
                  label="Email"
                  value={employee.email}
                />
                <DetailRow
                  icon={<IconBuilding size={16} />}
                  label="Department"
                  value={employee.department}
                  badge
                />
                <DetailRow
                  icon={<IconUser size={16} />}
                  label="Job Title"
                  value={employee.job_title}
                />
                <DetailRow
                  icon={<IconWorld size={16} />}
                  label="Country"
                  value={getCountryName(employee.country)}
                />
              </Stack>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 6 }}>
            <Card shadow="sm" radius="md" withBorder h="100%">
              <Group mb="md">
                <ThemeIcon variant="light" size="lg" color="green">
                  <IconCash size={20} />
                </ThemeIcon>
                <Text fw={600}>Compensation</Text>
              </Group>
              <Stack gap="sm">
                <Paper bg="var(--mantine-color-default)" p="md" radius="md" withBorder>
                  <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
                    Annual Salary
                  </Text>
                  <Text size="xl" fw={700}>
                    {formatSalaryPrecise(employee.salary, employee.currency)}
                  </Text>
                  <Badge variant="light" mt="xs">
                    {employee.currency}
                  </Badge>
                </Paper>
                <DetailRow
                  icon={<IconCash size={16} />}
                  label="Effective Date"
                  value={formatDate(employee.salary_effective_date)}
                />
                <Divider my="xs" />
                <Text size="xs" c="dimmed">
                  Created: {formatDate(employee.created_at || "")}
                </Text>
                <Text size="xs" c="dimmed">
                  Updated: {formatDate(employee.updated_at || "")}
                </Text>
              </Stack>
            </Card>
          </Grid.Col>
        </Grid>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        opened={deleteModal}
        onClose={() => setDeleteModal(false)}
        title="Delete Employee"
        centered
      >
        <Stack>
          <Text>
            Are you sure you want to delete{" "}
            <strong>{employee.full_name}</strong> ({employee.employee_id})?
          </Text>
          <Text size="sm" c="dimmed">
            This action cannot be undone.
          </Text>
          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={() => setDeleteModal(false)}>
              Cancel
            </Button>
            <Button
              color="red"
              onClick={handleDelete}
              loading={deleting}
              leftSection={<IconTrash size={16} />}
            >
              Delete
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}

function DetailRow({
  icon,
  label,
  value,
  badge,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  badge?: boolean;
}) {
  return (
    <Group gap="sm">
      <Text c="dimmed">{icon}</Text>
      <div>
        <Text size="xs" c="dimmed">
          {label}
        </Text>
        {badge ? (
          <Badge variant="light" size="sm">
            {value}
          </Badge>
        ) : (
          <Text size="sm" fw={500}>
            {value}
          </Text>
        )}
      </div>
    </Group>
  );
}
