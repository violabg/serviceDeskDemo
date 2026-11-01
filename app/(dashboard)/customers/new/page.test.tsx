// @vitest-environment jsdom

import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { Component, type ReactNode } from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import NewCustomerPage, { NewCustomerContent } from "@/app/(dashboard)/customers/new/page"
import { CustomerForm } from "@/app/(dashboard)/customers/_components/customer-form"
import { permissionKey } from "@/lib/access-control"

const requireCurrentApplicationAccessMock = vi.hoisted(() => vi.fn())
const redirectMock = vi.hoisted(() => vi.fn())
const routerMock = vi.hoisted(() => ({ push: vi.fn(), refresh: vi.fn() }))
const actionsMock = vi.hoisted(() => ({
  createCustomerAction: vi.fn(),
  updateCustomerAction: vi.fn(),
  changeCustomerStatusAction: vi.fn(),
  findDeactivatedMatchesAction: vi.fn(),
}))

vi.mock("@/app/(dashboard)/admin/_lib/current-application-user", () => ({
  requireCurrentApplicationAccess: requireCurrentApplicationAccessMock,
}))
vi.mock("@/app/(dashboard)/customers/actions", () => actionsMock)
vi.mock("next/navigation", () => ({
  redirect: redirectMock,
  useRouter: () => routerMock,
}))

const READ = permissionKey("customers", "read")
const WRITE = permissionKey("customers", "write")
const MANAGE = permissionKey("customers", "manage")

function grant(keys: string[]) {
  requireCurrentApplicationAccessMock.mockResolvedValue({
    user: { id: "user-1" },
    effectivePermissionKeys: keys,
  })
}

async function fillRequiredFields(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText("Company name *"), "Acme")
  await user.type(screen.getByLabelText("Primary contact *"), "Ana Rossi")
  await user.type(screen.getByLabelText("Contact email *"), "ana@acme.com")
}

class ErrorCatcher extends Component<
  { children: ReactNode; onError: (error: unknown) => void },
  { failed: boolean }
> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error: unknown) {
    this.props.onError(error)
  }

  render() {
    return this.state.failed ? <p>Route error boundary</p> : this.props.children
  }
}

describe("NewCustomerContent and the creation form", () => {
  beforeEach(() => {
    vi.resetAllMocks()
    actionsMock.findDeactivatedMatchesAction.mockResolvedValue({ ok: true, matches: [] })
  })

  describe("access gate", () => {
    it("redirects users with none of the customers keys to /dashboard", async () => {
      grant([])
      const redirectError = new Error("NEXT_REDIRECT")
      redirectMock.mockImplementation(() => {
        throw redirectError
      })

      await expect(NewCustomerContent()).rejects.toBe(redirectError)
      expect(redirectMock).toHaveBeenCalledWith("/dashboard")
    })

    it("redirects a read-only holder to /dashboard without rendering the form", async () => {
      grant([READ])
      const redirectError = new Error("NEXT_REDIRECT")
      redirectMock.mockImplementation(() => {
        throw redirectError
      })

      await expect(NewCustomerContent()).rejects.toBe(redirectError)
      expect(redirectMock).toHaveBeenCalledWith("/dashboard")
    })

    it("redirects a manage-only holder to /dashboard because creation needs customers:write", async () => {
      grant([MANAGE])
      const redirectError = new Error("NEXT_REDIRECT")
      redirectMock.mockImplementation(() => {
        throw redirectError
      })

      await expect(NewCustomerContent()).rejects.toBe(redirectError)
      expect(redirectMock).toHaveBeenCalledWith("/dashboard")
    })

    it("renders the New Customer heading outside the content boundary on the page", () => {
      render(<NewCustomerPage />)

      expect(screen.getByRole("heading", { name: "New Customer" })).toBeInTheDocument()
      expect(document.querySelector('[data-slot="skeleton"]')).not.toBeNull()
    })

    it("renders the create form with enabled inputs and submit control for a write-only holder", async () => {
      grant([WRITE])

      render(await NewCustomerContent())

      expect(redirectMock).not.toHaveBeenCalled()
      expect(screen.getByLabelText("Company name *")).toBeEnabled()
      expect(screen.getByLabelText("Contact email *")).toBeEnabled()
      expect(screen.getByRole("button", { name: "Create Customer" })).toBeEnabled()
    })

    it("renders the create form with enabled inputs and submit control for a writer", async () => {
      grant([READ, WRITE])

      render(await NewCustomerContent())

      expect(screen.getByLabelText("Company name *")).toBeEnabled()
      expect(screen.getByLabelText("Primary contact *")).toBeEnabled()
      expect(screen.getByLabelText("Contact email *")).toBeEnabled()
      expect(screen.getByLabelText("Phone")).toBeEnabled()
      expect(screen.getByLabelText("Operational notes")).toBeEnabled()
      expect(screen.getByRole("button", { name: "Create Customer" })).toBeEnabled()
    })

    it("renders the same form disabled, with no enabled submit control, without customers:write", () => {
      render(
        <CustomerForm
          mode="create"
          canWrite={false}
          canManage={false}
        />
      )

      expect(screen.getByLabelText("Company name *")).toBeDisabled()
      expect(screen.getByLabelText("Primary contact *")).toBeDisabled()
      expect(screen.getByLabelText("Contact email *")).toBeDisabled()
      expect(screen.getByLabelText("Phone")).toBeDisabled()
      expect(screen.getByLabelText("Operational notes")).toBeDisabled()
      expect(screen.getByRole("button", { name: "Create Customer" })).toBeDisabled()
    })

    it("does not render a status choice in create mode", async () => {
      grant([READ, WRITE])

      render(await NewCustomerContent())

      expect(screen.queryByLabelText("Status *")).not.toBeInTheDocument()
    })

    it("renders empty fields in create mode even when initialValues are passed", () => {
      render(
        <CustomerForm
          mode="create"
          canWrite
          canManage={false}
          initialValues={{ company: "Acme", name: "Ana Rossi", email: "ana@acme.com", status: "Deactivated" }}
        />
      )

      expect(screen.getByLabelText("Company name *")).toHaveValue("")
      expect(screen.getByLabelText("Primary contact *")).toHaveValue("")
      expect(screen.getByLabelText("Contact email *")).toHaveValue("")
    })

    it("renders the New Customer title and the Create Customer label with no Cancel control in create mode", async () => {
      grant([READ, WRITE])

      render(await NewCustomerContent())

      expect(screen.getByText("New Customer", { selector: "h2" })).toBeInTheDocument()
      expect(screen.getByRole("button", { name: "Create Customer" })).toBeEnabled()
      expect(screen.queryByRole("button", { name: "Save Customer" })).not.toBeInTheDocument()
      expect(screen.queryByRole("button", { name: "Cancel" })).not.toBeInTheDocument()
      expect(document.querySelector('a[href^="/customers/"][href*="edit=true"]')).toBeNull()
    })
  })

  describe("submission through createCustomerAction", () => {
    it("submits the typed fields with the Active status through createCustomerAction", async () => {
      grant([READ, WRITE])
      actionsMock.createCustomerAction.mockResolvedValue({ ok: false, reason: "invalid" })
      const user = userEvent.setup()
      render(await NewCustomerContent())

      await fillRequiredFields(user)
      await user.click(screen.getByRole("button", { name: "Create Customer" }))

      await waitFor(() => expect(actionsMock.createCustomerAction).toHaveBeenCalledTimes(1))
      const formData = actionsMock.createCustomerAction.mock.calls[0][0] as FormData
      expect(formData.get("company")).toBe("Acme")
      expect(formData.get("name")).toBe("Ana Rossi")
      expect(formData.get("email")).toBe("ana@acme.com")
      expect(formData.get("status")).toBe("Active")
      expect(formData.has("customerId")).toBe(false)
    })

    it("shows the required-field message and does not call the action when the company is empty", async () => {
      grant([READ, WRITE])
      const user = userEvent.setup()
      render(await NewCustomerContent())

      await user.type(screen.getByLabelText("Primary contact *"), "Ana Rossi")
      await user.type(screen.getByLabelText("Contact email *"), "ana@acme.com")
      await user.click(screen.getByRole("button", { name: "Create Customer" }))

      expect(await screen.findByText("Company name is required")).toBeInTheDocument()
      expect(actionsMock.createCustomerAction).not.toHaveBeenCalled()
    })

    it("does not call the action when the email does not match the format", async () => {
      grant([READ, WRITE])
      const user = userEvent.setup()
      render(await NewCustomerContent())

      await user.type(screen.getByLabelText("Company name *"), "Acme")
      await user.type(screen.getByLabelText("Primary contact *"), "Ana Rossi")
      await user.type(screen.getByLabelText("Contact email *"), "not-an-email")
      await user.click(screen.getByRole("button", { name: "Create Customer" }))

      await waitFor(() => expect(actionsMock.createCustomerAction).not.toHaveBeenCalled())
      expect(routerMock.push).not.toHaveBeenCalled()
    })

    it("shows the duplicate message and stays on the page when the action returns duplicate", async () => {
      grant([READ, WRITE])
      actionsMock.createCustomerAction.mockResolvedValue({ ok: false, reason: "duplicate" })
      const user = userEvent.setup()
      render(await NewCustomerContent())

      await fillRequiredFields(user)
      await user.click(screen.getByRole("button", { name: "Create Customer" }))

      expect(
        await screen.findByText("An active Customer already uses this company and email.")
      ).toBeInTheDocument()
      expect(routerMock.push).not.toHaveBeenCalled()
    })

    it("shows the reactivation hint with the matching record and its Reactivate button for a writer who can manage", async () => {
      grant([READ, WRITE, MANAGE])
      actionsMock.createCustomerAction.mockResolvedValue({
        ok: false,
        reason: "reactivation",
        matches: [{ id: "customer-old", company: "Acme", name: "Ana Rossi", email: "ana@acme.com" }],
      })
      const user = userEvent.setup()
      render(await NewCustomerContent())

      await fillRequiredFields(user)
      await user.click(screen.getByRole("button", { name: "Create Customer" }))

      expect(
        await screen.findByText("A deactivated match exists. Reactivate that record instead.")
      ).toBeInTheDocument()
      expect(screen.getByText("Acme · Ana Rossi · ana@acme.com")).toBeInTheDocument()
      const reactivate = await screen.findByRole("button", { name: "Reactivate" })
      await waitFor(() => expect(reactivate).toBeEnabled())
    })

    it("reactivates the matching record through changeCustomerStatusAction and opens its details page", async () => {
      grant([READ, WRITE, MANAGE])
      actionsMock.createCustomerAction.mockResolvedValue({
        ok: false,
        reason: "reactivation",
        matches: [{ id: "customer-old", company: "Acme", name: "Ana Rossi", email: "ana@acme.com" }],
      })
      actionsMock.changeCustomerStatusAction.mockResolvedValue({ ok: true })
      const user = userEvent.setup()
      render(await NewCustomerContent())

      await fillRequiredFields(user)
      await user.click(screen.getByRole("button", { name: "Create Customer" }))
      const reactivate = await screen.findByRole("button", { name: "Reactivate" })
      await waitFor(() => expect(reactivate).toBeEnabled())
      await user.click(reactivate)

      await waitFor(() => expect(routerMock.push).toHaveBeenCalledWith("/customers/customer-old"))
      const formData = actionsMock.changeCustomerStatusAction.mock.calls[0][0] as FormData
      expect(formData.get("customerId")).toBe("customer-old")
      expect(formData.get("action")).toBe("reactivate")
    })

    it("shows a read-only hint instead of the Reactivate button for a writer who cannot manage", async () => {
      grant([READ, WRITE])
      actionsMock.createCustomerAction.mockResolvedValue({
        ok: false,
        reason: "reactivation",
        matches: [{ id: "customer-old", company: "Acme", name: "Ana Rossi", email: "ana@acme.com" }],
      })
      const user = userEvent.setup()
      render(await NewCustomerContent())

      await fillRequiredFields(user)
      await user.click(screen.getByRole("button", { name: "Create Customer" }))

      expect(await screen.findByText("Ask a Customer manager to reactivate this record.")).toBeInTheDocument()
      expect(screen.queryByRole("button", { name: "Reactivate" })).not.toBeInTheDocument()
    })

    it("redirects to the details page of the new customer after a successful create", async () => {
      grant([READ, WRITE])
      actionsMock.createCustomerAction.mockResolvedValue({
        ok: true,
        customer: { id: "customer-new" },
      })
      const user = userEvent.setup()
      render(await NewCustomerContent())

      await fillRequiredFields(user)
      await user.click(screen.getByRole("button", { name: "Create Customer" }))

      await waitFor(() => expect(routerMock.push).toHaveBeenCalledWith("/customers/customer-new"))
      expect(routerMock.refresh).toHaveBeenCalled()
    })

    it("propagates a rejection of createCustomerAction to the error boundary and does not redirect", async () => {
      grant([READ, WRITE])
      const failure = new Error("create action failed")
      actionsMock.createCustomerAction.mockRejectedValue(failure)
      const onError = vi.fn()
      const user = userEvent.setup()
      render(
        <ErrorCatcher onError={onError}>
          {await NewCustomerContent()}
        </ErrorCatcher>
      )

      await fillRequiredFields(user)
      await user.click(screen.getByRole("button", { name: "Create Customer" }))

      await waitFor(() => expect(onError).toHaveBeenCalledWith(failure))
      expect(actionsMock.createCustomerAction).toHaveBeenCalledTimes(1)
      expect(routerMock.push).not.toHaveBeenCalled()
    })

    it("keeps the form on the page and does not redirect when the action returns invalid", async () => {
      grant([READ, WRITE])
      actionsMock.createCustomerAction.mockResolvedValue({ ok: false, reason: "invalid" })
      const user = userEvent.setup()
      render(await NewCustomerContent())

      await fillRequiredFields(user)
      await user.click(screen.getByRole("button", { name: "Create Customer" }))

      expect(await screen.findByText("Check the Customer fields and try again.")).toBeInTheDocument()
      expect(screen.getByLabelText("Company name *")).toHaveValue("Acme")
      expect(routerMock.push).not.toHaveBeenCalled()
    })
  })

  describe("pre-submit reactivation lookup", () => {
    it("calls findDeactivatedMatchesAction once with the typed company and email when both fields lose focus", async () => {
      grant([READ, WRITE, MANAGE])
      const user = userEvent.setup()
      render(await NewCustomerContent())

      await user.type(screen.getByLabelText("Company name *"), "Acme")
      await user.tab()
      await user.type(screen.getByLabelText("Contact email *"), "ana@acme.com")
      await user.tab()

      await waitFor(() => expect(actionsMock.findDeactivatedMatchesAction).toHaveBeenCalledTimes(1))
      expect(actionsMock.findDeactivatedMatchesAction).toHaveBeenCalledWith("Acme", "ana@acme.com")
    })

    it("shows the hint with the matching Deactivated customer in another letter case and its Reactivate button before submission", async () => {
      grant([READ, WRITE, MANAGE])
      actionsMock.findDeactivatedMatchesAction.mockResolvedValue({
        ok: true,
        matches: [{ id: "customer-old", company: "ACME", name: "Ana Rossi", email: "Ana@Acme.com" }],
      })
      const user = userEvent.setup()
      render(await NewCustomerContent())

      await user.type(screen.getByLabelText("Company name *"), "acme")
      await user.type(screen.getByLabelText("Contact email *"), "ANA@acme.com")
      await user.tab()

      expect(await screen.findByText("ACME · Ana Rossi · Ana@Acme.com")).toBeInTheDocument()
      expect(screen.getByRole("button", { name: "Reactivate" })).toBeEnabled()
      expect(actionsMock.createCustomerAction).not.toHaveBeenCalled()
    })

    it("shows no hint and keeps the submit control enabled when the lookup rejects", async () => {
      grant([READ, WRITE, MANAGE])
      actionsMock.findDeactivatedMatchesAction.mockRejectedValue(new Error("lookup failed"))
      const user = userEvent.setup()
      render(await NewCustomerContent())

      await user.type(screen.getByLabelText("Company name *"), "Acme")
      await user.type(screen.getByLabelText("Contact email *"), "ana@acme.com")
      await user.tab()

      await waitFor(() => expect(actionsMock.findDeactivatedMatchesAction).toHaveBeenCalledTimes(1))
      await waitFor(() => expect(screen.queryByRole("button", { name: "Reactivate" })).not.toBeInTheDocument())
      expect(screen.getByRole("button", { name: "Create Customer" })).toBeEnabled()
    })

    it("never runs the lookup for a reader, even when company and email are already filled", async () => {
      render(
        <CustomerForm
          mode="create"
          canWrite={false}
          canManage={false}
          initialValues={{ company: "Acme", email: "ana@acme.com" }}
        />
      )

      fireEvent.blur(screen.getByLabelText("Company name *"))
      fireEvent.blur(screen.getByLabelText("Contact email *"))

      await waitFor(() => expect(screen.getByRole("button", { name: "Create Customer" })).toBeDisabled())
      expect(actionsMock.findDeactivatedMatchesAction).not.toHaveBeenCalled()
    })
  })
})
