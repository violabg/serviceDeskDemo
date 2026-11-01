import { describe, expect, it } from "vitest"

import { ACCESS_OPERATIONS, permissionKey } from "@/lib/access-control"
import {
    SERVICE_DESK_NAVIGATION,
    getReadableServiceDeskNavigation,
    getReadableServiceDeskNavigationGroups,
} from "@/lib/service-desk-navigation"

const SECTION_ENTRY_IDS = ["customers", "tickets", "users", "roles"] as const

function readableItemIds(keys: string[]) {
  return getReadableServiceDeskNavigation(new Set(keys)).map((item) => item.id)
}

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

  it("declares a section on every entry and no operation", () => {
    for (const group of SERVICE_DESK_NAVIGATION) {
      for (const entry of group.items) {
        expect(entry.section).toBe(entry.id)
        expect(entry).not.toHaveProperty("requiredPermission")
        expect(entry).not.toHaveProperty("operation")
      }
    }
  })

  describe("any-one-of-three visibility", () => {
    it.each(SECTION_ENTRY_IDS)("shows %s with its read key alone", (sectionId) => {
      expect(readableItemIds([permissionKey(sectionId, "read")])).toEqual([
        sectionId,
      ])
    })

    it.each(SECTION_ENTRY_IDS)(
      "shows %s with its write key alone",
      (sectionId) => {
        expect(readableItemIds([permissionKey(sectionId, "write")])).toEqual([
          sectionId,
        ])
      }
    )

    it.each(SECTION_ENTRY_IDS)(
      "shows %s with its manage key alone",
      (sectionId) => {
        expect(readableItemIds([permissionKey(sectionId, "manage")])).toEqual([
          sectionId,
        ])
      }
    )

    it.each(SECTION_ENTRY_IDS)(
      "hides %s when none of its three keys is held",
      (sectionId) => {
        const otherKeys = ACCESS_OPERATIONS.flatMap((operation) =>
          SECTION_ENTRY_IDS.filter((other) => other !== sectionId).map((other) =>
            permissionKey(other, operation)
          )
        )

        expect(readableItemIds(otherKeys)).not.toContain(sectionId)
      }
    )

    it("hides every entry when the actor holds no section key", () => {
      const groups = getReadableServiceDeskNavigationGroups(
        new Set([permissionKey("dashboard", "read")])
      )

      expect(groups).toEqual([])
      expect(readableItemIds([permissionKey("dashboard", "read")])).toEqual([])
    })

    it("hides every entry for an empty key set", () => {
      expect(getReadableServiceDeskNavigation(new Set())).toEqual([])
      expect(getReadableServiceDeskNavigationGroups(new Set())).toEqual([])
    })

    it("ignores a key that is not one of the section's three keys", () => {
      expect(readableItemIds([permissionKey("customers", "delete")])).toEqual([])
      expect(readableItemIds(["legacy-section:read"])).toEqual([])
    })

    it("adds no key to the set it receives", () => {
      const granted = new Set([permissionKey("tickets", "manage")])

      getReadableServiceDeskNavigation(granted)

      expect([...granted]).toEqual([permissionKey("tickets", "manage")])
    })
  })

  describe("groups and ordering", () => {
    it("keeps the declared order and drops a group with no visible entry", () => {
      const groups = getReadableServiceDeskNavigationGroups(
        new Set([permissionKey("customers", "write")])
      )

      expect(groups.map((group) => group.id)).toEqual(["ticket-management"])
      expect(groups[0]?.items.map((item) => item.id)).toEqual(["customers"])
    })

    it("keeps both groups when one entry of each survives", () => {
      const groups = getReadableServiceDeskNavigationGroups(
        new Set([
          permissionKey("tickets", "write"),
          permissionKey("roles", "manage"),
        ])
      )

      expect(groups.map((group) => group.id)).toEqual([
        "ticket-management",
        "access-management",
      ])
      expect(groups[0]?.items.map((item) => item.id)).toEqual(["tickets"])
      expect(groups[1]?.items.map((item) => item.id)).toEqual(["roles"])
    })

    it("keeps the entry id, title and url the sidebar consumes", () => {
      const groups = getReadableServiceDeskNavigationGroups(
        new Set([permissionKey("tickets", "manage")])
      )
      const item = groups.find((group) => group.id === "ticket-management")
        ?.items[0]

      expect(item).toMatchObject({
        id: "tickets",
        title: "Tickets",
        url: "/tickets",
        section: "tickets",
      })
    })

    it("flattens the same entries the grouped filter keeps", () => {
      const keys = [
        permissionKey("customers", "manage"),
        permissionKey("users", "write"),
      ]

      expect(getReadableServiceDeskNavigation(new Set(keys))).toEqual(
        getReadableServiceDeskNavigationGroups(new Set(keys)).flatMap(
          (group) => group.items
        )
      )
    })
  })
})
