// @vitest-environment jsdom

import React from "react"

import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { TicketFiltersForm } from "@/app/(dashboard)/tickets/ticket-filters-form"

const pushMock = vi.hoisted(() => vi.fn())

const ALL_VALUE = "__all__"

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock, refresh: vi.fn() }),
}))
vi.mock("@/components/ui/select", () => ({
  Select: ({ children, value }: { children: React.ReactNode; value: string }) => (
    <div data-select-value={value}>{children}</div>
  ),
  SelectContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SelectGroup: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SelectItem: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SelectTrigger: ({ children, id }: { children: React.ReactNode; id?: string }) => (
    <button type="button" id={id}>
      {children}
    </button>
  ),
  SelectValue: ({ placeholder }: { placeholder?: string }) => <span>{placeholder}</span>,
}))

const customers = [{ id: "customer-1", name: "Ana Rossi", company: "Acme", status: "Active" }]

function renderForm(initialValues: { q?: string; status?: string; priority?: string; customerId?: string } = {}) {
  return render(
    <TicketFiltersForm initialValues={initialValues} canCreate={false} customers={customers} />
  )
}

function selectValues(container: HTMLElement) {
  return Array.from(container.querySelectorAll("[data-select-value]")).map((node) =>
    node.getAttribute("data-select-value")
  )
}

describe("TicketFiltersForm", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("shows the search value taken from the URL in the search field", () => {
    renderForm({ q: "printer" })

    expect(screen.getByLabelText("Search")).toHaveValue("printer")
  })

  it("renders a Reset Filters link to the tickets base path beside the Filter submit control", () => {
    const { container } = renderForm({ q: "printer" })

    const form = container.querySelector("form")
    if (!form) throw new Error("filter form not rendered")
    const reset = screen.getByRole("button", { name: "Reset Filters" })
    expect(reset.tagName).toBe("A")
    expect(reset).toHaveAttribute("href", "/tickets")
    expect(form.contains(reset)).toBe(true)
    const filter = screen.getByRole("button", { name: "Filter" })
    expect(filter).toHaveAttribute("type", "submit")
    expect(form.contains(filter)).toBe(true)
  })

  it("clears all four fields on Reset even when the address carries no filter", async () => {
    const { container } = renderForm()
    const user = userEvent.setup()
    const search = screen.getByLabelText("Search")

    await user.type(search, "printer")
    expect(search).toHaveValue("printer")
    await user.click(screen.getByRole("button", { name: "Reset Filters" }))

    expect(search).toHaveValue("")
    expect(selectValues(container)).toEqual([ALL_VALUE, ALL_VALUE, ALL_VALUE])
  })

  it("clears the search and the select fields on Reset when the address carries filters", async () => {
    const { container } = renderForm({ q: "printer", status: "Open", priority: "High", customerId: "customer-1" })
    const user = userEvent.setup()

    expect(selectValues(container)).toEqual(["Open", "High", "customer-1"])
    await user.click(screen.getByRole("button", { name: "Reset Filters" }))

    expect(screen.getByLabelText("Search")).toHaveValue("")
    expect(selectValues(container)).toEqual([ALL_VALUE, ALL_VALUE, ALL_VALUE])
  })

  it("clears the fields again on a second Reset activation", async () => {
    renderForm({ q: "printer" })
    const user = userEvent.setup()
    const reset = screen.getByRole("button", { name: "Reset Filters" })

    await user.click(reset)
    await user.type(screen.getByLabelText("Search"), "vpn")
    await user.click(reset)

    expect(screen.getByLabelText("Search")).toHaveValue("")
  })

  it("clears the search field when the URL no longer carries the filter values", () => {
    const { rerender } = renderForm({ q: "printer" })
    expect(screen.getByLabelText("Search")).toHaveValue("printer")

    rerender(<TicketFiltersForm initialValues={{}} canCreate={false} customers={customers} />)

    expect(screen.getByLabelText("Search")).toHaveValue("")
  })

  it("follows a new search value from the URL when the initial values change", () => {
    const { rerender } = renderForm({ q: "printer" })

    rerender(<TicketFiltersForm initialValues={{ q: "vpn" }} canCreate={false} customers={customers} />)

    expect(screen.getByLabelText("Search")).toHaveValue("vpn")
  })

  it("resyncs the select fields from the URL when the initial values change", () => {
    const { container, rerender } = renderForm({ status: "Open" })
    expect(selectValues(container)).toEqual(["Open", ALL_VALUE, ALL_VALUE])

    rerender(<TicketFiltersForm initialValues={{ status: "Closed" }} canCreate={false} customers={customers} />)

    expect(selectValues(container)).toEqual(["Closed", ALL_VALUE, ALL_VALUE])
  })

  it("navigates to the tickets path with the trimmed search term when the filter is submitted", async () => {
    renderForm()
    const user = userEvent.setup()

    await user.type(screen.getByLabelText("Search"), "  vpn  ")
    await user.click(screen.getByRole("button", { name: "Filter" }))

    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/tickets?q=vpn"))
  })

  it("navigates to the bare tickets path when the filter is submitted with no values", async () => {
    const { container } = renderForm()
    const user = userEvent.setup()

    await user.click(within(container).getByRole("button", { name: "Filter" }))

    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/tickets"))
  })
})
