"use client"

import * as React from "react"
import {
    IconDashboard,
    IconDatabase,
    IconSettings,
    IconArrowLeft,
    IconActivity,
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
            title: "Admin Console",
            url: "/admin",
            icon: IconSettings,
        },
        {
            title: "System Logs",
            url: "/admin/logs",
            icon: IconActivity,
        },
        {
            title: "Back to App",
            url: "/dashboard",
            icon: IconArrowLeft,
        },
    ],
}

export function AdminSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    return (
        <Sidebar collapsible="offcanvas" {...props} className="border-r border-slate-200">
            <SidebarHeader className="border-b border-slate-100 pb-4">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            className="data-[slot=sidebar-menu-button]:!p-1.5 hover:bg-transparent"
                        >
                            <Link href="/admin">
                                <ChatMaxingIconColoured className="!size-6" />
                                <span className="text-base font-bold text-slate-900 tracking-tight">Admin Portal</span>
                                <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50 text-[10px] uppercase font-bold tracking-wider">Restricted</Badge>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent className="mt-4">
                <NavMain items={data.navMain} />
            </SidebarContent>
            <SidebarFooter className="border-t border-slate-100 pt-4">
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    )
}
