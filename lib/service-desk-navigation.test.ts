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
})
