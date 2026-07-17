"use client"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import Link from "next/link"
import { usePathname } from "next/navigation"

const segmentLabelMap: Record<string, string> = {
  dashboard: "Dashboard",
  admin: "Admin",
  users: "Users",
  roles: "Roles",
}

function toLabel(segment: string) {
  return (
    segmentLabelMap[segment] ??
    segment
      .replace(/[-_]+/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase())
  )
}

export function DashboardBreadcrumbs() {
  const pathname = usePathname()

  const segments = pathname
    .split("/")
    .filter(Boolean)
    .filter((segment) => segment !== "(dashboard)")

  if (segments.length === 0) {
    return null
  }

  const crumbs = segments.map((segment, index) => {
    const href = `/${segments.slice(0, index + 1).join("/")}`

    return {
      href,
      label: toLabel(segment),
      isLast: index === segments.length - 1,
    }
  })

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {crumbs.map((crumb, index) => (
          <BreadcrumbItem key={crumb.href}>
            {crumb.isLast ? (
              <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
            ) : (
              <>
                <BreadcrumbLink render={<Link href={crumb.href} />}>
                  {crumb.label}
                </BreadcrumbLink>
                {index < crumbs.length - 1 ? <BreadcrumbSeparator /> : null}
              </>
            )}
          </BreadcrumbItem>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
