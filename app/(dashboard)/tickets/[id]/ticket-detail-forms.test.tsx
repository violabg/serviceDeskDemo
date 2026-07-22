// @vitest-environment jsdom

import React from "react"

import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { TicketDetailForms } from "@/app/(dashboard)/tickets/[id]/ticket-detail-forms"

const addTicketNoteActionMock = vi.hoisted(() => vi.fn())
const assignTechnicianActionMock = vi.hoisted(() => vi.fn())
const updateTicketPriorityActionMock = vi.hoisted(() => vi.fn())
const updateTicketStatusActionMock = vi.hoisted(() => vi.fn())
const refreshMock = vi.hoisted(() => vi.fn())

vi.mock("@/app/(dashboard)/tickets/actions", () => ({
  addTicketNoteAction: addTicketNoteActionMock,
  assignTechnicianAction: assignTechnicianActionMock,
  updateTicketPriorityAction: updateTicketPriorityActionMock,
  updateTicketStatusAction: updateTicketStatusActionMock,
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

const technicians = [{ id: "tech-1", name: "Dana", email: "dana@example.com" }]

describe("TicketDetailForms", () => {
  it("allows status updates for manage-only users while keeping write-only actions disabled", () => {
    render(
      <TicketDetailForms
        ticketId="ticket-1"
        status="Closed"
        priority="High"
        assignedToId={null}
        canWrite={false}
        canManage={true}
        technicians={technicians}
      />
    )

    expect(screen.getByRole("button", { name: "Update Status" })).toBeEnabled()
    expect(
      screen.getByRole("button", { name: "Update Priority" })
    ).toBeDisabled()
    expect(screen.getByRole("button", { name: "Assign" })).toBeDisabled()
    expect(screen.getByRole("button", { name: "Add Note" })).toBeDisabled()
  })

  it("submits mutations, refreshes the route, and resets the note field", async () => {
    const user = userEvent.setup()

    render(
      <TicketDetailForms
        ticketId="ticket-1"
        status="Pending"
        priority="Medium"
        assignedToId={null}
        canWrite={true}
        canManage={false}
        technicians={technicians}
      />
    )

    await user.click(screen.getByRole("button", { name: "Update Status" }))
    await user.click(screen.getByRole("button", { name: "Update Priority" }))
    await user.click(screen.getByRole("button", { name: "Assign" }))
    await user.type(
      screen.getByLabelText(/add note/i),
      "Investigating the queue backlog"
    )
    await user.click(screen.getByRole("button", { name: "Add Note" }))

    await waitFor(() => {
      expect(updateTicketStatusActionMock).toHaveBeenCalledTimes(1)
      expect(updateTicketPriorityActionMock).toHaveBeenCalledTimes(1)
      expect(assignTechnicianActionMock).toHaveBeenCalledTimes(1)
      expect(addTicketNoteActionMock).toHaveBeenCalledTimes(1)
    })

    expect(
      (updateTicketStatusActionMock.mock.calls[0][0] as FormData).get("status")
    ).toBe("Pending")
    expect(
      (updateTicketPriorityActionMock.mock.calls[0][0] as FormData).get(
        "priority"
      )
    ).toBe("Medium")
    expect(
      (assignTechnicianActionMock.mock.calls[0][0] as FormData).get(
        "technicianId"
      )
    ).toBe("")
    expect(
      (addTicketNoteActionMock.mock.calls[0][0] as FormData).get("content")
    ).toBe("Investigating the queue backlog")
    await waitFor(() => {
      expect(screen.getByLabelText(/add note/i)).toHaveValue("")
    })
    expect(refreshMock).toHaveBeenCalledTimes(4)
  })
})
