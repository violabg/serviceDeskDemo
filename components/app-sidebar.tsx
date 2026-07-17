"use client"

import * as React from "react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
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
  ChartBarIcon,
  DesktopTowerIcon,
  GaugeIcon,
  GithubLogoIcon,
  IdentificationBadgeIcon,
  IdentificationCardIcon,
  RowsIcon,
  ShieldCheckIcon,
  TicketIcon,
  UsersThreeIcon,
  WaveformIcon,
} from "@phosphor-icons/react"
import Link from "next/link"

const teams = [
  {
    name: "Service Desk",
    logo: <RowsIcon />,
    plan: "Operations",
  },
  {
    name: "Automation Lab",
    logo: <WaveformIcon />,
    plan: "Agentic",
  },
]

const navigationIcons: Record<ServiceDeskNavigationId, React.ReactNode> = {
  dashboard: <GaugeIcon />,
  tickets: <TicketIcon />,
  clients: <UsersThreeIcon />,
  technicians: <IdentificationBadgeIcon />,
  assets: <DesktopTowerIcon />,
  reports: <ChartBarIcon />,
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
        <TeamSwitcher teams={teams} />
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
