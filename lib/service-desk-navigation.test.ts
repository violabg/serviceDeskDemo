import { describe, expect, it } from "vitest"

import { permissionKey } from "@/lib/access-control"
import { getReadableServiceDeskNavigation } from "@/lib/service-desk-navigation"

describe("service desk navigation", () => {
  it("shows only sections with read permission", () => {
    const items = getReadableServiceDeskNavigation(
      new Set([
        permissionKey("dashboard", "read"),
        permissionKey("tickets", "read"),
        permissionKey("reports", "write"),
      ]),
    )

    expect(items.map((item) => item.title)).toEqual(["Dashboard", "Tickets"])
  })

  it("shows User Management only with users read permission", () => {
    expect(
      getReadableServiceDeskNavigation(
        new Set([
          permissionKey("dashboard", "read"),
          permissionKey("users", "write"),
        ]),
      ).map((item) => item.title),
    ).not.toContain("User Management")

    expect(
      getReadableServiceDeskNavigation(
        new Set([
          permissionKey("dashboard", "read"),
          permissionKey("users", "read"),
        ]),
      ).map((item) => item.title),
    ).toContain("User Management")
  })
})
