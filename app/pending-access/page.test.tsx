// @vitest-environment jsdom

import { render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { PendingAccessPageContent } from "@/app/pending-access/page"

const getSessionMock = vi.hoisted(() => vi.fn())
const getDashboardAccessForSessionUserMock = vi.hoisted(() => vi.fn())
const redirectMock = vi.hoisted(() => vi.fn())
const connectionMock = vi.hoisted(() => vi.fn())

vi.mock("@/lib/auth/server", () => ({
  auth: {
    getSession: getSessionMock,
  },
}))
vi.mock("@/lib/access-control/server", () => ({
  getDashboardAccessForSessionUser: getDashboardAccessForSessionUserMock,
}))
vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}))
vi.mock("next/server", () => ({
  connection: connectionMock,
}))
vi.mock("@/components/auth/logout-button", () => ({
  LogoutButton: () => <button>Log out</button>,
}))

describe("PendingAccessPageContent", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("redirects unauthenticated users to login", async () => {
    const redirectError = new Error("NEXT_REDIRECT")
    getSessionMock.mockResolvedValue({ data: null })
    redirectMock.mockImplementation(() => {
      throw redirectError
    })

    await expect(PendingAccessPageContent()).rejects.toBe(redirectError)
    expect(redirectMock).toHaveBeenCalledWith("/login")
  })

  it("redirects users who already have dashboard access", async () => {
    const redirectError = new Error("NEXT_REDIRECT")
    getSessionMock.mockResolvedValue({ data: { user: { id: "neon-1" } } })
    getDashboardAccessForSessionUserMock.mockResolvedValue({
      canReadDashboard: true,
    })
    redirectMock.mockImplementation(() => {
      throw redirectError
    })

    await expect(PendingAccessPageContent()).rejects.toBe(redirectError)
    expect(redirectMock).toHaveBeenCalledWith("/dashboard")
  })

  it("renders the waiting state for signed-in users without access", async () => {
    getSessionMock.mockResolvedValue({ data: { user: { id: "neon-1" } } })
    getDashboardAccessForSessionUserMock.mockResolvedValue({
      canReadDashboard: false,
    })

    render(await PendingAccessPageContent())

    expect(connectionMock).toHaveBeenCalledTimes(1)
    expect(
      screen.getByText("Your service desk access is not ready yet")
    ).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Log out" })).toBeInTheDocument()
  })
})
