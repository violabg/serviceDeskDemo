// @vitest-environment jsdom

import React from "react"

import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { AppSidebar } from "@/components/app-sidebar"
import { permissionKey } from "@/lib/access-control"

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
vi.mock("@/components/nav-user", () => ({
  NavUser: ({ user }: { user: { email: string } }) => <div>{user.email}</div>,
}))
vi.mock("@/components/nav-main", () => ({
  NavMain: ({
    items,
  }: {
    items: Array<{
      title: string
      items: Array<{ id: string; title: string; isActive: boolean }>
    }>
  }) => (
    <div>
      {items.map((group) => (
        <section key={group.title}>
          <h2>{group.title}</h2>
          {group.items.map((item) => (
            <div
              key={item.id}
              data-testid={`nav-item-${item.id}`}
              data-active={item.isActive ? "true" : "false"}
            >
              {item.title}
            </div>
          ))}
        </section>
      ))}
    </div>
  ),
}))
vi.mock("@/components/ui/sidebar", () => ({
  Sidebar: ({ children }: { children: React.ReactNode }) => (
    <aside>{children}</aside>
  ),
  SidebarContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  SidebarFooter: ({ children }: { children: React.ReactNode }) => (
    <footer>{children}</footer>
  ),
  SidebarHeader: ({ children }: { children: React.ReactNode }) => (
    <header>{children}</header>
  ),
  SidebarMenu: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  SidebarMenuItem: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  SidebarMenuButton: ({
    children,
    render,
  }: {
    children: React.ReactNode
    render?: React.ReactElement
  }) =>
    render && React.isValidElement(render) ? (
      React.cloneElement(render, undefined, children)
    ) : (
      <button>{children}</button>
    ),
  SidebarRail: () => null,
}))

describe("AppSidebar", () => {
  it("shows only readable navigation items for the current permissions", () => {
    usePathnameMock.mockReturnValue("/tickets")

    render(
      <AppSidebar
        user={{ name: "Dana", email: "dana@example.com" }}
        effectivePermissionKeys={[permissionKey("tickets", "read")]}
      />
    )

    expect(screen.getByText("Tickets")).toBeInTheDocument()
    expect(screen.queryByText("Users")).not.toBeInTheDocument()
    expect(screen.queryByText("Roles")).not.toBeInTheDocument()
  })

  it("marks nested routes as active", () => {
    usePathnameMock.mockReturnValue("/admin/users/user-1")

    render(
      <AppSidebar
        user={{ name: "Dana", email: "dana@example.com" }}
        effectivePermissionKeys={[
          permissionKey("users", "read"),
          permissionKey("roles", "read"),
        ]}
      />
    )

    expect(screen.getByTestId("nav-item-users")).toHaveAttribute(
      "data-active",
      "true"
    )
    expect(screen.getByTestId("nav-item-roles")).toHaveAttribute(
      "data-active",
      "false"
    )
  })

  it("shows the login CTA when there is no signed-in user", () => {
    usePathnameMock.mockReturnValue("/login")

    render(<AppSidebar user={null} effectivePermissionKeys={[]} />)

    expect(screen.getByText("Log in")).toBeInTheDocument()
  })
})
