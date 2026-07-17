"use client"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { CaretRightIcon } from "@phosphor-icons/react"
import Link from "next/link"
import * as React from "react"

export function NavMain({
  items,
}: {
  items: {
    title: string
    isActive?: boolean
    items?: {
      title: string
      url: string
      icon?: React.ReactNode
      isActive?: boolean
    }[]
  }[]
}) {
  const [openSections, setOpenSections] = React.useState<
    Record<string, boolean>
  >({})

  React.useEffect(() => {
    setOpenSections((current) => {
      let hasChanged = false
      const next = { ...current }

      for (const item of items) {
        if (item.isActive && !next[item.title]) {
          next[item.title] = true
          hasChanged = true
        }
      }

      return hasChanged ? next : current
    })
  }, [items])

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Service Desk</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <Collapsible
            key={item.title}
            open={openSections[item.title] ?? Boolean(item.isActive)}
            onOpenChange={(open) =>
              setOpenSections((current) => ({
                ...current,
                [item.title]: open,
              }))
            }
            className="group/collapsible"
          >
            <SidebarMenuItem>
              <CollapsibleTrigger
                render={<SidebarMenuButton tooltip={item.title} />}
              >
                <span>{item.title}</span>
                <CaretRightIcon className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  {item.items?.map((subItem) => (
                    <SidebarMenuSubItem key={subItem.title}>
                      <SidebarMenuSubButton
                        isActive={subItem.isActive}
                        render={<Link href={subItem.url} />}
                      >
                        {subItem.icon}
                        <span>{subItem.title}</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
