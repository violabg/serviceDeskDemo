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

export type ServiceDeskNavigationGroup = {
  id: string
  title: string
  items: readonly ServiceDeskNavigationItem[]
}

export const SERVICE_DESK_NAVIGATION = [
  {
    id: "ticket-management",
    title: "Ticket Management",
    items: [
      {
        id: "tickets",
        title: "Tickets",
        url: "/tickets",
        requiredPermission: { section: "tickets", operation: "read" },
      },
    ],
  },
  {
    id: "access-management",
    title: "Access Management",
    items: [
      {
        id: "users",
        title: "Users",
        url: "/users",
        requiredPermission: { section: "users", operation: "read" },
      },
      {
        id: "roles",
        title: "Roles",
        url: "/roles",
        requiredPermission: { section: "roles", operation: "read" },
      },
    ],
  },
] as const satisfies readonly ServiceDeskNavigationGroup[]

export type ServiceDeskNavigationId =
  (typeof SERVICE_DESK_NAVIGATION)[number]["items"][number]["id"]

export function getReadableServiceDeskNavigationGroups(
  effectivePermissions: ReadonlySet<string>
) {
  return SERVICE_DESK_NAVIGATION.map((group) => ({
    ...group,
    items: group.items.filter((item) =>
      hasPermission(
        effectivePermissions,
        item.requiredPermission.section,
        item.requiredPermission.operation
      )
    ),
  })).filter((group) => group.items.length > 0)
}

export function getReadableServiceDeskNavigation(
  effectivePermissions: ReadonlySet<string>
) {
  return getReadableServiceDeskNavigationGroups(effectivePermissions).flatMap(
    (group) => group.items
  )
}
