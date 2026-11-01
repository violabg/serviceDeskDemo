import {
    hasAnySectionPermission,
    type AccessSection,
} from "@/lib/access-control"

export type ServiceDeskNavigationItem = {
  id: string
  title: string
  url: string
  section: AccessSection
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
        id: "customers",
        title: "Customers",
        url: "/customers",
        section: "customers",
      },
      {
        id: "tickets",
        title: "Tickets",
        url: "/tickets",
        section: "tickets",
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
        section: "users",
      },
      {
        id: "roles",
        title: "Roles",
        url: "/roles",
        section: "roles",
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
      hasAnySectionPermission(effectivePermissions, item.section)
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
