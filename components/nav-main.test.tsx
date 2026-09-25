// @vitest-environment jsdom

import React from "react"

import { render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { NavMain } from "@/components/nav-main"
import { SidebarProvider } from "@/components/ui/sidebar"

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: React.PropsWithChildren<
    React.AnchorHTMLAttributes<HTMLAnchorElement>
  >) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))
vi.mock("@/components/ui/sidebar", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@/components/ui/sidebar")>()

  return {
    ...actual,
    SidebarMenuButton: ({
      render,
      children,
      tooltip,
      isActive,
      ...props
    }: React.PropsWithChildren<
      React.ButtonHTMLAttributes<HTMLButtonElement> & {
        render?: React.ReactElement
        tooltip?: string
        isActive?: boolean
      }
    >) => {
      const buttonProps = {
        ...props,
        title: tooltip,
        "data-active": isActive ? "" : undefined,
      }

      return render && React.isValidElement(render) ? (
        React.cloneElement(render, buttonProps, children)
      ) : (
        <button {...buttonProps}>{children}</button>
      )
    },
  }
})

const navigationItems = [
  {
    title: "Operations",
    isActive: true,
    items: [
      {
        title: "Tickets",
        url: "/tickets",
        icon: <span aria-hidden="true" data-testid="tickets-icon" />,
        isActive: true,
      },
      {
        title: "Queue",
        url: "/tickets/queue",
        icon: <span aria-hidden="true" data-testid="queue-icon" />,
      },
    ],
  },
  {
    title: "Access Management",
    isActive: true,
    items: [
      {
        title: "Users",
        url: "/users",
        icon: <span aria-hidden="true" data-testid="users-icon" />,
      },
      {
        title: "Roles",
        url: "/roles",
        icon: <span aria-hidden="true" data-testid="roles-icon" />,
        isActive: true,
      },
    ],
  },
]

function mockMatchMedia() {
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockImplementation(() => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }))
  )
}

describe("NavMain", () => {
  beforeEach(() => {
    mockMatchMedia()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("renders every collapsed destination as an icon link with its name and tooltip", async () => {
    render(
      <SidebarProvider defaultOpen={false}>
        <NavMain items={navigationItems} />
      </SidebarProvider>
    )

    const links = screen.getAllByRole("link")
    expect(links).toHaveLength(4)
    expect(links.map((link) => link.getAttribute("aria-label"))).toEqual([
      "Tickets",
      "Queue",
      "Users",
      "Roles",
    ])
    expect(links.map((link) => link.getAttribute("href"))).toEqual([
      "/tickets",
      "/tickets/queue",
      "/users",
      "/roles",
    ])

    expect(links[0]).toContainElement(screen.getByTestId("tickets-icon"))
    expect(links[1]).toContainElement(screen.getByTestId("queue-icon"))
    expect(links[2]).toContainElement(screen.getByTestId("users-icon"))
    expect(links[3]).toContainElement(screen.getByTestId("roles-icon"))
    expect(links[0]).toHaveAttribute("data-active")
    expect(links[3]).toHaveAttribute("data-active")
    expect(links[1]).not.toHaveAttribute("data-active")

    expect(links.map((link) => link.getAttribute("title"))).toEqual([
      "Tickets",
      "Queue",
      "Users",
      "Roles",
    ])
  })

  it("preserves grouped links and visible labels when expanded", () => {
    render(
      <SidebarProvider defaultOpen>
        <NavMain items={navigationItems} />
      </SidebarProvider>
    )

    expect(screen.getByRole("button", { name: "Operations" })).toBeVisible()
    expect(
      screen.getByRole("button", { name: "Access Management" })
    ).toBeVisible()
    expect(screen.getByRole("link", { name: "Tickets" })).toHaveAttribute(
      "href",
      "/tickets"
    )
    expect(screen.getByRole("link", { name: "Queue" })).toHaveAttribute(
      "href",
      "/tickets/queue"
    )
    expect(screen.getByRole("link", { name: "Users" })).toHaveAttribute(
      "href",
      "/users"
    )
    expect(screen.getByRole("link", { name: "Roles" })).toHaveAttribute(
      "href",
      "/roles"
    )
    expect(screen.getByRole("link", { name: "Tickets" })).toHaveAttribute(
      "data-active"
    )
    expect(screen.getByRole("link", { name: "Roles" })).toHaveAttribute(
      "data-active"
    )
  })

  it("renders no destination links for collapsed empty groups", () => {
    render(
      <SidebarProvider defaultOpen={false}>
        <NavMain
          items={[{ title: "Empty" }, { title: "Also Empty", items: [] }]}
        />
      </SidebarProvider>
    )

    expect(screen.queryAllByRole("link")).toHaveLength(0)
  })
})
