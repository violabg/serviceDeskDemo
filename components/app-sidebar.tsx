"use client"

import * as React from "react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import type { ServiceDeskNavigationId } from "@/lib/service-desk-navigation"
import { getReadableServiceDeskNavigation } from "@/lib/service-desk-navigation"
import {
  GithubLogoIcon,
  IdentificationBadgeIcon,
  IdentificationCardIcon,
  RowsIcon,
  ShieldCheckIcon,
} from "@phosphor-icons/react"
import Link from "next/link"

const navigationIcons: Record<ServiceDeskNavigationId, React.ReactNode> = {
  users: <IdentificationCardIcon />,
  roles: <ShieldCheckIcon />,
}

type SidebarUser = {
  name: string
  email: string
  avatar?: string
}

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  user?: SidebarUser | null
  effectivePermissionKeys?: string[]
}

export function AppSidebar({
  user,
  effectivePermissionKeys = [],
  ...props
}: AppSidebarProps) {
  const navItems = getReadableServiceDeskNavigation(
    new Set(effectivePermissionKeys)
  ).map((item) => ({
    ...item,
    icon: navigationIcons[item.id],
  }))

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="data-open:bg-sidebar-accent data-open:text-sidebar-accent-foreground"
              render={<Link href="/dashboard" />}
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <RowsIcon />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">Service Desk</span>
                <span className="truncate text-xs">Operations</span>
              </div>
              <IdentificationBadgeIcon className="ml-auto" />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
      </SidebarContent>
      <SidebarFooter>
        {user ? (
          <NavUser user={user} />
        ) : (
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                size="lg"
                tooltip="Log in"
                render={<Link href="/login" />}
              >
                <GithubLogoIcon weight="fill" />
                <span>Log in</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        )}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
