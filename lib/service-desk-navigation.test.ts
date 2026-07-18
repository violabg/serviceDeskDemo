import { describe, expect, it } from "vitest"

import { permissionKey } from "@/lib/access-control"
import {
    getReadableServiceDeskNavigation,
    getReadableServiceDeskNavigationGroups,
} from "@/lib/service-desk-navigation"

describe("service desk navigation", () => {
  it("groups links under access management section", () => {
    const groups = getReadableServiceDeskNavigationGroups(
      new Set([
        permissionKey("dashboard", "read"),
        permissionKey("users", "read"),
        permissionKey("roles", "read"),
      ])
    )

    expect(groups.map((group) => group.title)).toEqual(["Access Management"])
    expect(groups[0]?.items.map((item) => item.title)).toEqual([
      "Users",
      "Roles",
    ])
  })

  it("shows only sections with read permission", () => {
    const items = getReadableServiceDeskNavigation(
      new Set([
        permissionKey("dashboard", "read"),
        permissionKey("users", "read"),
        permissionKey("roles", "read"),
      ])
    )

    expect(items.map((item) => item.title)).toEqual(["Users", "Roles"])
  })

  it("shows user management only with users read permission", () => {
    const items = getReadableServiceDeskNavigation(
      new Set([permissionKey("users", "read")])
    )

    expect(items.map((item) => item.title)).toEqual(["Users"])
  })

  it("shows role management only with roles read permission", () => {
    const items = getReadableServiceDeskNavigation(
      new Set([permissionKey("roles", "read")])
    )

    expect(items.map((item) => item.title)).toEqual(["Roles"])
  })

  it("does not include unknown sections", () => {
    const items = getReadableServiceDeskNavigation(
      new Set([
        permissionKey("dashboard", "read"),
        permissionKey("users", "read"),
        permissionKey("roles", "read"),
      ])
    )

    expect(items.map((item) => item.title)).toEqual(["Users", "Roles"])
  })

  it("does not show empty groups", () => {
    const groups = getReadableServiceDeskNavigationGroups(new Set())

    expect(groups).toEqual([])
  })

  describe("ticket management group", () => {
    it("includes Tickets item when tickets:read is granted", () => {
      const groups = getReadableServiceDeskNavigationGroups(
        new Set([permissionKey("tickets", "read")])
      )

      expect(groups.map((group) => group.id)).toContain("ticket-management")
      expect(
        groups
          .find((group) => group.id === "ticket-management")
          ?.items.map((item) => item.id)
      ).toEqual(["tickets"])
    })

    it("excludes Ticket Management group when tickets:read is absent", () => {
      const groups = getReadableServiceDeskNavigationGroups(
        new Set([permissionKey("users", "read")])
      )

      expect(groups.map((group) => group.id)).not.toContain(
        "ticket-management"
      )
    })

    it("access management group is unaffected by tickets:read", () => {
      const groups = getReadableServiceDeskNavigationGroups(
        new Set([
          permissionKey("tickets", "read"),
          permissionKey("users", "read"),
          permissionKey("roles", "read"),
        ])
      )

      expect(groups.map((group) => group.id)).toEqual([
        "ticket-management",
        "access-management",
      ])
    })

    it("uses /tickets as the Tickets item URL", () => {
      const groups = getReadableServiceDeskNavigationGroups(
        new Set([permissionKey("tickets", "read")])
      )

      expect(
        groups.find((group) => group.id === "ticket-management")?.items[0]?.url
      ).toBe("/tickets")
    })
  })
})
