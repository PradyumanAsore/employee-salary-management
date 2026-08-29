/**
 * AppLayout — Shell layout with sidebar navigation.
 * Wraps all pages with consistent navigation and header.
 */

import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  AppShell,
  NavLink,
  Group,
  Title,
  Text,
  Burger,
  ActionIcon,
  useMantineColorScheme,
  Box,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconDashboard,
  IconUsers,
  IconUserPlus,
  IconSun,
  IconMoon,
  IconCurrencyDollar,
} from "@tabler/icons-react";

const NAV_ITEMS = [
  { label: "Dashboard", icon: IconDashboard, path: "/" },
  { label: "Employees", icon: IconUsers, path: "/employees" },
  { label: "Add Employee", icon: IconUserPlus, path: "/employees/new" },
];

export function AppLayout() {
  const [opened, { toggle, close }] = useDisclosure();
  const navigate = useNavigate();
  const location = useLocation();
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 260,
        breakpoint: "sm",
        collapsed: { mobile: !opened },
      }}
      padding="lg"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <Group gap="xs">
              <IconCurrencyDollar size={28} color="var(--mantine-color-indigo-6)" />
              <Title order={3} fw={700}>
                SalaryHub
              </Title>
            </Group>
          </Group>
          <Group>
            <Text size="sm" c="dimmed" visibleFrom="sm">
              ACME Corp — HR Management
            </Text>
            <ActionIcon
              variant="subtle"
              size="lg"
              onClick={() => toggleColorScheme()}
              aria-label="Toggle color scheme"
            >
              {colorScheme === "dark" ? (
                <IconSun size={18} />
              ) : (
                <IconMoon size={18} />
              )}
            </ActionIcon>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <Box>
          <Text size="xs" fw={600} c="dimmed" tt="uppercase" mb="sm" px="sm">
            Navigation
          </Text>
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              label={item.label}
              leftSection={<item.icon size={18} />}
              active={
                item.path === "/"
                  ? location.pathname === "/"
                  : location.pathname.startsWith(item.path)
              }
              onClick={() => {
                navigate(item.path);
                close();
              }}
              mb={4}
              style={{ borderRadius: "var(--mantine-radius-md)" }}
            />
          ))}
        </Box>
      </AppShell.Navbar>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
