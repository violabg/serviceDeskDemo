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

describe("DashboardBreadcrumbs", () => {
  it("renders mapped labels and humanized fallback labels", () => {
    usePathnameMock.mockReturnValue("/users/user-settings")

    render(<DashboardBreadcrumbs />)

    expect(screen.getByRole("link", { name: "Users" })).toHaveAttribute(
      "href",
      "/users"
    )
    expect(screen.getByText("User Settings")).toHaveAttribute(
      "aria-current",
      "page"
    )
    const list = screen.getByRole("list")
    expect(list.querySelector("li li")).toBeNull()
    expect(
      Array.from(list.children).every((item) => item.tagName === "LI")
    ).toBe(true)
  })

  it("renders nothing for the root path", () => {
    usePathnameMock.mockReturnValue("/")

    const { container } = render(<DashboardBreadcrumbs />)

    expect(container).toBeEmptyDOMElement()
  })
})
