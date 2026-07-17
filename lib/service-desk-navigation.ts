import {
    hasPermission,
    type AccessOperation,
    type AccessSection,
} from "@/lib/access-control"

export type ServiceDeskNavigationItem = {
  id: string
  title: string
  url: string
  requiredPermission: {
    section: AccessSection
    operation: AccessOperation
  }
}

export const SERVICE_DESK_NAVIGATION = [
  {
    id: "dashboard",
    title: "Dashboard",
    url: "/",
    requiredPermission: { section: "dashboard", operation: "read" },
  },
  {
    id: "tickets",
    title: "Tickets",
    url: "/tickets",
    requiredPermission: { section: "tickets", operation: "read" },
  },
  {
    id: "clients",
    title: "Clients",
    url: "/clients",
    requiredPermission: { section: "clients", operation: "read" },
  },
  {
    id: "technicians",
    title: "Technicians",
    url: "/technicians",
    requiredPermission: { section: "technicians", operation: "read" },
  },
  {
    id: "assets",
    title: "Assets",
    url: "/assets",
    requiredPermission: { section: "assets", operation: "read" },
  },
  {
    id: "reports",
    title: "Reports",
    url: "/reports",
    requiredPermission: { section: "reports", operation: "read" },
  },
  {
    id: "users",
    title: "Users",
    url: "/admin/users",
    requiredPermission: { section: "users", operation: "read" },
  },
  {
    id: "roles",
    title: "Roles",
    url: "/admin/roles",
    requiredPermission: { section: "roles", operation: "read" },
  },
] as const satisfies readonly ServiceDeskNavigationItem[]

export type ServiceDeskNavigationId =
  (typeof SERVICE_DESK_NAVIGATION)[number]["id"]

export function getReadableServiceDeskNavigation(
  effectivePermissions: ReadonlySet<string>,
) {
  return SERVICE_DESK_NAVIGATION.filter((item) =>
    hasPermission(
      effectivePermissions,
      item.requiredPermission.section,
      item.requiredPermission.operation,
    ),
  )
}
