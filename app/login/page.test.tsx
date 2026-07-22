// @vitest-environment jsdom

import React from "react"

import { render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { LoginPageContent } from "@/app/login/page"

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
vi.mock("@/components/auth/neon-auth-ui-provider", () => ({
  NeonAuthUiProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}))
vi.mock("@neondatabase/auth/react", () => ({
  AuthView: ({ path }: { path: string }) => <div>Auth view: {path}</div>,
}))

describe("LoginPageContent", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders the sign-in view for unauthenticated users", async () => {
    getSessionMock.mockResolvedValue({ data: null })

    render(await LoginPageContent())

    expect(connectionMock).toHaveBeenCalledTimes(1)
    expect(screen.getByText("Auth view: sign-in")).toBeInTheDocument()
  })

  it("redirects authenticated users without dashboard access", async () => {
    const redirectError = new Error("NEXT_REDIRECT")
    getSessionMock.mockResolvedValue({ data: { user: { id: "neon-1" } } })
    getDashboardAccessForSessionUserMock.mockResolvedValue({
      canReadDashboard: false,
    })
    redirectMock.mockImplementation(() => {
      throw redirectError
    })

    await expect(LoginPageContent()).rejects.toBe(redirectError)
    expect(redirectMock).toHaveBeenCalledWith("/pending-access")
  })
})
