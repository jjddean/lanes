import { AdminSidebar } from "@/app/admin/admin-sidebar"
import { SiteHeader } from "@/app/dashboard/site-header"
import {
    SidebarInset,
    SidebarProvider,
} from "@/components/ui/sidebar"
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { userId, has } = await auth()
    const isOrgAdmin = Boolean(has?.({ role: "org:admin" }))
    const allowInDev = process.env.NODE_ENV !== "production"

    // Initial gate: Must be logged in
    if (!userId) {
        redirect("/sign-in")
    }

    // Defense-in-depth: keep an explicit server-side role gate in the layout as well.
    // In local development, allow access even without org role to avoid lockout.
    if (!isOrgAdmin && !allowInDev) {
        redirect("/dashboard")
    }

    return (
        <SidebarProvider
            style={
                {
                    "--sidebar-width": "280px",
                    "--header-height": "48px",
                } as React.CSSProperties
            }
            className="group/layout"
        >
            <AdminSidebar variant="inset" />
            <SidebarInset className="bg-slate-50/50">
                <SiteHeader />
                <div className="flex flex-1 flex-col">
                    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                        {children}
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}
