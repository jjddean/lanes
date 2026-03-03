"use client"

import * as React from "react"
import {
  IconCamera,
  IconChartBar,
  IconDashboard,
  IconDatabase,
  IconMessageCircle,
  IconFileAi,
  IconFileDescription,
  IconFileWord,
  IconFolder,
  IconHelp,
  IconInnerShadowTop,
  IconListDetails,
  IconReport,
  IconSearch,
  IconSettings,
  IconUsers,
  IconSparkles,
  IconBrandOpenai,
} from "@tabler/icons-react"

import { NavMain } from "@/app/dashboard/nav-main"
import { NavUser } from "@/app/dashboard/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { ChatMaxingIconColoured } from "@/components/logo"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: IconDashboard,
    },
    {
      title: "Engine",
      url: "/dashboard/engine",
      icon: IconSparkles,
    },
    {
      title: "Lanes",
      url: "/dashboard/leads",
      icon: IconUsers,
    },
    {
      title: "Inbox",
      url: "/dashboard/inbox",
      icon: IconMessageCircle,
    },
    {
      title: "Wins",
      url: "/dashboard/deals",
      icon: IconFileDescription,
    },
    {
      title: "Billing",
      url: "/dashboard/billing",
      icon: IconDatabase,
    },
    {
      title: "Compliance",
      url: "/dashboard/compliance",
      icon: IconFileDescription,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/">
                <ChatMaxingIconColoured className="!size-6" />
                <span className="text-base font-semibold">LanesAI</span>
                <Badge variant="outline" className="text-cyan-600 border-cyan-200 bg-cyan-50 text-xs uppercase tracking-tight">Active Engine</Badge>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
