// @vitest-environment jsdom

import React from "react"

import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { NewTicketForm } from "@/app/(dashboard)/tickets/new/new-ticket-form"

const createTicketActionMock = vi.hoisted(() => vi.fn())
const checkDuplicateTicketActionMock = vi.hoisted(() => vi.fn())
const refreshMock = vi.hoisted(() => vi.fn())
const pushMock = vi.hoisted(() => vi.fn())

vi.mock("@/app/(dashboard)/tickets/actions", () => ({
  createTicketAction: createTicketActionMock,
  checkDuplicateTicketAction: checkDuplicateTicketActionMock,
}))
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: refreshMock, push: pushMock }),
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
vi.mock("@/components/ui/select", () => {
  type SelectState = {
    items: Array<{ value: string; label: string }>
    value?: string
    onValueChange?: (value: string) => void
  }
  const SelectContext = React.createContext<SelectState>({ items: [] })

  return {
    Select: ({
      children,
      items = [],
      value,
      onValueChange,
    }: {
      children: React.ReactNode
      items?: Array<{ value: string; label: string }>
      value?: string
      onValueChange?: (value: string) => void
    }) => (
      <SelectContext.Provider value={{ items, value, onValueChange }}>
        <div>{children}</div>
      </SelectContext.Provider>
    ),
    SelectContent: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
    SelectGroup: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
    SelectItem: ({
      children,
      value,
    }: {
      children: React.ReactNode
      value: string
    }) => {
      const { onValueChange } = React.useContext(SelectContext)
      return (
        <button type="button" onClick={() => onValueChange?.(value)}>
          {children}
        </button>
      )
    },
    SelectTrigger: ({
      children,
      ...props
    }: React.HTMLAttributes<HTMLDivElement>) => <div {...props}>{children}</div>,
    SelectValue: ({ placeholder }: { placeholder?: string }) => {
      // Mirrors Base UI: the trigger shows the item label for the selected value.
      const { items, value } = React.useContext(SelectContext)
      const label = items.find((item) => item.value === value)?.label
      return <span>{label ?? placeholder}</span>
    },
  }
})

const customers = [
  {
    id: "customer-1",
    name: "Acme Corp",
    email: "it@acme.test",
    company: "Acme",
  },
]

describe("NewTicketForm", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

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
      ok: true,
      reason: null,
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

  it("submits the form, normalizes optional IDs, and navigates to the created ticket", async () => {
    const user = userEvent.setup()
    createTicketActionMock.mockResolvedValue({
      ok: true,
      reason: null,
      ticketId: "ticket-1",
    })

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
    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith("/tickets/ticket-1")
    })
    expect(refreshMock).not.toHaveBeenCalled()
  })

  it("shows the failure reason and stays on the form when creation fails", async () => {
    const user = userEvent.setup()
    createTicketActionMock.mockResolvedValue({ ok: false, reason: "invalid" })

    render(<NewTicketForm customers={customers} assets={[]} technicians={[]} />)

    await user.type(screen.getByLabelText(/title/i), "Printer outage")
    await user.type(screen.getByLabelText(/description/i), "Printer is offline")
    await user.type(
      screen.getByLabelText(/requester contact/i),
      "user@example.com"
    )
    await user.click(screen.getByRole("button", { name: "Create Ticket" }))

    expect(
      await screen.findByText("The submitted data is not valid.")
    ).toBeInTheDocument()
    expect(pushMock).not.toHaveBeenCalled()
    expect(refreshMock).toHaveBeenCalledTimes(1)
  })

  it("shows the forbidden reason instead of a duplicate result when the duplicate check is refused", async () => {
    const user = userEvent.setup()
    checkDuplicateTicketActionMock.mockResolvedValue({
      ok: false,
      reason: "forbidden",
      duplicate: false,
    })

    render(<NewTicketForm customers={customers} assets={[]} technicians={[]} />)

    await user.type(screen.getByLabelText(/title/i), "VPN outage")
    await user.type(screen.getByLabelText(/description/i), "Users cannot connect")
    await user.type(
      screen.getByLabelText(/requester contact/i),
      "user@example.com"
    )
    await user.click(screen.getByRole("button", { name: "Check Duplicate" }))

    expect(
      await screen.findByText("You do not have permission to do this.")
    ).toBeInTheDocument()
    expect(
      screen.queryByText(/no duplicate detected for this customer/i)
    ).not.toBeInTheDocument()
    expect(
      screen.queryByText(/similar ticket found in the last 24h/i)
    ).not.toBeInTheDocument()
  })

  it("shows the invalid reason when the duplicate check returns invalid for an empty title", async () => {
    const user = userEvent.setup()
    checkDuplicateTicketActionMock.mockResolvedValue({
      ok: false,
      reason: "invalid",
      duplicate: false,
    })

    render(<NewTicketForm customers={customers} assets={[]} technicians={[]} />)

    await user.type(screen.getByLabelText(/title/i), "VPN outage")
    await user.type(screen.getByLabelText(/description/i), "Users cannot connect")
    await user.type(
      screen.getByLabelText(/requester contact/i),
      "user@example.com"
    )
    await user.click(screen.getByRole("button", { name: "Check Duplicate" }))

    expect(
      await screen.findByText("The submitted data is not valid.")
    ).toBeInTheDocument()
    expect(
      screen.queryByText(/no duplicate detected for this customer/i)
    ).not.toBeInTheDocument()
  })

  it("shows the not-found reason when the duplicate check returns not-found for an unknown customer", async () => {
    const user = userEvent.setup()
    checkDuplicateTicketActionMock.mockResolvedValue({
      ok: false,
      reason: "not-found",
      duplicate: false,
    })

    render(<NewTicketForm customers={customers} assets={[]} technicians={[]} />)

    await user.type(screen.getByLabelText(/title/i), "VPN outage")
    await user.type(screen.getByLabelText(/description/i), "Users cannot connect")
    await user.type(
      screen.getByLabelText(/requester contact/i),
      "user@example.com"
    )
    await user.click(screen.getByRole("button", { name: "Check Duplicate" }))

    expect(
      await screen.findByText("The selected record could not be found.")
    ).toBeInTheDocument()
    expect(
      screen.queryByText(/no duplicate detected for this customer/i)
    ).not.toBeInTheDocument()
  })

  it("shows the no-duplicate message when the duplicate check succeeds with duplicate false", async () => {
    const user = userEvent.setup()
    checkDuplicateTicketActionMock.mockResolvedValue({
      ok: true,
      reason: null,
      duplicate: false,
    })

    render(<NewTicketForm customers={customers} assets={[]} technicians={[]} />)

    await user.type(screen.getByLabelText(/title/i), "VPN outage")
    await user.type(screen.getByLabelText(/description/i), "Users cannot connect")
    await user.type(
      screen.getByLabelText(/requester contact/i),
      "user@example.com"
    )
    await user.click(screen.getByRole("button", { name: "Check Duplicate" }))

    expect(
      await screen.findByText("No duplicate detected for this customer.")
    ).toBeInTheDocument()
  })

  it("labels a customer with its company in the trigger and the option", () => {
    const { container } = render(
      <NewTicketForm customers={customers} assets={[]} technicians={[]} />
    )

    const trigger = container.querySelector("#ticket-customer")
    expect(trigger).toHaveTextContent("Acme Corp (Acme)")
    expect(
      screen.getAllByRole("button", { name: "Acme Corp (Acme)" })
    ).toHaveLength(1)
  })

  it("labels a customer without a company by name only", () => {
    const { container } = render(
      <NewTicketForm
        customers={[
          { id: "customer-2", name: "Beta Srl", email: null, company: null },
        ]}
        assets={[]}
        technicians={[]}
      />
    )

    expect(container.querySelector("#ticket-customer")?.textContent).toBe(
      "Beta Srl"
    )
    expect(screen.getByRole("button", { name: "Beta Srl" })).toBeInTheDocument()
  })

  it("shows the default customer's label instead of its ID", () => {
    const { container } = render(
      <NewTicketForm customers={customers} assets={[]} technicians={[]} />
    )

    const trigger = container.querySelector("#ticket-customer")
    expect(trigger).toHaveTextContent("Acme Corp (Acme)")
    expect(trigger).not.toHaveTextContent("customer-1")
  })

  it("keeps the customer ID as the submitted value after another customer is chosen", async () => {
    const user = userEvent.setup()
    checkDuplicateTicketActionMock.mockClear()
    checkDuplicateTicketActionMock.mockResolvedValue({
      ok: true,
      reason: null,
      duplicate: false,
    })

    const { container } = render(
      <NewTicketForm
        customers={[
          ...customers,
          { id: "customer-2", name: "Beta Srl", email: null, company: null },
        ]}
        assets={[]}
        technicians={[]}
      />
    )

    await user.click(screen.getByRole("button", { name: "Beta Srl" }))

    expect(container.querySelector("#ticket-customer")?.textContent).toBe(
      "Beta Srl"
    )

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
    expect(formData.get("customerId")).toBe("customer-2")
  })

  it("shows the placeholder when there are no customers", () => {
    const { container } = render(
      <NewTicketForm customers={[]} assets={[]} technicians={[]} />
    )

    expect(container.querySelector("#ticket-customer")?.textContent).toBe(
      "Select customer"
    )
  })
})
