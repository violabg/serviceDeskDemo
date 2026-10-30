import { describe, expect, it } from "vitest"

import {
  CUSTOMER_EDIT_PARAM,
  customerPathForState,
  isCustomerEditState,
} from "@/app/(dashboard)/customers/_lib/edit-state"

describe("customer edit-state URL parameter", () => {
  it("uses the search parameter named edit", () => {
    expect(CUSTOMER_EDIT_PARAM).toBe("edit")
  })

  it("reads edit state only when the parameter has the exact value true", () => {
    expect(isCustomerEditState(new URLSearchParams("edit=true"))).toBe(true)
    expect(isCustomerEditState(new URLSearchParams("edit=TRUE"))).toBe(false)
    expect(isCustomerEditState(new URLSearchParams("edit=false"))).toBe(false)
    expect(isCustomerEditState(new URLSearchParams("edit=1"))).toBe(false)
    expect(isCustomerEditState(new URLSearchParams("edit="))).toBe(false)
  })

  it("treats an absent edit parameter as the read-only state", () => {
    expect(isCustomerEditState(new URLSearchParams(""))).toBe(false)
    expect(isCustomerEditState(new URLSearchParams("q=acme"))).toBe(false)
  })

  it("builds the editing path with edit=true appended to the base path", () => {
    expect(customerPathForState("/customers/customer-1", true)).toBe("/customers/customer-1?edit=true")
  })

  it("builds the non-editing path as the bare base path", () => {
    expect(customerPathForState("/customers/customer-1", false)).toBe("/customers/customer-1")
  })

  it("produces a path that isCustomerEditState reads back as editing", () => {
    const path = customerPathForState("/customers/customer-1", true)
    const query = path.split("?")[1] ?? ""

    expect(isCustomerEditState(new URLSearchParams(query))).toBe(true)
  })

  it("produces a non-editing path that isCustomerEditState reads back as read-only", () => {
    const path = customerPathForState("/customers/customer-1", false)
    const query = path.split("?")[1] ?? ""

    expect(isCustomerEditState(new URLSearchParams(query))).toBe(false)
  })

  it("throws a TypeError when the base path already carries a query string", () => {
    expect(() => customerPathForState("/customers/customer-1?q=acme", true)).toThrow(TypeError)
    expect(() => customerPathForState("/customers/customer-1?q=acme", false)).toThrow(TypeError)
  })
})
