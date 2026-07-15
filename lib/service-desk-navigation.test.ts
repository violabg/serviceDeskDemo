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

  it("does not include admin pages", () => {
    const items = getReadableServiceDeskNavigation(
      new Set([
        permissionKey("administration", "read"),
        permissionKey("users", "read"),
        permissionKey("roles", "read"),
      ]),
    )

    expect(items.map((item) => item.title)).toEqual([])
  })
})
