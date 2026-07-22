// @vitest-environment jsdom

import React from "react"

import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { DashboardBreadcrumbs } from "@/components/dashboard-breadcrumbs"

const usePathnameMock = vi.hoisted(() => vi.fn())

vi.mock("next/navigation", () => ({ usePathname: usePathnameMock }))
vi.mock("next/link", () => ({
  default: ({
    href,
    children,
  }: {
    href: string
    children: React.ReactNode
  }) => <a href={href}>{children}</a>,
}))
vi.mock("@/components/ui/breadcrumb", () => ({
  Breadcrumb: ({ children }: { children: React.ReactNode }) => (
    <nav>{children}</nav>
  ),
  BreadcrumbList: ({ children }: { children: React.ReactNode }) => (
    <ol>{children}</ol>
  ),
  BreadcrumbItem: ({ children }: { children: React.ReactNode }) => (
    <li>{children}</li>
  ),
  BreadcrumbSeparator: () => <span>/</span>,
  BreadcrumbPage: ({ children }: { children: React.ReactNode }) => (
    <span data-testid="current-crumb">{children}</span>
  ),
  BreadcrumbLink: ({
    children,
    render,
  }: {
    children: React.ReactNode
    render?: React.ReactElement
  }) =>
    render && React.isValidElement(render) ? (
      React.cloneElement(render, undefined, children)
    ) : (
      <a>{children}</a>
    ),
}))

describe("DashboardBreadcrumbs", () => {
  it("renders mapped labels and humanized fallback labels", () => {
    usePathnameMock.mockReturnValue("/admin/users/user-settings")

    render(<DashboardBreadcrumbs />)

    expect(screen.getByRole("link", { name: "Admin" })).toHaveAttribute(
      "href",
      "/admin"
    )
    expect(screen.getByRole("link", { name: "Users" })).toHaveAttribute(
      "href",
      "/admin/users"
    )
    expect(screen.getByTestId("current-crumb")).toHaveTextContent(
      "User Settings"
    )
  })

  it("renders nothing for the root path", () => {
    usePathnameMock.mockReturnValue("/")

    const { container } = render(<DashboardBreadcrumbs />)

    expect(container).toBeEmptyDOMElement()
  })
})
