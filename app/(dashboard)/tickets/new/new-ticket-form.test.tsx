// @vitest-environment jsdom

import React from "react"

import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { NewTicketForm } from "@/app/(dashboard)/tickets/new/new-ticket-form"

const createTicketActionMock = vi.hoisted(() => vi.fn())
const checkDuplicateTicketActionMock = vi.hoisted(() => vi.fn())
const refreshMock = vi.hoisted(() => vi.fn())

vi.mock("@/app/(dashboard)/tickets/actions", () => ({
  createTicketAction: createTicketActionMock,
  checkDuplicateTicketAction: checkDuplicateTicketActionMock,
}))
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: refreshMock }),
}))
vi.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    ...props
  }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button {...props}>{children}</button>
  ),
}))
vi.mock("@/components/ui/input", () => ({
  Input: React.forwardRef<
    HTMLInputElement,
    React.InputHTMLAttributes<HTMLInputElement>
  >(function Input(props, ref) {
    return <input ref={ref} {...props} />
  }),
}))
vi.mock("@/components/ui/textarea", () => ({
  Textarea: React.forwardRef<
    HTMLTextAreaElement,
    React.TextareaHTMLAttributes<HTMLTextAreaElement>
  >(function Textarea(props, ref) {
    return <textarea ref={ref} {...props} />
  }),
}))
vi.mock("@/components/ui/field", () => ({
  Field: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  FieldGroup: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  FieldLabel: ({
    children,
    ...props
  }: React.LabelHTMLAttributes<HTMLLabelElement>) => (
    <label {...props}>{children}</label>
  ),
  FieldError: () => null,
}))
vi.mock("@/components/ui/select", () => ({
  Select: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  SelectContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  SelectGroup: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  SelectItem: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  SelectTrigger: ({
    children,
    ...props
  }: React.HTMLAttributes<HTMLDivElement>) => <div {...props}>{children}</div>,
  SelectValue: ({ placeholder }: { placeholder?: string }) => (
    <span>{placeholder}</span>
  ),
}))

const customers = [
  {
    id: "customer-1",
    name: "Acme Corp",
    email: "it@acme.test",
    company: "Acme",
  },
]

describe("NewTicketForm", () => {
  it("enables duplicate checks only after a title is present", async () => {
    const user = userEvent.setup()

    render(<NewTicketForm customers={customers} assets={[]} technicians={[]} />)

    const duplicateButton = screen.getByRole("button", {
      name: "Check Duplicate",
    })

    expect(duplicateButton).toBeDisabled()

    await user.type(screen.getByLabelText(/title/i), "VPN outage")

    expect(duplicateButton).toBeEnabled()
  })

  it("checks duplicates and shows the returned result state", async () => {
    const user = userEvent.setup()
    checkDuplicateTicketActionMock.mockResolvedValue({
      success: true,
      duplicate: true,
    })

    render(<NewTicketForm customers={customers} assets={[]} technicians={[]} />)

    await user.type(screen.getByLabelText(/title/i), "VPN outage")
    await user.type(
      screen.getByLabelText(/description/i),
      "Users cannot connect"
    )
    await user.type(
      screen.getByLabelText(/requester contact/i),
      "user@example.com"
    )
    await user.click(screen.getByRole("button", { name: "Check Duplicate" }))

    await waitFor(() => {
      expect(checkDuplicateTicketActionMock).toHaveBeenCalledTimes(1)
    })

    const formData = checkDuplicateTicketActionMock.mock.calls[0][0] as FormData
    expect(formData.get("customerId")).toBe("customer-1")
    expect(formData.get("title")).toBe("VPN outage")
    expect(
      screen.getByText(/similar ticket found in the last 24h/i)
    ).toBeInTheDocument()
  })

  it("submits the form, normalizes optional IDs, and refreshes the route", async () => {
    const user = userEvent.setup()
    createTicketActionMock.mockResolvedValue(undefined)

    render(<NewTicketForm customers={customers} assets={[]} technicians={[]} />)

    await user.type(screen.getByLabelText(/title/i), "Printer outage")
    await user.type(screen.getByLabelText(/description/i), "Printer is offline")
    await user.type(
      screen.getByLabelText(/requester contact/i),
      "user@example.com"
    )
    await user.click(screen.getByRole("button", { name: "Create Ticket" }))

    await waitFor(() => {
      expect(createTicketActionMock).toHaveBeenCalledTimes(1)
    })

    const formData = createTicketActionMock.mock.calls[0][0] as FormData
    expect(formData.get("title")).toBe("Printer outage")
    expect(formData.get("description")).toBe("Printer is offline")
    expect(formData.get("requesterContact")).toBe("user@example.com")
    expect(formData.get("customerId")).toBe("customer-1")
    expect(formData.get("priority")).toBe("Medium")
    expect(formData.get("category")).toBe("Other")
    expect(formData.get("intakeChannel")).toBe("Portal")
    expect(formData.get("assetId")).toBe("")
    expect(formData.get("assignedToId")).toBe("")
    expect(refreshMock).toHaveBeenCalledTimes(1)
  })
})
